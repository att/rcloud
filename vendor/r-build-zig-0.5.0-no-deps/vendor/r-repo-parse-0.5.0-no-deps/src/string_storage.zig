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

const std = @import("std");
const testing = std.testing;
const assert = std.debug.assert;
const Allocator = std.mem.Allocator;
const ArenaAllocator = std.heap.ArenaAllocator;
const StringHashMap = std.StringHashMap;

pub const StringStorage = struct {
    alloc: Allocator,
    arena: ArenaAllocator,
    index: std.StringHashMap([]u8),

    pub fn init(alloc: Allocator, child_allocator: Allocator) !Self {
        return StringStorage.initCapacity(alloc, child_allocator, 0);
    }

    pub fn initCapacity(alloc: Allocator, child_allocator: Allocator, capacity: usize) !Self {
        var arena = ArenaAllocator.init(child_allocator);

        if (capacity != 0) {
            // reserve capacity/preheat
            _ = try arena.allocator().alloc(u8, capacity);
            if (!arena.reset(.retain_capacity)) return error.OutOfMemory;
        }

        return .{
            .alloc = alloc,
            .arena = arena,
            .index = StringHashMap([]u8).init(alloc), // not arena
        };
    }

    pub fn deinit(self: *Self) void {
        self.index.deinit();
        self.arena.deinit();
        self.* = undefined;
    }

    pub fn reset(self: *Self, mode: ArenaAllocator.ResetMode) bool {
        if (self.arena.reset(mode)) {
            self.index.clearRetainingCapacity();
            return true;
        } else {
            return false;
        }
    }

    pub fn append(self: *Self, string: anytype) ![]u8 {
        // if the string is in our index, return it
        if (self.index.get(string)) |v|
            return v;

        const alloc = self.arena.allocator();

        // dupe the string so the caller can release its memory
        const our_key = try alloc.dupe(u8, string);

        // append and capture slice to new slice
        const ours = try self.arena.allocator().alloc(u8, string.len);
        @memcpy(ours, string);

        try self.index.putNoClobber(our_key, ours);

        return ours;
    }

    pub const Self = @This();
};

test "basic usage" {
    const alloc = std.testing.allocator;

    var ss = try StringStorage.init(alloc, std.heap.page_allocator);
    defer ss.deinit();
    const d1 = "hello world";
    const d2_ = "another string";

    var d2 = std.BoundedArray(u8, d2_.len){};
    try d2.appendSlice(d2_);
    d2.set(0, 'x');

    const s1 = try ss.append(d1);
    const s2 = try ss.append(d2.slice());

    const big = try alloc.alloc(u8, 1024 * 1024);
    defer alloc.free(big);

    const sbig = try ss.append(big);

    // pointers still valid
    try testing.expectEqualStrings("hello world", s1);
    try testing.expectEqualStrings("xnother string", s2);
    try testing.expectEqual(1024 * 1024, sbig.len);

    // testing index, same slice returned
    const s3 = try ss.append("hello world");
    try testing.expectEqual(s1, s3);
}
