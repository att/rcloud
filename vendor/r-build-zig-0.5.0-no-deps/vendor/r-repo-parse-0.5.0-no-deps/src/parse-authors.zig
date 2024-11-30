const std = @import("std");
const cmdline = @import("cmdline");
const mos = @import("mos");
const mosql = @import("mosql");
const StringStorage = @import("string_storage.zig").StringStorage;
const Authors = @import("Authors.zig");

const Options = .{
    .{ "db", 0 }, // suppress -d option
    .{ "force", false },
    .{ "help", false },
    .{ "info", false },
    .{ "packages", false, 0 },
    .{"parse"},
    .{ "sql", false, 0 },
    .{ "verbose", false },
};

const DB_FILE = "parse-authors.db";
var _force = false;
var _info = false;
var _sql = false;
var _verbose = false;

const usage =
    \\Usage: parse-authors [options] <packages-file>
    \\       parse-authors [options] --parse <authors@r code>
    \\
    \\where <packages-file> may be plain text or gzipped file containing
    \\one or more Package stanzas with an Authors@R field.
    \\
    \\Options:
    \\  --db <file>            Change default SQLite3 db filename [parse-authors.db]
    \\  --force, -f            Overwrite existing db file if it exists
    \\  --help, -h             Display help
    \\  --info, -i             Display info messages to stderr (in addition to warn and error).
    \\                         Only effective if --verbose is set.
    \\  --packages             Print names of packages with valid Authors@R fields to stdout
    \\  --parse, -p <string>   Instead of parsing a file, parse the argument
    \\  --sql                  For --parse, output SQL instead of plain text.
    \\                         Requires 'sqlite3' on path.
    \\  --verbose, -v          Enable verbose logging
    \\
;

pub fn main() !void {
    var arena = std.heap.ArenaAllocator.init(std.heap.page_allocator);
    defer arena.deinit();
    const alloc = arena.allocator();

    var options = try cmdline.Options(.{}).init(alloc, Options);
    defer options.deinit();
    switch (options.parse()) {
        .err => |e| {
            std.debug.print("{!s}\n", .{e.toMessage(alloc)});
            std.debug.print("{s}", .{usage});
            std.process.exit(1);
        },
        else => {},
    }
    if (options.present("help")) {
        std.debug.print("{s}", .{usage});
        std.process.exit(0);
    }
    if (options.present("force")) {
        _force = true;
    }
    if (options.present("info")) {
        _info = true;
    }
    if (options.present("sql")) {
        _sql = true;
    }
    if (options.present("verbose")) {
        _verbose = true;
    }

    // set up Authors
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();
    var authors = Authors.init(alloc);
    defer authors.deinit();

    if (options.get("parse")) |in| {
        // dispatch to alternate workflow
        return do_parse(alloc, &authors, &strings, in);
    }

    if (options.positional().len < 1) {
        std.debug.print("error: must provide at least one file argument\n", .{});
        std.debug.print("{s}", .{usage});
        std.process.exit(1);
    }

    const db_file = b: {
        if (options.get("db")) |x| break :b x;
        break :b DB_FILE;
    };

    log("using db file: {s}\n", .{db_file});

    // test access to existing file
    const file_exists = b: {
        std.fs.cwd().access(db_file, .{}) catch |err| switch (err) {
            error.FileNotFound => break :b false,
            else => {},
        };
        break :b true;
    };

    if (!_force and file_exists) {
        std.debug.print("error: file '{s}' already exists. Pass --force to overwrite.\n", .{db_file});
        std.process.exit(1);
    } else if (_force and file_exists) {
        std.debug.print("warning: overwriting file '{s}'\n", .{db_file});
    }

    // open db
    var conn = try mosql.Connection.open(db_file);
    defer {
        var timer = std.time.Timer.start() catch null;
        conn.close_wait();
        if (timer) |*t| {
            log("closing database took {}ms\n", .{@divFloor(t.lap(), 1_000_000)});
        }
    }

    // init db
    try create_tables(conn);

    // read files
    var timer = try std.time.Timer.start();
    for (options.positional()) |file| {
        try read_file(alloc, &authors, &strings, file);
        log("Parsing '{s}' took {}ms\n", .{ file, @divFloor(timer.lap(), 1_000_000) });
    }

    // summary stats
    if (_verbose)
        authors.db.debugPrintInfo();

    // dump to db
    timer.reset();
    try dump_authors_db(conn, &authors.db);
    log("Dumping database took {}ms\n", .{@divFloor(timer.lap(), 1_000_000)});

    // dump package names
    if (options.present("packages")) {
        const stdout = std.io.getStdOut().writer();
        for (authors.db.package_names.data.items) |name| {
            try stdout.print("{s}\n", .{name});
        }
    }
}

fn do_parse(alloc: std.mem.Allocator, authors: *Authors, strings: *StringStorage, in: []const u8) !void {
    const source = try std.fmt.allocPrint(alloc,
        \\Package: command-line-input
        \\Authors@R: {s}
        \\
    , .{in});
    defer alloc.free(source);

    const parse_log = try authors.read(source, strings);

    for (parse_log) |x| switch (x.tag) {
        .warn, .err => log("{}\n", .{x}),
        .info => if (_info) log("{}\n", .{x}),
    };

    if (_sql) {
        // TODO seems like std should have this somewhere other than std.testing
        var tmpdir = std.testing.tmpDir(.{});
        defer tmpdir.cleanup();
        const tmpdirpath = try tmpdir.dir.realpathAlloc(alloc, ".");
        defer alloc.free(tmpdirpath);
        const tmppath = try std.fs.path.join(alloc, &.{ tmpdirpath, "parse.db" });
        defer alloc.free(tmppath);

        var conn = try mosql.Connection.open(tmppath);
        defer conn.close_wait();
        try create_tables(conn);
        try dump_authors_db(conn, &authors.db);

        const result = try std.process.Child.run(.{
            .allocator = alloc,
            .argv = &.{ "sqlite3", tmppath, ".dump" },
        });
        defer {
            alloc.free(result.stderr);
            alloc.free(result.stdout);
        }

        std.debug.print("{s}", .{result.stdout});
    } else {
        authors.db.debugPrint();
    }
}

fn create_tables(conn: mosql.Connection) !void {
    // set recommended security settings for untrusted databases.
    try conn.exec(

    // don't need write ahead log
    // \\PRAGMA journal_mode=WAL;

        \\PRAGMA foreign_keys=1;
        \\PRAGMA trusted_schema=0;
        \\PRAGMA enable_view=0;
        \\PRAGMA enable_trigger=0;
        \\PRAGMA defensive=1;
        \\PRAGMA dqs_dml=0;
        \\PRAGMA dqs_ddl=0;
    );
    try conn.exec(
        \\BEGIN;
        \\DROP TABLE IF EXISTS person_role;
        \\DROP TABLE IF EXISTS person_value;
        \\DROP TABLE IF EXISTS person;
        \\DROP TABLE IF EXISTS package;
        \\DROP TABLE IF EXISTS role;
        \\DROP TABLE IF EXISTS attribute;
        \\COMMIT;
        \\
        \\CREATE TABLE person (
        \\  id INTEGER PRIMARY KEY
        \\);
        \\
        \\CREATE TABLE attribute (
        \\  id INTEGER PRIMARY KEY
        \\, name TEXT NOT NULL
        \\);
        \\
        \\CREATE TABLE role (
        \\  id INTEGER PRIMARY KEY
        \\, name TEXT NOT NULL
        \\);
        \\
        \\CREATE TABLE package (
        \\  id INTEGER PRIMARY KEY
        \\, name TEXT NOT NULL
        \\);
        \\
        \\CREATE TABLE person_value (
        \\  id INTEGER PRIMARY KEY
        \\, person_id INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE
        \\, package_id INTEGER NOT NULL REFERENCES package(id) ON DELETE CASCADE
        \\, attribute_id INTEGER NOT NULL REFERENCES attribute(id) ON DELETE CASCADE
        \\, text TEXT NOT NULL
        \\);
        \\
        \\CREATE TABLE person_role (
        \\  id INTEGER PRIMARY KEY
        \\, person_id INTEGER NOT NULL REFERENCES person(id) ON DELETE CASCADE
        \\, package_id INTEGER NOT NULL REFERENCES package(id) ON DELETE CASCADE
        \\, role_id INTEGER NOT NULL REFERENCES role(id) ON DELETE CASCADE
        \\);
    );

    try insert_roles(conn);
}

fn insert_roles(conn: mosql.Connection) !void {
    var role = try mosql.Statement.init(
        conn,
        "INSERT INTO ROLE(id, name) VALUES(?,?)",
    );
    defer role.deinit();

    try conn.begin();
    for (1..@intFromEnum(Authors.Role.last)) |i| {
        try role.reset();
        role.bind_int(1, @intCast(i));
        role.bind_text(2, Authors.Role.toString(@enumFromInt(i)));
        step_one(&role);
    }
    try conn.commit();
}

fn read_file(alloc: std.mem.Allocator, authors: *Authors, strings: *StringStorage, path: []const u8) !void {
    std.fs.cwd().access(path, .{}) catch |err| {
        std.debug.print("error: could not access '{s}': {s}\n", .{ path, @errorName(err) });
        return;
    };

    log("reading file '{s}'\n", .{path});

    const source: ?[]const u8 = try mos.file.readFileMaybeGzip(alloc, path);
    try std.testing.expect(source != null);
    defer if (source) |s| alloc.free(s);

    if (source) |source_| {
        const parse_log = try authors.read(source_, strings);

        for (parse_log) |x| switch (x.tag) {
            .warn, .err => log("{}\n", .{x}),
            .info => if (_info) log("{}\n", .{x}),
        };
    } else {
        std.debug.print("error: could not read '{s}'\n", .{path});
        return;
    }
}

fn dump_authors_db(conn: mosql.Connection, db: *const Authors.AuthorsDB) !void {
    var attribute = try mosql.Statement.init(
        conn,
        "INSERT INTO attribute(id, name) VALUES(?,?)",
    );
    defer attribute.deinit();

    var package = try mosql.Statement.init(
        conn,
        "INSERT INTO package(id, name) VALUES(?,?)",
    );
    defer package.deinit();

    var person_id = try mosql.Statement.init(conn, "INSERT INTO person(id) VALUES(?)");
    defer person_id.deinit();

    var person_attr = try mosql.Statement.init(
        conn,
        "INSERT INTO person_value(person_id, package_id, attribute_id, text) VALUES(?,?,?,?)",
    );
    defer person_attr.deinit();

    var person_role = try mosql.Statement.init(
        conn,
        "INSERT INTO person_role(person_id, package_id, role_id) VALUES(?,?,?)",
    );
    defer person_role.deinit();

    // attribute_names
    try conn.begin();
    for (db.attribute_names.data.items, 0..) |x, id| {
        try attribute.reset();
        attribute.bind_int(1, @intCast(id));
        attribute.bind_text(2, x);
        step_one(&attribute);
    }
    try conn.commit();

    // package_names
    try conn.begin();
    for (db.package_names.data.items, 0..) |x, id| {
        if (id % 1000 == 0) {
            try conn.commit();
            try conn.begin();
        }
        try package.reset();
        package.bind_int(1, @intCast(id));
        package.bind_text(2, x);
        step_one(&package);
    }
    try conn.commit();

    // person_ids
    try conn.begin();
    for (0..db.person_ids._next.int()) |id| {
        if (id % 1000 == 0) {
            try conn.commit();
            try conn.begin();
        }
        try person_id.reset();
        person_id.bind_int(1, @intCast(id));
        step_one(&person_id);
    }
    try conn.commit();

    // person_values
    try conn.begin();
    for (db.person_strings.data.data.items, 0..) |x, i| {
        if (i % 1000 == 0) {
            try conn.commit();
            try conn.begin();
        }
        try person_attr.reset();
        person_attr.bind_int(1, x.person_id.int());
        person_attr.bind_int(2, x.package_id.int());
        person_attr.bind_int(3, x.attribute_id.int());
        person_attr.bind_text(4, x.value);
        step_one(&person_attr);
    }
    try conn.commit();

    // person_roles
    try conn.begin();
    for (db.person_roles.data.data.items, 0..) |x, i| {
        if (i % 1000 == 0) {
            try conn.commit();
            try conn.begin();
        }
        try person_role.reset();
        person_role.bind_int(1, x.person_id.int());
        person_role.bind_int(2, x.package_id.int());
        person_role.bind_int(3, @intFromEnum(x.value));
        step_one(&person_role);
    }
    try conn.commit();
}

fn log(comptime fmt: []const u8, args: anytype) void {
    if (_verbose)
        std.debug.print(fmt, args);
}

fn step_one(stmt: *mosql.Statement) void {
    const res = stmt.step() catch |err| {
        std.debug.print("error: statement: {s}\n", .{@errorName(err)});
        std.process.exit(1);
    };
    if (res != .done) {
        std.debug.print("error: statement expected done\n", .{});
        std.process.exit(1);
    }
}

test {
    _ = std.testing.refAllDeclsRecursive(@This());
}
