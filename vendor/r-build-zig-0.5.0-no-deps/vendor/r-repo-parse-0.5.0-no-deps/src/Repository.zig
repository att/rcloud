alloc: Allocator,
strings: StringStorage,
packages: std.MultiArrayList(Package),
parse_error: ?Parser.ParseError = null,

pub const Index = @import("Repository/Index.zig");
pub const Tools = @import("Repository/Tools.zig");

/// Caller must call deinit to release internal buffers.
pub fn init(alloc: Allocator) !Repository {
    return .{
        .alloc = alloc,
        .strings = try StringStorage.init(alloc, std.heap.page_allocator),
        .packages = .{},
    };
}

/// Release internal buffers and invalidate.
pub fn deinit(self: *Repository) void {
    const slice = self.packages.slice();
    for (slice.items(.depends)) |x| {
        self.alloc.free(x);
    }
    for (slice.items(.suggests)) |x| {
        self.alloc.free(x);
    }
    for (slice.items(.imports)) |x| {
        self.alloc.free(x);
    }
    for (slice.items(.linkingTo)) |x| {
        self.alloc.free(x);
    }
    self.strings.deinit();
    self.packages.deinit(self.alloc);
    self.* = undefined;
}

/// Return an iterator over the package data.
pub fn iter(self: Repository) Iterator {
    return Iterator.init(self);
}

/// Return the first package.
pub fn first(self: Repository) ?Package {
    var it = self.iter();
    return it.next();
}

/// Return one or more packages information for given NameAndVersionConstraint.
pub fn findPackage(
    self: Repository,
    alloc: Allocator,
    navc: NameAndVersionConstraint,
    comptime options: struct { max_results: u32 = 16 },
) error{OutOfMemory}![]Package {
    var out = try std.ArrayList(Package).initCapacity(alloc, options.max_results);
    defer out.deinit();
    const slice = self.packages.slice();
    var index: usize = 0;
    for (slice.items(.name)) |n| {
        if (mem.eql(u8, n, navc.name)) {
            if (navc.version_constraint.satisfied(slice.items(.version)[index])) {
                out.appendAssumeCapacity(slice.get(index));
                if (out.items.len == options.max_results) return error.OutOfMemory;
            }
        }
        index += 1;
    }
    return out.toOwnedSlice();
}

/// Return the latest package, if any, that satisfies the given
/// NameAndVersionConstraint. If there are multiple packages that
/// satisfy the constraint, return the one with the highest
/// version.
pub fn findLatestPackage(
    self: Repository,
    alloc: Allocator,
    navc: NameAndVersionConstraint,
) error{OutOfMemory}!?Package {
    const packages = try self.findPackage(alloc, navc, .{});
    defer alloc.free(packages);
    switch (packages.len) {
        0 => return null,
        1 => return packages[0],
        else => {
            var latest = packages[0];
            for (packages) |p| {
                if (p.version.order(latest.version) == .gt) latest = p;
            }
            return latest;
        },
    }
}

/// Read packages information from provided source. Expects Debian
/// Control File format, same as R PACKAGES file. Returns number
/// of packages found.
pub fn read(self: *Repository, name: []const u8, source: []const u8) !usize {
    var count: usize = 0;
    var parser = parse.Parser.init(self.alloc, &self.strings);
    defer parser.deinit();
    parser.parse(source) catch |err| switch (err) {
        error.ParseError => |e| {
            self.parse_error = parser.parse_error;
            return e;
        },
        else => |e| {
            return e;
        },
    };

    // reserve estimated space and free before exit (empirical from CRAN PACKAGES)
    try self.packages.ensureTotalCapacity(self.alloc, parser.nodes.items.len / 30);
    defer self.packages.shrinkAndFree(self.alloc, self.packages.len);

    // reserve working list of []NameAndVersionConstraint
    var nav_list = try std.ArrayList(NameAndVersionConstraint).initCapacity(self.alloc, 16);
    defer nav_list.deinit();

    const empty_package: Package = .{ .repository = try self.strings.append(name) };
    var result = empty_package;
    // Note: result may have a different value by the time this defer
    // is called before exiting this scope. The deinit is needed to
    // avoid memory leaks in case of errors.
    errdefer result.deinit(self.alloc);

    const nodes = parser.nodes.items;
    var saw_field = false;
    var idx: usize = 0;
    var node: Parser.Node = undefined;
    while (true) : (idx += 1) {
        node = nodes[idx];

        switch (node) {
            .eof => break,
            .stanza => saw_field = false,
            .stanza_end => {
                if (saw_field) {
                    // do not count empty stanzas
                    try self.packages.append(self.alloc, result);
                    result = empty_package;
                    count += 1;
                }
                nav_list.clearRetainingCapacity();
            },
            .field => |field| {
                saw_field = true;
                if (std.mem.eql(u8, "Package", field.name)) {
                    result.name = try parsePackageName(nodes, &idx, &self.strings);
                } else if (std.mem.eql(u8, "Version", field.name)) {
                    result.version = try parsePackageVersion(nodes, &idx);
                    idx -= 1; // backtrack to parse version as string next
                    result.version_string = try parsePackageVersionString(nodes, &idx, &self.strings);
                } else if (std.mem.eql(u8, "Depends", field.name)) {
                    if (result.depends.len != 0) {
                        return self.parseError(result.name);
                    }
                    try parsePackages(nodes, &idx, &nav_list);
                    result.depends = try nav_list.toOwnedSlice();
                } else if (std.mem.eql(u8, "Suggests", field.name)) {
                    if (result.suggests.len != 0) {
                        return self.parseError(result.name);
                    }
                    try parsePackages(nodes, &idx, &nav_list);
                    result.suggests = try nav_list.toOwnedSlice();
                } else if (std.mem.eql(u8, "Imports", field.name)) {
                    if (result.imports.len != 0) {
                        return self.parseError(result.name);
                    }
                    try parsePackages(nodes, &idx, &nav_list);
                    result.imports = try nav_list.toOwnedSlice();
                } else if (std.mem.eql(u8, "LinkingTo", field.name)) {
                    if (result.linkingTo.len != 0) {
                        return self.parseError(result.name);
                    }

                    try parsePackages(nodes, &idx, &nav_list);
                    result.linkingTo = try nav_list.toOwnedSlice();
                }
            },

            else => continue,
        }
    }
    return count;
}

fn parseError(self: *Repository, message: []const u8) error{ParseError} {
    self.parse_error = .{
        .message = message,
        .token = .{
            .tag = .invalid,
            .loc = .{ .start = 0, .end = 0 },
        },
        .line = 0,
    };
    return error.ParseError;
}

fn parsePackageName(nodes: []Parser.Node, idx: *usize, strings: *StringStorage) ![]const u8 {
    idx.* += 1;
    switch (nodes[idx.*]) {
        .name_and_version => |nv| {
            return try strings.append(nv.name);
        },
        // expect .name_and_version immediately after .field for a Package field
        else => unreachable,
    }
}

fn parsePackageVersion(nodes: []Parser.Node, idx: *usize) !Version {
    idx.* += 1;
    switch (nodes[idx.*]) {
        .string_node => |s| {
            return try Version.parse(s.value);
        },
        // expect .string_node immediately after .field for a Version field
        else => unreachable,
    }
}

fn parsePackageVersionString(nodes: []Parser.Node, idx: *usize, strings: *StringStorage) ![]const u8 {
    idx.* += 1;
    switch (nodes[idx.*]) {
        .string_node => |s| {
            return try strings.append(s.value);
        },
        // expect .string_node immediately after .field for a Version field
        else => unreachable,
    }
}

fn parsePackages(
    nodes: []Parser.Node,
    idx: *usize,
    list: *std.ArrayList(NameAndVersionConstraint),
) !void {
    idx.* += 1;
    while (true) : (idx.* += 1) {
        const node = nodes[idx.*];
        switch (node) {
            .name_and_version => |nv| {
                try list.append(NameAndVersionConstraint{
                    .name = nv.name,
                    .version_constraint = nv.version_constraint,
                });
            },
            else => break,
        }
    }
}

//
// -- iterator -----------------------------------------------------------
//

/// Represents a single package and its dependencies.
pub const Package = struct {
    name: []const u8 = "",
    version: Version = .{},
    version_string: []const u8 = "",
    repository: []const u8 = "",
    depends: []NameAndVersionConstraint = &.{},
    suggests: []NameAndVersionConstraint = &.{},
    imports: []NameAndVersionConstraint = &.{},
    linkingTo: []NameAndVersionConstraint = &.{},

    /// Deinit a package that was allocated. May be called multiple
    /// times.
    pub fn deinit(self: *Package, alloc: Allocator) void {
        alloc.free(self.depends);
        alloc.free(self.suggests);
        alloc.free(self.imports);
        alloc.free(self.linkingTo);
        self.depends = &.{};
        self.suggests = &.{};
        self.imports = &.{};
        self.linkingTo = &.{};
    }
};

/// An iterator over a Repository.
pub const Iterator = struct {
    index: usize = 0,
    slice: std.MultiArrayList(Package).Slice,

    /// Return an iterator which provides one package at a time
    /// from the Repository.
    pub fn init(repo: Repository) Iterator {
        return .{
            .slice = repo.packages.slice(),
        };
    }

    pub fn next(self: *Iterator) ?Package {
        if (self.index < self.slice.len) {
            const out = self.index;
            self.index += 1;
            return self.slice.get(out);
        }
        return null;
    }
};

//
// -- transitive dependencies---------------------------------------------
//

/// Given a package name, return a slice of its transitive
/// dependencies. If there is more than one package with the same
/// name, select the latest version as the root. Caller must free
/// returned slice.
pub fn transitiveDependencies(
    self: Repository,
    alloc: Allocator,
    navc: NameAndVersionConstraint,
) error{ OutOfMemory, NotFound }![]NameAndVersionConstraint {
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();

    var out = NameAndVersionConstraintHashMap.init(alloc);
    defer out.deinit();

    if (try self.findLatestPackage(alloc, navc)) |root_package| {
        try self.doTransitiveDependencies(&arena, root_package, &out);
        return try alloc.dupe(NameAndVersionConstraint, out.keys());
    } else return error.NotFound;
}

/// Given a package name, return a slice of its transitive
/// dependencies. If there is more than one package with the same
/// name, select the latest version as the root. Does not report
/// dependencies on base or recommended packages. Caller must free
/// returned slice.
pub fn transitiveDependenciesNoBase(
    self: Repository,
    alloc: Allocator,
    navc: NameAndVersionConstraint,
) error{ OutOfMemory, NotFound }![]NameAndVersionConstraint {
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();

    var out = NameAndVersionConstraintHashMap.init(alloc);
    defer out.deinit();

    if (try self.findLatestPackage(alloc, navc)) |root_package| {
        try self.doTransitiveDependencies(&arena, root_package, &out);

        var result = try std.ArrayList(NameAndVersionConstraint).initCapacity(alloc, out.count());
        for (out.keys()) |x| {
            if (Tools.isBasePackage(x.name)) continue;
            if (Tools.isRecommendedPackage(x.name)) continue;
            result.appendAssumeCapacity(x);
        }
        return result.toOwnedSlice();
    } else return error.NotFound;
}

fn doTransitiveDependencies(
    self: Repository,
    arena: *std.heap.ArenaAllocator,
    package: Package,
    out: *NameAndVersionConstraintHashMap,
) !void {
    for (package.depends) |navc| {
        if (Tools.isBasePackage(navc.name)) continue;
        if (Tools.isRecommendedPackage(navc.name)) continue;
        if (try self.findLatestPackage(arena.allocator(), navc)) |p| {
            try out.put(navc, true);
            try self.doTransitiveDependencies(arena, p, out);
        } else {
            std.debug.print("package {s} dependency not found: {}\n", .{ package.name, navc });
            return error.NotFound;
        }
    }
    for (package.imports) |navc| {
        if (Tools.isBasePackage(navc.name)) continue;
        if (Tools.isRecommendedPackage(navc.name)) continue;
        if (try self.findLatestPackage(arena.allocator(), navc)) |p| {
            try out.put(navc, true);
            try self.doTransitiveDependencies(arena, p, out);
        } else {
            std.debug.print("package {s} dependency not found: {}\n", .{ package.name, navc });
            return error.NotFound;
        }
    }
    for (package.linkingTo) |navc| {
        if (Tools.isBasePackage(navc.name)) continue;
        if (Tools.isRecommendedPackage(navc.name)) continue;
        if (try self.findLatestPackage(arena.allocator(), navc)) |p| {
            try out.put(navc, true);
            try self.doTransitiveDependencies(arena, p, out);
        } else {
            std.debug.print("package {s} dependency not found: {}\n", .{ package.name, navc });
            return error.NotFound;
        }
    }
}

/// Caller must free returned slice.
pub fn calculateInstallationOrder(
    self: Repository,
    packages: []Package,
    comptime options: struct {
        max_iterations: usize = 256,
    },
) ![]Package {
    var out = try std.ArrayList(Package).initCapacity(self.alloc, packages.len);
    out.appendSliceAssumeCapacity(packages);

    // earliest position a package is referenced
    var seen = std.StringArrayHashMap(usize).init(self.alloc);

    // first pass move all packages with zero deps to the front
    var pos: usize = 0;
    while (pos < out.items.len) : (pos += 1) {
        const p = out.items[pos];
        if (p.depends.len == 0 and p.imports.len == 0 and p.linkingTo.len == 0) {
            // std.debug.print("moving {s} to the front as it has no dependencies\n", .{p.name});
            out.insertAssumeCapacity(0, out.orderedRemove(pos));
        }
    }

    // shuffle packages when we find their current position is
    // after their earliest seen position.
    var iterations: usize = 0;
    while (iterations < options.max_iterations) : (iterations += 1) {
        var shuffled = false;

        // for each dependency, record the earliest position it is
        // seen. Needs to be done after each reshuffle.
        seen.clearRetainingCapacity();
        try recordEarliestDependents(out, &seen);

        pos = 0;
        while (pos < out.items.len) : (pos += 1) {
            const p = out.items[pos];

            if (seen.get(p.name)) |idx| {
                if (idx < pos) {
                    shuffled = true;
                    // std.debug.print("shuffling {s} from {} to {}\n", .{ p.name, pos, idx });

                    // do the remove/insert
                    std.debug.assert(idx < pos);
                    out.insertAssumeCapacity(idx, out.orderedRemove(pos));
                    try seen.put(p.name, idx);
                }
            }
        }

        if (!shuffled) break;
    }
    std.debug.print("returning after {} iterations.\n", .{iterations});
    return out.toOwnedSlice();
}

/// Caller owns the returned slice.
pub fn calculateInstallationOrderAll(self: Repository) ![]Package {
    var packages = try std.ArrayList(Package).initCapacity(self.alloc, self.packages.len);
    defer packages.deinit();

    var slice = self.packages.slice();
    defer slice.deinit(self.alloc);

    var index: usize = 0;
    while (index < slice.len) : (index += 1) {
        packages.appendAssumeCapacity(slice.get(index));
    }
    return self.calculateInstallationOrder(packages.items, .{});
}

fn recordEarliestDependents(packages: std.ArrayList(Package), seen: *std.StringArrayHashMap(usize)) !void {
    var pos: usize = 0;
    while (pos < packages.items.len) : (pos += 1) {
        const p = packages.items[pos];
        try recordEarliestDependentsOne(p, pos, seen);
    }
}

fn recordEarliestDependentsOne(p: Package, pos: usize, seen: *std.StringArrayHashMap(usize)) !void {
    for (p.depends) |x| {
        if (Tools.isBasePackage(x.name)) continue;
        if (Tools.isRecommendedPackage(x.name)) continue;
        // std.debug.print("{s} seen at {} by {s}\n", .{ x.name, pos, p.name });
        const gop = try seen.getOrPut(x.name);
        if (!gop.found_existing or gop.value_ptr.* > pos)
            gop.value_ptr.* = pos;
    }
    for (p.imports) |x| {
        if (Tools.isBasePackage(x.name)) continue;
        if (Tools.isRecommendedPackage(x.name)) continue;
        // std.debug.print("{s} seen at {} by {s}\n", .{ x.name, pos, p.name });
        const gop = try seen.getOrPut(x.name);
        if (!gop.found_existing or gop.value_ptr.* > pos)
            gop.value_ptr.* = pos;
    }
    for (p.linkingTo) |x| {
        if (Tools.isBasePackage(x.name)) continue;
        if (Tools.isRecommendedPackage(x.name)) continue;
        // std.debug.print("{s} seen at {} by {s}\n", .{ x.name, pos, p.name });
        const gop = try seen.getOrPut(x.name);
        if (!gop.found_existing or gop.value_ptr.* > pos)
            gop.value_ptr.* = pos;
    }
}

const Repository = @This();

const std = @import("std");
const mem = std.mem;
const mos = @import("mos");
const testing = std.testing;
const Allocator = std.mem.Allocator;

const StringStorage = @import("string_storage.zig").StringStorage;

const parse = @import("parse.zig");
const Parser = parse.Parser;

pub const version = @import("version.zig");
const NameAndVersionConstraint = version.NameAndVersionConstraint;
const Version = version.Version;
const NameAndVersionConstraintHashMap = version.NameAndVersionConstraintHashMap;
