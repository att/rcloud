// dependencies on these packages are not checked
const base_packages = .{
    "base",   "compiler", "datasets", "graphics", "grDevices",
    "grid",   "methods",  "parallel", "splines",  "stats",
    "stats4", "tcltk",    "tools",    "utils",    "R",
};

// it's dubious to also exclude these from dependency checking,
// because some installations may not have recommended packages
// installed. But we still exclude them.
const recommended_packages = .{
    "boot",    "class",      "MASS",    "cluster", "codetools",
    "foreign", "KernSmooth", "lattice", "Matrix",  "mgcv",
    "nlme",    "nnet",       "rpart",   "spatial", "survival",
};

/// Return true if name is a base package.
pub fn isBasePackage(name: []const u8) bool {
    inline for (base_packages) |base| {
        if (std.mem.eql(u8, base, name)) return true;
    }
    return false;
}

/// Return true if name is a recommended package.
pub fn isRecommendedPackage(name: []const u8) bool {
    inline for (recommended_packages) |reco| {
        if (std.mem.eql(u8, reco, name)) return true;
    }
    return false;
}

/// Return index into repository packages for a package which
/// matches the requested constraint, or null.
pub fn matchPackage(index: Index, package: NameAndVersionConstraint) ?usize {
    return if (index.items.get(package.name)) |entry| switch (entry) {
        .single => |e| if (package.version_constraint.satisfied(e.version)) e.index else null,
        .multiple => |es| b: {
            for (es.items) |e| {
                if (package.version_constraint.satisfied(e.version)) break :b e.index;
            }
            break :b null;
        },
    } else null;
}

/// Given a slice of required packages, return a slice of missing
/// dependencies, if any.
pub fn unsatisfied(
    index: Index,
    alloc: Allocator,
    require: []NameAndVersionConstraint,
) error{OutOfMemory}![]NameAndVersionConstraint {
    var out = std.ArrayList(NameAndVersionConstraint).init(alloc);
    defer out.deinit();

    for (require) |d| top: {
        if (isBasePackage(d.name)) continue;
        if (isRecommendedPackage(d.name)) continue;
        if (index.items.get(d.name)) |entry| switch (entry) {
            .single => |e| {
                if (d.version_constraint.satisfied(e.version)) break;
            },
            .multiple => |es| {
                for (es.items) |e| {
                    if (d.version_constraint.satisfied(e.version)) break :top;
                }
            },
        };
        try out.append(d);
    }
    return out.toOwnedSlice();
}

/// Return an owned slice of package names and versions thate
/// cannot be satisfied in the given repository, starting with the
/// given root package. Caller must free the slice with the same
/// allocator.
pub fn unmetDependencies(
    index: Index,
    alloc: Allocator,
    repo: Repository,
    root: []const u8,
) error{ OutOfMemory, NotFound }![]NameAndVersionConstraint {
    if (try repo.findLatestPackage(alloc, .{ .name = root })) |p| {
        var broken = std.ArrayList(NameAndVersionConstraint).init(alloc);
        defer broken.deinit();

        const deps = try index.unsatisfied(alloc, p.depends);
        const impo = try index.unsatisfied(alloc, p.imports);
        const link = try index.unsatisfied(alloc, p.linkingTo);
        defer alloc.free(deps);
        defer alloc.free(impo);
        defer alloc.free(link);

        try broken.appendSlice(deps);
        try broken.appendSlice(impo);
        try broken.appendSlice(link);

        return broken.toOwnedSlice();
    }
    return error.NotFound;
}

const std = @import("std");
const Allocator = std.mem.Allocator;

const Index = @import("Index.zig");

const version = @import("../version.zig");
const NameAndVersionConstraint = version.NameAndVersionConstraint;

const repository = @import("../repository_tools.zig");
const Repository = repository.Repository;
