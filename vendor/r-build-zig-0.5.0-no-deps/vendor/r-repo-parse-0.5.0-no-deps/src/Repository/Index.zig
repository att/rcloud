//! Represents an Index of a Repository.

const MapType = std.StringHashMap(AvailableVersions);

items: MapType,

/// Create an index of the repo. Uses the repository's
/// allocator for its internal buffers. Caller must deinit to
/// release buffers.
pub fn init(repo: Repository) !Index {
    // Index only supports up to max Index.Size items.
    if (repo.packages.len > std.math.maxInt(MapType.Size)) return error.OutOfMemory;
    var out = MapType.init(repo.alloc);
    try out.ensureTotalCapacity(@intCast(repo.packages.len));

    const slice = repo.packages.slice();
    const names = slice.items(.name);
    const versions = slice.items(.version);

    var idx: usize = 0;
    while (idx < repo.packages.len) : (idx += 1) {
        const name = names[idx];
        const ver = versions[idx];

        if (out.getPtr(name)) |p| {
            switch (p.*) {
                .single => |vi| {
                    p.* = .{
                        .multiple = std.ArrayList(VersionIndex).init(repo.alloc),
                    };
                    try p.multiple.append(vi);
                    try p.multiple.append(.{
                        .version = ver,
                        .index = idx,
                    });
                },
                .multiple => |*l| {
                    try l.append(.{
                        .version = ver,
                        .index = idx,
                    });
                },
            }
        } else {
            out.putAssumeCapacityNoClobber(name, .{
                .single = .{
                    .version = ver,
                    .index = idx,
                },
            });
        }
    }
    return .{ .items = out };
}

/// Release buffers and invalidate.
pub fn deinit(self: *Index) void {
    var it = self.items.valueIterator();
    while (it.next()) |v| switch (v.*) {
        .single => continue,
        .multiple => |l| {
            l.deinit();
        },
    };

    self.items.deinit();
    self.* = undefined;
}

const AvailableVersions = union(enum) {
    single: VersionIndex,
    multiple: std.ArrayList(VersionIndex),

    pub fn format(self: AvailableVersions, comptime _: []const u8, _: std.fmt.FormatOptions, w: anytype) !void {
        switch (self) {
            .single => |vi| {
                try w.print("(IndexVersion.single {} {})", .{
                    vi.version,
                    vi.index,
                });
            },
            .multiple => |l| {
                try w.print("(IndexVersion.multiple", .{});
                for (l.items) |x| {
                    try w.print(" {s}", .{x.version});
                }
                try w.print(")", .{});
            },
        }
    }
};

const VersionIndex = struct { version: Version, index: usize };

const Index = @This();
const std = @import("std");
const Allocator = std.mem.Allocator;

const Version = @import("../version.zig").Version;
const Repository = @import("../repository_tools.zig").Repository;
