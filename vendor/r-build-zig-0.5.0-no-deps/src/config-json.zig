// This file is part of r-build-zig.
//
// Copyright (C) 2024 <https://codeberg.org/mocompute>
//
// r-build-zig is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// r-build-zig is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

const std = @import("std");

pub const Config = struct {
    repos: []Repo,
    assets: Assets,

    pub const Repo = struct {
        name: []const u8,
        url: []const u8,
    };

    pub const Assets = std.json.ArrayHashMap(OneAsset);
    pub const OneAsset = struct {
        url: []const u8 = "",
        hash: []const u8 = "",
    };
};

pub const ConfigRoot = struct {
    @"generate-build": Config,
};

/// Caller should supply an arena allocator as this json parser will
/// leak memory. If the file is larger than max_alloc, an error will
/// be returned.
pub fn readConfigRoot(
    alloc: std.mem.Allocator,
    path: []const u8,
    comptime options: struct { max_alloc: usize = 128 * 1024 },
) !ConfigRoot {
    const config_file = try std.fs.cwd().openFile(path, .{ .lock = .exclusive });
    defer config_file.close();

    const buf = try config_file.readToEndAlloc(alloc, options.max_alloc);
    const root = try std.json.parseFromSliceLeaky(ConfigRoot, alloc, buf, .{
        .ignore_unknown_fields = true,
    });
    return root;
}
