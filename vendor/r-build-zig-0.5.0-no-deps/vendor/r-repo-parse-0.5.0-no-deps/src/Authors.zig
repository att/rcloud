// This file is part of r-repo-parse.
//
// Copyright (C) 2024 <https://codeberg.org/mocompute>
//
// r-repo-parse is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// r-repo-parse is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

alloc: Allocator,
db: AuthorsDB,

pub const LogType = enum { info, warn, err };
pub const LogInfoTag = enum {
    package,
    authors_at_r,
    no_authors_at_r,
};
pub const LogWarnTag = enum {
    no_package,
    expected_function,
    expected_person,
    unknown_role_code,
    multiple_authors_r_fields,
};
pub const LogErrTag = enum {
    package,
    authors_at_r_wrong_type,
    rlang_parse_error,
    expected_string,
    expected_string_or_identifier,
    named_argument_in_role,
    unsupported_function_call,
    too_many_arguments,
};
pub const LogTag = union(LogType) {
    info: LogInfoTag,
    warn: LogWarnTag,
    err: LogErrTag,
};
pub const LogItem = struct {
    message: []const u8 = "",
    loc: usize = 0,
    extra: union(enum) {
        none: void,
        string: []const u8,
        rlang_parse_err: RParser.ErrLoc,
    } = .none,
    tag: LogTag,

    pub fn format(self: LogItem, comptime fmt: []const u8, options: std.fmt.FormatOptions, w: anytype) !void {
        _ = fmt;
        _ = options;

        try switch (self.tag) {
            .info => |x| switch (x) {
                .package => w.print("info: Package '{s}' declared", .{self.message}),
                .authors_at_r => w.print("info: Package '{s}': field Authors@R seen", .{self.message}),
                .no_authors_at_r => w.print("info: Package '{s}': no Authors@R field", .{self.message}),
            },
            .warn => |x| switch (x) {
                .no_package => w.print("warn: no package found in stanza", .{}),
                .expected_function => w.print("warn: Package '{s}': expected c() or person() function call in Authors@R field (loc {})", .{ self.message, self.loc }),
                .expected_person => w.print("warn: Package '{s}': expected person() in Authors@R field (loc {})", .{ self.message, self.loc }),
                .unknown_role_code => w.print("warn: Package '{s}': unknown role code '{s}' (loc {})", .{ self.message, self.extra.string, self.loc }),
                .multiple_authors_r_fields => w.print("warn: Package '{s}': multiple Authors@R fields (loc {})", .{ self.message, self.loc }),
            },
            .err => |x| switch (x) {
                .package => w.print("error: could not parse package name: {s} (loc {})", .{ self.message, self.loc }),
                .authors_at_r_wrong_type => w.print("error: Package '{s}': Authors@R parsed to wrong type (loc {})", .{ self.message, self.loc }),
                .rlang_parse_error => w.print("error: Package '{s}' R lang parser error: {} at location {}", .{ self.message, self.extra.rlang_parse_err.err, self.loc }),
                .expected_string => w.print("error: Package '{s}': expected string (loc {})", .{ self.message, self.loc }),
                .expected_string_or_identifier => w.print("error: Package '{s}': expected string or identifier (loc {})", .{ self.message, self.loc }),
                .named_argument_in_role => w.print("error: Package '{s}': named argument not supported in role vector (loc {})", .{ self.message, self.loc }),
                .unsupported_function_call => w.print("error: Package '{s}': unsupported function call (loc {})", .{ self.message, self.loc }),
                .too_many_arguments => w.print("error: Package '{s}': too many positional arguments (loc {})", .{ self.message, self.loc }),
            },
        };
    }
};

const LogItems = std.ArrayList(LogItem);

pub fn init(alloc: Allocator) Authors {
    return .{
        .alloc = alloc,
        .db = try AuthorsDB.init(alloc),
    };
}

pub fn deinit(self: *Authors) void {
    self.db.deinit();
    self.* = undefined;
}

pub const AuthorsDB = struct {
    alloc: Allocator,
    person_ids: Storage(PersonId, PersonId),
    person_strings: PersonAttributes([]const u8),
    person_roles: PersonAttributes(Role),
    attribute_names: Storage([]const u8, AttributeId),
    package_names: Storage([]const u8, PackageId),

    /// Prefer to use ArenaAllocator as the parser is leaky.
    pub fn init(alloc: Allocator) !AuthorsDB {
        return .{
            .alloc = alloc,
            .person_ids = Storage(PersonId, PersonId).init(alloc),
            .person_strings = try PersonAttributes([]const u8).init(alloc),
            .person_roles = try PersonAttributes(Role).init(alloc),
            .attribute_names = Storage([]const u8, AttributeId).init(alloc),
            .package_names = Storage([]const u8, PackageId).init(alloc),
        };
    }
    pub fn deinit(self: *AuthorsDB) void {
        self.person_ids.deinit();
        self.person_strings.deinit();
        self.person_roles.deinit();
        self.attribute_names.deinit();
        self.package_names.deinit();
        self.* = undefined;
    }
    pub fn debugPrintInfo(self: *const AuthorsDB) void {
        std.debug.print("Packages with Authors@R: {}\n", .{self.package_names.data.items.len});
        std.debug.print("Persons: {}\n", .{self.person_ids._next});
        std.debug.print("String attributes: {}\n", .{self.person_strings.data.data.items.len});
        std.debug.print("Role attributes: {}\n", .{self.person_roles.data.data.items.len});
    }
    pub fn debugPrint(self: *const AuthorsDB) void {
        std.debug.print("\nAttributes:\n", .{});
        for (self.attribute_names.data.items, 0..) |x, id|
            std.debug.print("  {}: {s}\n", .{ id, x });

        std.debug.print("\nPackages:\n", .{});
        for (self.package_names.data.items, 0..) |x, id|
            std.debug.print("  {}: {s}\n", .{ id, x });

        std.debug.print("\nPersons:\n", .{});
        std.debug.print("  Count: {}\n", .{self.person_ids._next});

        std.debug.print("\nPerson strings:\n", .{});
        for (self.person_strings.data.data.items, 0..) |x, id|
            std.debug.print(
                "  {}: (package_id {}) (person_id {}) (attr_id {}) (value {s})\n",
                .{
                    id,
                    x.package_id,
                    x.person_id,
                    x.attribute_id,
                    x.value,
                },
            );

        std.debug.print("\nPerson roles:\n", .{});
        for (self.person_roles.data.data.items, 0..) |x, id|
            std.debug.print(
                "  {}: (package_id {}) (person_id {}) (attr_id {}) (value {})\n",
                .{
                    id,
                    x.package_id,
                    x.person_id,
                    x.attribute_id,
                    x.value,
                },
            );
    }

    pub fn nextPersonId(self: *AuthorsDB) PersonId {
        return self.person_ids.nextId();
    }

    const PutContext = struct {
        fa: FunctionArg,
        loc: usize,
        attribute_id: AttributeId,
        package_id: PackageId,
        package_name: []const u8,
        person_id: PersonId,
        log: *LogItems,
    };

    /// Leaky, prefer to use an ArenaAllocator.
    pub fn addFromFunctionCall(
        self: *AuthorsDB,
        fc: FunctionCall,
        loc: usize,
        package_name: []const u8,
        log: *LogItems,
    ) !void {
        assert(std.mem.eql(u8, "person", fc.name));

        const package_id = self.package_names.lookupString(package_name) orelse b: {
            const id = self.package_names.nextId();
            try self.package_names.put(id, package_name);
            break :b id;
        };

        // person (given = NULL, family = NULL, middle = NULL, email = NULL,
        //     role = NULL, comment = NULL, first = NULL, last = NULL)

        // each person function allocates a new person id. we don't
        // deduplicate because anyway how?
        const person_id = self.nextPersonId();

        var context: PutContext = .{
            .fa = undefined,
            .loc = loc,
            .attribute_id = undefined,
            .package_id = package_id,
            .package_name = package_name,
            .person_id = person_id,
            .log = log,
        };

        for (fc.positional, 1..) |fa, pos| {
            var string_value: ?[]const u8 = null;
            context.fa = fa;

            switch (pos) {
                1 => {
                    context.attribute_id = try self.attributeId("given");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                2 => {
                    context.attribute_id = try self.attributeId("family");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                3 => {
                    context.attribute_id = try self.attributeId("middle");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                4 => {
                    context.attribute_id = try self.attributeId("email");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                5 => {
                    context.attribute_id = try self.attributeId("role");
                    try self.putRole(context);
                },

                6 => {
                    context.attribute_id = try self.attributeId("comment");
                    try self.putComment(context);
                },

                7 => {
                    context.attribute_id = try self.attributeId("first");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                8 => {
                    context.attribute_id = try self.attributeId("last");
                    string_value = switch (fa) {
                        .string => |s| s,
                        else => null,
                    };
                },
                else => {
                    try logErr(log, .too_many_arguments, 0, package_name);
                    break;
                },
            }

            if (string_value) |s|
                try self.putNewString(context, s);
        } // positional arguments

        for (fc.named) |na| {
            // person (given = NULL, family = NULL, middle = NULL, email = NULL,
            //     role = NULL, comment = NULL, first = NULL, last = NULL)

            context.fa = na.value;

            if (std.mem.startsWith(u8, na.name, "c")) { // comment
                context.attribute_id = try self.attributeId("comment");
                try self.putComment(context);
            } else if (std.mem.startsWith(u8, na.name, "r")) { // "role"
                context.attribute_id = try self.attributeId("role");
                try self.putRole(context);
            } else {
                // named arguments can be shortest unique substring of
                // defined arguments in person():
                const mapped_name = mapNamedArgument(na.name);
                context.attribute_id = try self.attributeId(mapped_name);
                try self.putAny(context, mapped_name);
            }
        } // named arguments
    }

    fn putComment(self: *AuthorsDB, ctx: PutContext) !void {
        switch (ctx.fa) {
            .string => |s| try self.putNewString(ctx, s),
            .identifier => |s| {
                // ignore named arguments with null value
                if (std.mem.eql(u8, "NULL", s)) return;

                // treat other identifier values as string
                try self.putNewString(ctx, s);
            },
            .function_call => |fc| if (std.mem.eql(u8, "c", fc.name)) {
                for (fc.positional) |fa_| switch (fa_) {
                    .string => |s| try self.putNewString(ctx, s),
                    else => {
                        try logErr(ctx.log, .expected_string, ctx.loc, ctx.package_name);
                        break;
                    },
                };
                for (fc.named) |na| {
                    var ctx_ = ctx;
                    ctx_.attribute_id = try self.attributeId(na.name);
                    ctx_.fa = na.value;
                    switch (na.value) {
                        .string, .identifier => |s| try self.putNewString(ctx_, s),
                        .function_call => |cfc| if (std.mem.eql(u8, "c", cfc.name)) {
                            // comment = c(ORCID = c("123")).
                            // recurse
                            try self.putComment(ctx_);
                        },
                        .null => {},
                    }
                }
            } else {
                try logErr(ctx.log, .unsupported_function_call, ctx.loc, ctx.package_name);
            },
            .null => {},
        }
    }

    fn putRole(self: *AuthorsDB, ctx: PutContext) !void {
        switch (ctx.fa) {
            .string, .identifier => |s| switch (Role.fromString(s)) {
                .unknown => {
                    try logUnknownRole(ctx.log, ctx.loc, ctx.package_name, s);
                    try self.putExtraRole(ctx.package_id, ctx.person_id, s);
                },
                else => |code| try self.putNewRole(ctx, code),
            },

            .function_call => |role_fc| if (std.mem.eql(u8, "c", role_fc.name)) {
                for (role_fc.positional) |fa_| switch (fa_) {
                    .string, .identifier => |s| switch (Role.fromString(s)) {
                        .unknown => {
                            try logUnknownRole(ctx.log, ctx.loc, ctx.package_name, s);
                            try self.putExtraRole(ctx.package_id, ctx.person_id, s);
                        },
                        else => |code| try self.putNewRole(ctx, code),
                    },
                    else => try logErr(ctx.log, .expected_string_or_identifier, ctx.loc, ctx.package_name),
                };

                for (role_fc.named) |_|
                    try logErr(ctx.log, .named_argument_in_role, ctx.loc, ctx.package_name);
            },
            .null => {},
        }
    }

    fn putAny(self: *AuthorsDB, ctx: PutContext, attribute_name: []const u8) !void {
        if (std.mem.eql(u8, "comment", attribute_name)) {
            try self.putComment(ctx);
            return;
        } else if (std.mem.eql(u8, "role", attribute_name)) {
            try self.putRole(ctx);
            return;
        }
        switch (ctx.fa) {
            .string => |s| try self.putNewString(ctx, s),
            .identifier => |s| {
                // ignore named arguments with null value
                if (std.mem.eql(u8, "NULL", s)) return;

                // treat other identifier values as string
                try self.putNewString(ctx, s);
            },
            .function_call => |other_fc|
            // support vector of attribute values by appending index to attribute name
            if (std.mem.eql(u8, "c", other_fc.name))
                for (other_fc.positional, 1..) |fa_, pos| switch (fa_) {
                    .string, .identifier => |s| {
                        // TODO: identifier as string too permissive?
                        if (pos == 1) {
                            // use unindexed name for first element
                            try self.putNewString(ctx, s);
                        } else {
                            // make an indexed name and use it
                            var buf: [512]u8 = undefined;
                            var ctx_ = ctx;
                            const indexed_name = try std.fmt.bufPrint(&buf, "{s}{}", .{ attribute_name, pos });
                            ctx_.attribute_id = try self.attributeId(try self.alloc.dupe(u8, indexed_name));
                            try self.putNewString(ctx_, s);
                        }
                    },
                    else => try logErr(ctx.log, .expected_string, ctx.loc, ctx.package_name),
                },
            .null => {},
        }
    }

    fn mapNamedArgument(name: []const u8) []const u8 {
        // person (given = NULL, family = NULL, middle = NULL, email = NULL,
        //     role = NULL, comment = NULL, first = NULL, last = NULL)
        const startsWith = std.mem.startsWith;
        if (startsWith(u8, name, "g")) {
            return "given";
        } else if (startsWith(u8, name, "fa")) {
            return "family";
        } else if (startsWith(u8, name, "m")) {
            return "middle";
        } else if (startsWith(u8, name, "e")) {
            return "email";
        } else if (startsWith(u8, name, "r")) {
            return "role";
        } else if (startsWith(u8, name, "c")) {
            return "comment";
        } else if (startsWith(u8, name, "fi")) {
            return "first";
        } else if (startsWith(u8, name, "l")) {
            return "last";
        }
        return name;
    }

    fn attributeId(self: *AuthorsDB, name: []const u8) !AttributeId {
        return self.attribute_names.lookupString(name) orelse b: {
            const id = self.attribute_names.nextId();
            try self.attribute_names.put(id, name);
            break :b id;
        };
    }

    fn putNewString(
        self: *AuthorsDB,
        ctx: PutContext,
        value: []const u8,
    ) !void {
        try self.person_strings.put(self.person_strings.data.nextId(), .{
            .package_id = ctx.package_id,
            .person_id = ctx.person_id,
            .attribute_id = ctx.attribute_id,
            .value = value,
        });
    }

    fn putNewRole(
        self: *AuthorsDB,
        ctx: PutContext,
        value: Role,
    ) !void {
        try self.person_roles.put(self.person_roles.data.nextId(), .{
            .package_id = ctx.package_id,
            .person_id = ctx.person_id,
            .attribute_id = ctx.attribute_id,
            .value = value,
        });
    }

    /// For roles that are not part of R's standard. See
    /// MARC_relator_db_codes_used_with_R and MARC_R_usage:
    /// https://github.com/r-devel/r-svn/blob/c20ebd2d417d9ebb915e32bfb0bfdad768f9a80a/src/library/utils/R/sysdata.R#L28C1-L39
    fn putExtraRole(
        self: *AuthorsDB,
        package_id: PackageId,
        person_id: PersonId,
        value: []const u8,
    ) !void {
        const S = struct {
            var extra_role: ?AttributeId = null; // static
        };
        if (S.extra_role == null) {
            S.extra_role = try self.attributeId("extra_role");
        }

        if (S.extra_role) |attr_id| {
            try self.person_strings.put(self.person_strings.data.nextId(), .{
                .package_id = package_id,
                .person_id = person_id,
                .attribute_id = attr_id,
                .value = value,
            });
        } else unreachable;
    }
};

fn PersonAttribute(comptime T: type) type {
    return struct {
        package_id: PackageId,
        person_id: PersonId,
        attribute_id: AttributeId,
        value: T,
    };
}

/// Storage for PersonAttributes
fn PersonAttributes(comptime T: type) type {
    return struct {
        /// field may be accessed directly for read-only operations, but
        /// use methods for destructive ops.
        data: Storage(ValueType, IdType),

        const ValueType = PersonAttribute(T);
        const IdType = PersonAttributeId;

        pub fn init(alloc: Allocator) !@This() {
            return .{
                .data = Storage(ValueType, IdType).init(alloc),
            };
        }
        pub fn deinit(self: *@This()) void {
            self.data.deinit();
            self.* = undefined;
        }
        pub fn put(self: *@This(), id: IdType, value: ValueType) !void {
            try self.data.put(id, value);
        }

        /// Return next record matching person_id, starting at id
        /// from_id. From_id will be updated to point to record after
        /// the one returned.
        pub fn nextAttribute(self: @This(), person_id: PersonId, from_id: *IdType) ?PersonAttribute {
            var index = from_id.*;
            const items = self.data.data.items;
            while (index < items.len) : (index += 1)
                if (items[index].person_id == person_id) {
                    from_id.* = index + 1;
                    return items[index];
                };

            return null;
        }
    };
}

fn Storage(comptime T: type, comptime IdType: type) type {
    return struct {
        data: std.ArrayList(T),
        _next: IdType = @enumFromInt(0),

        pub fn init(alloc: Allocator) @This() {
            return .{
                .data = std.ArrayList(T).init(alloc),
            };
        }
        pub fn deinit(self: *@This()) void {
            self.data.deinit();
            self.* = undefined;
        }
        pub fn nextId(self: *@This()) IdType {
            assert(@intFromEnum(self._next) != maxInt(IdType));
            const out = self._next;
            self._next = @enumFromInt(@intFromEnum(self._next) + 1);
            return out;
        }
        pub fn put(self: *@This(), id: IdType, value: T) !void {
            assert(@intFromEnum(self._next) != maxInt(IdType));
            const new_len = @intFromEnum(id) + 1;
            if (self.data.items.len < new_len)
                try self.data.resize(new_len);

            self.data.items[@intFromEnum(id)] = value;
        }
        pub fn get(self: @This(), id: IdType) !T {
            if (id < self.data.items.len) return self.data.items[id];
            return error.OutOfRange;
        }
        pub fn lookup(self: @This(), value: T) ?IdType {
            for (self.data.items, 0..) |x, index|
                if (std.meta.eql(x, value)) return @intCast(index);

            return null;
        }
        pub fn lookupString(self: @This(), value: []const u8) ?IdType {
            for (self.data.items, 0..) |x, index|
                if (std.mem.eql(u8, x, value)) return @enumFromInt(index);

            return null;
        }
    };
}

const AttributeId = enum(u16) {
    _,
    pub fn int(self: @This()) @typeInfo(@This()).@"enum".tag_type {
        return @intFromEnum(self);
    }
};
const PersonAttributeId = enum(u32) {
    _,
    pub fn int(self: @This()) @typeInfo(@This()).@"enum".tag_type {
        return @intFromEnum(self);
    }
};
const PersonId = enum(u32) {
    _,
    pub fn int(self: @This()) @typeInfo(@This()).@"enum".tag_type {
        return @intFromEnum(self);
    }
};
const PackageId = enum(u32) {
    _,
    pub fn int(self: @This()) @typeInfo(@This()).@"enum".tag_type {
        return @intFromEnum(self);
    }
};

fn maxInt(Id: type) @typeInfo(Id).@"enum".tag_type {
    return std.math.maxInt(@typeInfo(Id).@"enum".tag_type);
}

pub const Role = enum(u8) {
    unknown, // must be first
    author,
    compiler,
    contributor,
    copyright_holder,
    creator,
    thesis_advisor,
    translator,
    contractor,
    data_contributor,
    funder,
    reviewer,
    last, // must be last

    pub fn fromString(s: []const u8) Role {
        const eql = std.ascii.eqlIgnoreCase;
        if (eql(s, "aut")) {
            return .author;
        } else if (eql(s, "com")) {
            return .compiler;
        } else if (eql(s, "ctb")) {
            return .contributor;
        } else if (eql(s, "cph")) {
            return .copyright_holder;
        } else if (eql(s, "cre")) {
            return .creator;
        } else if (eql(s, "ths")) {
            return .thesis_advisor;
        } else if (eql(s, "trl")) {
            return .translator;
        } else if (eql(s, "ctr")) {
            return .contractor;
        } else if (eql(s, "dtc")) {
            return .translator;
        } else if (eql(s, "fnd")) {
            return .translator;
        } else if (eql(s, "rev")) {
            return .reviewer;
        } else {
            return .unknown;
        }
    }

    /// Undefined for .unknown and .last.
    pub fn toString(self: Role) []const u8 {
        return switch (self) {
            .author => "aut",
            .compiler => "com",
            .contributor => "ctb",
            .copyright_holder => "cph",
            .creator => "cre",
            .thesis_advisor => "ths",
            .translator => "trl",
            .contractor => "ctr",
            .data_contributor => "dtc",
            .funder => "fnd",
            .reviewer => "rev",
            .unknown, .last => unreachable,
        };
    }
};

/// Caller owns returned slice, which is allocated with Author's allocator.
pub fn read(self: *Authors, source: []const u8, strings: *StringStorage) ![]LogItem {
    const eql = std.ascii.eqlIgnoreCase;

    var log = LogItems.init(self.alloc);
    defer log.deinit();

    // arena for the RParser
    var arena = std.heap.ArenaAllocator.init(self.alloc);
    defer arena.deinit();
    const alloc = arena.allocator();

    // parse DCF
    var parser = Parser.init(arena.allocator(), strings);
    defer parser.deinit();
    try parser.parse(source);

    // iterate through parsed stanzas.

    const nodes = parser.nodes.items;
    var index: usize = 0;
    var package_name: ?[]const u8 = null;
    var prev_package_name: ?[]const u8 = null;
    var authors_source: ?[]const u8 = null;
    while (true) : (index += 1) switch (nodes[index]) {
        .eof => break,
        .stanza_end => {
            // parse authors field if any
            if (authors_source) |auth_source| {
                var rtokenizer = RTokenizer.init(auth_source, strings);
                defer rtokenizer.deinit();
                var rparser = RParser.init(alloc, &rtokenizer, strings);
                defer rparser.deinit();

                switch (try rparser.next()) {
                    .ok => |ok| switch (ok.node) {
                        .function_call => |fc|
                        // outer function can be c() or person()
                        if (std.mem.eql(u8, "c", fc.name)) {
                            for (fc.positional) |fa|
                                try self.outerCArgument(fa, ok.loc, package_name.?, &log);

                            // named arguments in c(), ignore the names
                            for (fc.named) |na|
                                try self.outerCArgument(na.value, ok.loc, package_name.?, &log);
                        } else if (std.mem.eql(u8, "person", fc.name)) {
                            try self.db.addFromFunctionCall(fc, ok.loc, package_name.?, &log);
                        } else {
                            try logWarn(&log, .expected_function, ok.loc, package_name.?);
                        },

                        .function_arg => try logWarn(&log, .expected_function, ok.loc, package_name.?),
                    },
                    .err => |e| try logParseError(&log, e, package_name),
                }
            } else if (package_name) |pname| {
                try logInfo(&log, .no_authors_at_r, 0, pname);
            } else {
                try logWarn(&log, .no_package, 0, "");
            }

            // reset package name and authors_source
            prev_package_name = package_name;
            package_name = null;
            authors_source = null;
        },
        .field => |field| if (eql("package", field.name)) {
            package_name = parsePackageName(nodes, &index, strings) catch |err| {
                try logErr(&log, .package, 0, @errorName(err));
                continue;
            };
            try logInfo(&log, .package, 0, package_name.?);
        } else if (eql("authors@r", field.name)) {
            // save authors@r field data to process at end of stanza.
            if (authors_source != null) try logWarn(&log, .multiple_authors_r_fields, 0, package_name orelse "<unknown>");
            try logInfo(&log, .authors_at_r, 0, package_name orelse "<unknown>");

            index += 1;
            switch (nodes[index]) {
                .string_node => |s| authors_source = s.value,
                else => try logErr(&log, .authors_at_r_wrong_type, 0, package_name orelse "<unknown>"),
            }
        },
        else => {},
    };
    return try log.toOwnedSlice();
}

/// Returns true if rest of stanza should be skipped
fn outerCArgument(self: *Authors, fa: FunctionArg, loc: usize, package_name: []const u8, log: *LogItems) !void {
    switch (fa) {
        .function_call => |c_fc| if (std.mem.eql(u8, "person", c_fc.name)) {
            try self.db.addFromFunctionCall(c_fc, loc, package_name, log);
        } else {
            try logWarn(log, .expected_person, loc, package_name);
        },
        else => {
            try logWarn(log, .expected_function, loc, package_name);
        },
    }
}

fn logParseError(log: *LogItems, e: RParser.ErrLoc, package_name: ?[]const u8) !void {
    try log.append(.{ .tag = .{ .err = .rlang_parse_error }, .message = package_name orelse "<unknown>", .loc = e.loc, .extra = .{ .rlang_parse_err = e } });
}
fn logUnknownRole(log: *LogItems, loc: usize, package_name: []const u8, role: []const u8) !void {
    try log.append(.{ .tag = .{ .warn = .unknown_role_code }, .message = package_name, .loc = loc, .extra = .{ .string = role } });
}

fn logInfo(log: *LogItems, tag: LogInfoTag, loc: usize, package_name: []const u8) !void {
    try log.append(.{ .tag = .{ .info = tag }, .message = package_name, .loc = loc });
}
fn logWarn(log: *LogItems, tag: LogWarnTag, loc: usize, package_name: []const u8) !void {
    try log.append(.{ .tag = .{ .warn = tag }, .message = package_name, .loc = loc });
}
fn logErr(log: *LogItems, tag: LogErrTag, loc: usize, package_name: []const u8) !void {
    try log.append(.{ .tag = .{ .err = tag }, .message = package_name, .loc = loc });
}

fn parsePackageName(nodes: []Parser.Node, idx: *usize, strings: *StringStorage) ![]const u8 {
    idx.* += 1;
    switch (nodes[idx.*]) {
        .name_and_version => |nv| return try strings.append(nv.name),

        // expect .name_and_version immediately after .field for a Package field
        else => unreachable,
    }
}

test "Authors" {
    var arena = std.heap.ArenaAllocator.init(std.testing.allocator);
    defer arena.deinit();
    const alloc = arena.allocator();

    const source =
        \\Package: one
        \\Type: Package
        \\Title: Project Environments
        \\Version: 1.0.7.9000
        \\Authors@R: c(
        \\    person("Kevin", "Ushey", role = c("aut", "cre"), email = "kevin@rstudio.com",
        \\           comment = c(ORCID = "0000-0003-2880-7407")),
        \\    person("Hadley", "Wickham", role = c("aut"), email = "hadley@rstudio.com",
        \\           comment = c(ORCIDXXX = c("0000-0003-4757-117X"))),
        \\    person("Posit Software, PBC", role = c("cph", "fnd", "xyz", "zzz"))
        \\    )
        \\
        \\Package: one2
        \\Authors@R: person('Pierre-Yves', 'de Müllenheim', email = 'pydemull@uco.fr', role = c('cre', 'aut'), comment = c(ORCID = "0000-0001-9157-7371"))
        \\
        \\Package: two
        \\Authors@R: c(person(given = "Sy Han", family = "Chiou", email = "schiou@smu.edu", role = c("aut", "cre")),
        \\           person(given = "Sangwook", family = "Kang", role = "aut"),
        \\           person(given = "Jun", family = "Yan", role = "aut"))
        \\
        \\Package: three
        \\Authors@R: c(person(("Atanu"), "Bhattacharjee",
        \\                    email="atanustat@gmail.com",
        \\                    role=c("aut", "cre","ctb")),
        \\               person(("Gajendra Kumar"), "Vishwakarma", role=c("aut","ctb")),
        \\               person(("Pragya"), "Kumari", role=c("aut","ctb")))
        \\
        \\Package: four
        \\Authors@R: c(person("Patrick", "Mair", role = c("aut", "cre"), email = "mair@fas.harvard.edu"), person("Jan", "De Leeuw", role = "aut"))
        \\
        \\Package: five
        \\Authors@R: c(
        \\    person("Scott", "Chamberlain", role = "aut",
        \\        email = "myrmecocystus@gmail.com",
        \\        comment = c(ORCID="0000-0003-1444-9135")),
        \\    person("Hadley", "Wickham", role = "aut", email = "hadley@rstudio.com"),
        \\    person("Winston", "Chang", role = "aut", email = "winston@stdout.org"),
        \\    person("Bob", "Rudis", role = "ctb", email = "bob@rudis.net"),
        \\    person("Bryce", "Mecum", role = "ctb", email = "brycemecum@gmail.com",
        \\           comment = c("ORCID" = "0000-0002-0381-3766")),
        \\    person("Mauricio", "Vargas", role = c("aut", "cre"), email = "mavargas11@uc.cl",
        \\           comment = c(ORCID = "0000-0003-1017-7574")),
        \\    person("RStudio", role = "cph"),
        \\    person("DigitalOcean", role = "cph")
        \\    )
        \\
        \\Package: six
        \\Authors@R: c(person(given = c("Gavin", "L."), family = "Simpson",
        \\                    role = c("aut", "cre"),
        \\                    email = "ucfagls@gmail.com",
        \\                    comment = c(ORCID = "0000-0002-9084-8413"))
        \\           , person(given = "Jari", family = "Oksanen",  role = "aut")
        \\           , person(given = "Martin", family = "Maechler", role = "ctb")
        \\                    )
        \\
        \\Package: seven
        \\Authors@R: c(
        \\    person("Pierre", "Roudier", email = "roudierp@landcareresearch.co.nz", role = c("aut", "cre")),
        \\    person("Etienne", "Lalibert'{e}", email = NULL, role = c("ctb"))
        \\    )
        \\URL: https://rstudio.github.io/renv/, https://github.com/rstudio/renv
        \\BugReports: https://github.com/rstudio/renv/issues
        \\Imports: utils
        \\Suggests: BiocManager (> 0.1), cli, covr, cpp11, devtools, gitcreds, jsonlite, jsonvalidate, knitr
        \\    (> 2.0),
        \\    miniUI, packrat, pak, R6, remotes, reticulate, rmarkdown, rstudioapi, shiny, testthat,
        \\    uuid, waldo, yaml, webfakes
        \\Encoding: UTF-8
        \\RoxygenNote: 7.3.2
        \\Roxygen: list(markdown = TRUE)
        \\VignetteBuilder: knitr
        \\Config/Needs/website: tidyverse/tidytemplate
        \\Config/testthat/edition: 3
        \\Config/testthat/parallel: true
        \\Config/testthat/start-first: bioconductor,python,install,restore,snapshot,retrieve,remotes
        \\
        \\Package: eight
        \\Authors@R: c()
        \\Authors@R: person("multiple", "fields")
        \\
        \\Package: apex
        \\Title: Phylogenetic Methods for Multiple Gene Data
        \\Version: 1.0.6
        \\Authors@R: c(KS=person("Klaus", "Schliep", email="klaus.schliep@gmail.com", role = c("aut", "cre"), comment = c(ORCID = "0000-0003-2941-0161")),
        \\       TJ=person("Thibaut", "Jombart", , "t.jombart@imperial.ac.uk", role = c("aut")),
        \\           ZK=person("Zhian Namir", "Kamvar", email = "kamvarz@science.oregonstate.edu", role = c("aut")),
        \\           EA=person("Eric", "Archer", email="eric.archer@noaa.gov", role = c("aut")),
        \\           RH=person("Rebecca", "Harris", email="rbharris@uw.edu", role = c("aut")))
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var authors = Authors.init(alloc);
    defer authors.deinit();

    const log = try authors.read(source, &strings);

    for (log) |x| switch (x.tag) {
        .warn, .err => std.debug.print("{}\n", .{x}),
        .info => {},
    };
    authors.db.debugPrint();
}

test "logging" {
    var arena = std.heap.ArenaAllocator.init(std.testing.allocator);
    defer arena.deinit();
    const alloc = arena.allocator();

    const source =
        \\Package: parse-error
        \\Authors@R: c(')
        \\
        \\Package: fun-err
        \\Authors@R: x()
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var authors = Authors.init(alloc);
    defer authors.deinit();

    const log = try authors.read(source, &strings);

    for (log) |x| switch (x.tag) {
        .warn, .err => std.debug.print("{}\n", .{x}),
        .info => {},
    };
    authors.db.debugPrint();
}

test "read authors from PACKAGES-full.gz" {
    if (false) {
        const mos = @import("mos");

        var arena = std.heap.ArenaAllocator.init(std.testing.allocator);
        defer arena.deinit();
        const alloc = arena.allocator();

        const path = "PACKAGES-full.gz";
        std.fs.cwd().access(path, .{}) catch return;

        const source: ?[]const u8 = try mos.file.readFileMaybeGzip(alloc, path);
        try std.testing.expect(source != null);
        defer if (source) |s| alloc.free(s);

        if (source) |source_| {
            var strings = try StringStorage.init(alloc, std.heap.page_allocator);
            defer strings.deinit();

            var authors = Authors.init(alloc);
            defer authors.deinit();

            var timer = try std.time.Timer.start();
            const log = try authors.read(source_, &strings);
            std.debug.print("Parse authors = {}ms\n", .{@divFloor(timer.lap(), 1_000_000)});

            authors.db.debugPrintInfo();

            for (log) |x| switch (x.tag) {
                .warn, .err => std.debug.print("{}\n", .{x}),
                .info => {},
            };
        }
    }
}

const std = @import("std");
const Allocator = std.mem.Allocator;

const StringStorage = @import("string_storage.zig").StringStorage;

const parse = @import("parse.zig");
const Parser = parse.Parser;

const rlang_parse = @import("rlang_parse.zig");
const RTokenizer = rlang_parse.Tokenizer;
const RParser = rlang_parse.Parser;
const FunctionCall = rlang_parse.FunctionCall;
const FunctionArg = rlang_parse.FunctionArg;

const Authors = @This();
const assert = std.debug.assert;
