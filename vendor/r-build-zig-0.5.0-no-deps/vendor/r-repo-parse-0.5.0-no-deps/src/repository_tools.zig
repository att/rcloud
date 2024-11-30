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

/// Represents a package repository and provides a parser to update
/// itself from a Debian Control File (DCF), as used in standard R
/// package repository PACKAGES files.
pub const Repository = @import("Repository.zig");

test "PACKAGES.gz" {
    const path = "PACKAGES.gz";
    std.fs.cwd().access(path, .{}) catch return;
    const alloc = testing.allocator;

    var source: ?[]const u8 = try mos.file.readFileMaybeGzip(alloc, path);
    try testing.expect(source != null);
    defer if (source) |s| alloc.free(s);

    var timer = try std.time.Timer.start();

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();
    var parser = parse.Parser.init(alloc, &strings);
    defer parser.deinit();
    parser.parse(source.?) catch |err| switch (err) {
        error.ParseError => {
            if (parser.parse_error) |perr| {
                perr.debugPrint(source.?);
            }
        },
        error.OutOfMemory => {
            std.debug.print("ERROR: OutOfMemory\n", .{});
        },
        else => unreachable,
    };

    std.debug.print("Parse to AST only = {}ms\n", .{@divFloor(timer.lap(), 1_000_000)});
    std.debug.print("Parser nodes: {d}\n", .{parser.nodes.items.len});
    std.debug.print("Number of stanzas parsed: {d}\n", .{parser.numStanzas()});

    // read entire repo
    var repo = try Repository.init(alloc);
    defer repo.deinit();
    _ = repo.read("test repo", source.?) catch |err| switch (err) {
        error.ParseError => {
            repo.parse_error.?.debugPrint(source);
            return err;
        },
        else => return err,
    };
    std.debug.print(
        "Parse to Repository ({} packages) = {}ms\n",
        .{ repo.packages.len, @divFloor(timer.lap(), 1_000_000) },
    );

    // after parser.parse() returns, we should be able to immediate
    // release the source. Note that repo.read() also uses it in this
    // test.
    if (source) |s| alloc.free(s);
    source = null;

    // Current PACKAGES has this as the first stanza:
    // Package: A3
    // Version: 1.0.0
    try testing.expectEqualStrings("A3", repo.packages.items(.name)[0]);
    try testing.expectEqual(1, repo.packages.items(.version)[0].major);
    try testing.expectEqualStrings("1.0.0", repo.packages.items(.version_string)[0]);

    try testing.expectEqualStrings("AalenJohansen", repo.packages.items(.name)[1]);
    try testing.expectEqual(1, repo.packages.items(.version)[1].major);
    try testing.expectEqualStrings("AATtools", repo.packages.items(.name)[2]);
    try testing.expectEqual(0, repo.packages.items(.version)[2].major);

    const pack = try repo.findLatestPackage(alloc, .{ .name = "A3" });
    try testing.expect(pack != null);
    try testing.expectEqualStrings("A3", pack.?.name);

    // index
    var index = try Repository.Index.init(repo);
    defer index.deinit();
    try testing.expect(index.items.count() <= repo.packages.len);

    std.debug.print("Index count = {}\n", .{index.items.count()});

    try testing.expectEqual(0, index.items.get("A3").?.single.index);
    try testing.expectEqual(1, index.items.get("A3").?.single.version.major);
    try testing.expectEqual(1, index.items.get("AalenJohansen").?.single.index);
    try testing.expectEqual(1, index.items.get("AalenJohansen").?.single.version.major);
    try testing.expectEqual(2, index.items.get("AATtools").?.single.index);
    try testing.expectEqual(0, index.items.get("AATtools").?.single.version.major);

    const jsonlite = try repo.findLatestPackage(alloc, .{ .name = "jsonlite" });
    try testing.expect(jsonlite != null);
}

test "PACKAGES sanity check" {
    const path = "PACKAGES.gz";
    std.fs.cwd().access(path, .{}) catch return;
    const alloc = testing.allocator;
    var source: ?[]const u8 = try mos.file.readFileMaybeGzip(alloc, path);
    defer if (source) |s| alloc.free(s);

    var repo = try Repository.init(alloc);
    defer repo.deinit();
    if (source) |s| {
        _ = repo.read("test", s) catch |err| switch (err) {
            error.ParseError => {
                repo.parse_error.?.debugPrint(source.?);
                return err;
            },
            else => return err,
        };
        alloc.free(s);
        source = null;
    }

    var index = try Repository.Index.init(repo);
    defer index.deinit();

    var unsatisfied = std.StringHashMap(std.ArrayList(NameAndVersionConstraint)).init(alloc);
    defer {
        var it = unsatisfied.iterator();
        while (it.next()) |x| x.value_ptr.deinit();
        unsatisfied.deinit();
    }

    var it = repo.iter();
    while (it.next()) |p| {
        const deps = try Repository.Tools.unsatisfied(index, alloc, p.depends);
        defer alloc.free(deps);
        const impo = try Repository.Tools.unsatisfied(index, alloc, p.imports);
        defer alloc.free(impo);
        const link = try Repository.Tools.unsatisfied(index, alloc, p.linkingTo);
        defer alloc.free(link);

        const res = try unsatisfied.getOrPut(p.name);
        if (!res.found_existing) res.value_ptr.* = std.ArrayList(NameAndVersionConstraint).init(alloc);
        try res.value_ptr.appendSlice(deps);
        try res.value_ptr.appendSlice(impo);
        try res.value_ptr.appendSlice(link);
    }

    var un_it = unsatisfied.iterator();
    while (un_it.next()) |u| {
        for (u.value_ptr.items) |nav| {
            std.debug.print("Package '{s}' dependency '{s}' version '{s}' not satisfied.\n", .{
                u.key_ptr.*,
                nav.name,
                nav.version_constraint,
            });
        }
    }
}

test "find latest package" {
    const alloc = testing.allocator;
    const data1 =
        \\Package: foo
        \\Version: 1.0
        \\
        \\Package: foo
        \\Version: 1.0.1
    ;
    const data2 =
        \\Package: foo
        \\Version: 1.0.2
        \\
        \\Package: foo
        \\Version: 1.0.1
    ;

    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data1);

        const package = try repo.findLatestPackage(alloc, .{ .name = "foo" });
        try testing.expectEqualStrings("foo", package.?.name);
        try testing.expectEqual(Version{ .major = 1, .minor = 0, .patch = 1, .rev = 0 }, package.?.version);
    }
    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data2);

        const package = try repo.findLatestPackage(alloc, .{ .name = "foo" });
        try testing.expectEqualStrings("foo", package.?.name);
        try testing.expectEqualStrings("test", package.?.repository);
        try testing.expectEqual(Version{ .major = 1, .minor = 0, .patch = 2, .rev = 0 }, package.?.version);
    }

    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data2);
        var index = try Repository.Index.init(repo);
        defer index.deinit();

        const package_index = Repository.Tools.matchPackage(index, NameAndVersionConstraint{
            .name = "foo",
            .version_constraint = .{
                .operator = .gt,
                .version = .{
                    .major = 1,
                    .patch = 1,
                },
            },
        });
        try testing.expectEqual(0, package_index.?);

        try testing.expectEqual(null, Repository.Tools.matchPackage(index, NameAndVersionConstraint{
            .name = "foo",
            .version_constraint = .{
                .operator = .gt,
                .version = .{
                    .major = 1,
                    .patch = 2,
                },
            },
        }));
    }
}

test "transitive dependencies" {
    const alloc = testing.allocator;
    const data1 =
        \\Package: parent
        \\Version: 1.0
        \\
        \\Package: child
        \\Version: 1.0
        \\Depends: parent (>= 1.0)
        \\
        \\Package: grandchild
        \\Version: 1.0
        \\Depends: child (>= 1.0)
    ;

    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data1);

        const res = try repo.transitiveDependencies(alloc, .{ .name = "grandchild" });
        defer alloc.free(res);

        try testing.expectEqualDeep(
            res[0],
            NameAndVersionConstraint{ .name = "child", .version_constraint = try version.VersionConstraint.parse(.gte, "1.0") },
        );
    }
    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data1);

        const res = try repo.transitiveDependenciesNoBase(alloc, .{ .name = "grandchild" });
        defer alloc.free(res);

        try testing.expectEqualDeep(
            res[0],
            NameAndVersionConstraint{ .name = "child", .version_constraint = try version.VersionConstraint.parse(.gte, "1.0") },
        );
    }
}

test "versions with minus" {
    const alloc = std.testing.allocator;
    const data =
        \\Package: whomadethis
        \\Version: 2.3-0
        \\Depends: base64enc (>= 0.1-3), rjson, parallel, R (>= 3.1.0)
        \\Imports: uuid, RCurl, unixtools, Rserve (>= 1.8-5), rediscc (>= 0.1-3), jsonlite, knitr, markdown, png, Cairo, httr, gist, mime, sendmailR, PKI
        \\Suggests: FastRWeb, RSclient, rcloud.client, rcloud.solr, rcloud.r
        \\License: MIT
        \\
    ;
    {
        var tokenizer = parse.Tokenizer.init(data);
        defer tokenizer.deinit();

        while (true) {
            const tok = tokenizer.next();
            if (tok.tag == .eof) break;
            // tok.debugPrint(data);
        }
    }
    {
        var strings = try StringStorage.init(alloc, std.heap.page_allocator);
        defer strings.deinit();
        var parser = parse.Parser.init(alloc, &strings);
        defer parser.deinit();
        parser.parse(data) catch |err| switch (err) {
            error.ParseError => |e| {
                // self.parse_error = parser.parse_error;
                return e;
            },
            else => |e| {
                return e;
            },
        };
        for (parser.nodes.items) |node| {
            std.debug.print("{}\n", .{node});
        }
    }

    {
        var repo = try Repository.init(alloc);
        defer repo.deinit();
        _ = try repo.read("test", data);

        std.debug.print("whomadethis:\n", .{});
        if (try repo.findLatestPackage(alloc, .{ .name = "whomadethis" })) |p| {
            std.debug.print("  Depends:\n", .{});
            for (p.depends) |x| {
                std.debug.print("    {s}\n", .{x.name});
            }
            std.debug.print("  Imports:\n", .{});
            for (p.imports) |x| {
                std.debug.print("    {s}\n", .{x.name});
            }
            std.debug.print("  LinkingTo:\n", .{});
            for (p.linkingTo) |x| {
                std.debug.print("    {s}\n", .{x.name});
            }
        }
    }
}

test "duplicate depends/imports/linkingto returns ParseError" {
    const alloc = std.testing.allocator;
    const source1 =
        \\Package: foo
        \\Depends: val1
        \\Depends: val1
        \\
    ;
    const source2 =
        \\Package: foo
        \\Imports: val1
        \\Imports: val1
        \\
    ;
    const source3 =
        \\Package: foo
        \\LinkingTo: val1
        \\LinkingTo: val1
        \\
    ;

    const source4 =
        \\Package: foo
        \\Suggests: val1
        \\Suggests: val1
        \\
    ;

    var repo = try Repository.init(alloc);
    defer repo.deinit();
    try testing.expectError(error.ParseError, repo.read("test", source1));
    try testing.expectError(error.ParseError, repo.read("test", source2));
    try testing.expectError(error.ParseError, repo.read("test", source3));
    try testing.expectError(error.ParseError, repo.read("test", source4));
}

const std = @import("std");

const mos = @import("mos");
const testing = std.testing;

const StringStorage = @import("string_storage.zig").StringStorage;

const parse = @import("parse.zig");
const Parser = parse.Parser;

const version = @import("version.zig");
const NameAndVersionConstraint = version.NameAndVersionConstraint;
const Version = version.Version;
const NameAndVersionConstraintHashMap = version.NameAndVersionConstraintHashMap;
