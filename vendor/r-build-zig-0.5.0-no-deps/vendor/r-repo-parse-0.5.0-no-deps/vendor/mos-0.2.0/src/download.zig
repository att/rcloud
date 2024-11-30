// This file is part of mos.
//
// Copyright (C) 2024 <https://codeberg.org/mocompute>
//
// mos is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// mos is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
const std = @import("std");
const Mutex = std.Thread.Mutex;

pub const DownloadOptions = struct {
    url: []const []const u8,
    path: []const []const u8,
};
pub const DownloadStatus = union(enum) {
    ok,
    err: []const u8,
};

/// Allocator must be thread-safe.
pub fn downloadFile(alloc: std.mem.Allocator, url: []const u8, out_path: []const u8) !void {
    var client = std.http.Client{ .allocator = alloc };
    try client.initDefaultProxies(alloc);

    var header_buffer: [16 * 1024]u8 = undefined;
    var buf: [16 * 1024]u8 = undefined;

    var out_file = try std.fs.cwd().createFile(out_path, .{ .truncate = true });
    defer out_file.close();

    const uri = try std.Uri.parse(url);
    var req = try client.open(.GET, uri, .{
        .keep_alive = false,
        .server_header_buffer = &header_buffer,
    });
    defer req.deinit();
    try req.send();
    try req.finish();
    try req.wait();

    if (req.response.status.class() != .success) return error.HttpError;

    while (true) {
        const n = try req.read(&buf);
        if (n == 0) break;
        try out_file.writeAll(buf[0..n]);
    }
}

/// Allocator must be thread safe. Caller must free returned slice.
pub fn downloadFiles(alloc: std.mem.Allocator, options: DownloadOptions) ![]DownloadStatus {
    if (options.url.len != options.path.len) return error.BadArgument;

    var pool: std.Thread.Pool = undefined;
    try std.Thread.Pool.init(&pool, .{ .allocator = alloc });
    defer pool.deinit();
    var lock = std.Thread.Mutex{};
    var wg = std.Thread.WaitGroup{};
    var statuses = try std.ArrayList(DownloadStatus).initCapacity(alloc, options.url.len);
    statuses.expandToCapacity();

    var index: usize = 0;
    while (index < options.url.len) : (index += 1) {
        pool.spawnWg(
            &wg,
            &doDownloadFile,
            .{
                alloc,
                options.url[index],
                options.path[index],
                index,
                &statuses,
                &lock,
            },
        );
    }

    pool.waitAndWork(&wg);
    return statuses.toOwnedSlice();
}

fn doDownloadFile(
    alloc: std.mem.Allocator,
    url: []const u8,
    out_path: []const u8,
    index: usize,
    statuses: *std.ArrayList(DownloadStatus),
    lock: *Mutex,
) void {
    downloadFile(alloc, url, out_path) catch |err| {
        lock.lock();
        defer lock.unlock();
        statuses.items[index] = .{ .err = @errorName(err) };
        return;
    };
    statuses.items[index] = .ok;
}

/// Return true if a HEAD request is successful, including if it
/// returns a redirect.
pub fn headOk(alloc: std.mem.Allocator, url: []const u8) !bool {
    var client = std.http.Client{ .allocator = alloc };

    var header_buffer: [16 * 1024]u8 = undefined;

    const uri = try std.Uri.parse(url);
    var req = try client.open(.HEAD, uri, .{
        .keep_alive = false,
        .server_header_buffer = &header_buffer,
    });
    defer req.deinit();
    try req.send();
    try req.finish();
    try req.wait();

    const class = req.response.status.class();
    return class == .success or class == .redirect;
}
