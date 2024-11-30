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
const Allocator = std.mem.Allocator;
const Hash = std.crypto.hash.sha2.Sha256;
const Mutex = std.Thread.Mutex;

const mos = @import("mos");
const config_json = @import("config-json.zig");
const download = mos.download;

const Config = config_json.Config;

fn usage() noreturn {
    std.debug.print(
        \\Usage: fetch-assets <config.json> <out_dir>
    , .{});
    std.process.exit(1);
}

const NUM_ARGS = 2;

fn hashOne(
    alloc: Allocator,
    asset_name: []const u8,
    asset: Config.OneAsset,
    file_path: []const u8,
    config_path: []const u8,
    config_mutex: *Mutex,
    hashes_updated: *usize,
) void {
    const hash = blk: {
        const file = std.fs.cwd().openFile(file_path, .{}) catch |err| {
            fatal("ERROR: could not open file '{s}': {s}\n", .{ file_path, @errorName(err) });
        };
        defer file.close();

        // hash the file
        var buf: [std.mem.page_size]u8 = undefined;
        var hasher = Hash.init(.{});
        while (true) {
            const n = file.read(&buf) catch |err| {
                file.close();
                fatal("ERROR: read error on file '{s}': {s}\n", .{ file_path, @errorName(err) });
            };
            if (n == 0) break;
            hasher.update(buf[0..n]);
        }
        break :blk hasher.finalResult();
    };

    // compare to expected, or write to config file if expected is blank
    if (asset.hash.len != 0) {
        var expected: [Hash.digest_length]u8 = undefined;
        _ = std.fmt.hexToBytes(&expected, asset.hash) catch |err| {
            fatal("ERROR: could not decode hash '{s}': {s}\n", .{ asset.hash, @errorName(err) });
        };
        if (!std.mem.eql(u8, &expected, &hash)) {
            fatal(
                "ERROR: hash mismatch for '{s}':\n    expected: {s}\n         got: {s}\n",
                .{
                    asset_name,
                    std.fmt.bytesToHex(expected, .lower),
                    std.fmt.bytesToHex(hash, .lower),
                },
            );
        }
    } else {
        // write hash to file
        config_mutex.lock();
        defer config_mutex.unlock();
        const config_root = config_json.readConfigRoot(alloc, config_path, .{}) catch |err| {
            fatal("ERROR: unable to read config file '{s}': {s}\n", .{ config_path, @errorName(err) });
        };
        var config = config_root.@"generate-build";
        config.assets.map.put(alloc, asset_name, .{
            .url = asset.url,
            .hash = &std.fmt.bytesToHex(hash, .lower),
        }) catch |err| {
            fatal("ERROR: failed to add key: '{s}' to hash table: {s}\n", .{
                asset_name,
                @errorName(err),
            });
        };

        const config_file = std.fs.cwd().createFile(config_path, .{}) catch |err| {
            fatal("ERROR: cannot open config file '{s}': {s}\n", .{ config_path, @errorName(err) });
        };
        defer config_file.close();

        std.json.stringify(
            config_root,
            .{ .whitespace = .indent_2 },
            config_file.writer(),
        ) catch |err| {
            config_file.close();
            fatal("ERROR: could not stringify to JSON: {s}\n", .{@errorName(err)});
        };

        // print warning
        std.debug.print("WARNING: wrote new hash for asset '{s}'\n", .{asset_name});

        // update count (protected by mutex)
        hashes_updated.* += 1;
    }
}

fn downloadOne(
    asset_name: []const u8,
    asset: Config.OneAsset,
    out_dir: []const u8,
    config_path: []const u8,
    mutex: *Mutex,
    hashes_updated: *usize,
) void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}).init;
    defer _ = gpa.deinit();
    const alloc = gpa.allocator();
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();

    const basename = tarballName(arena.allocator(), asset.url) catch |err| {
        fatal("ERROR: unable to determine tarball name from '{s}': {s}\n", .{ asset.url, @errorName(err) });
    };

    const out_path = std.fs.path.join(arena.allocator(), &.{ out_dir, basename }) catch |err| {
        fatal("ERROR: unable to join paths '{s}' and '{s}': {s}\n", .{
            out_dir,
            basename,
            @errorName(err),
        });
    };

    download.downloadFile(arena.allocator(), asset.url, out_path) catch |err| {
        fatal("ERROR: download of '{s}' failed: {s}\n", .{ asset.url, @errorName(err) });
    };

    hashOne(
        arena.allocator(),
        asset_name,
        asset,
        out_path,
        config_path,
        mutex,
        hashes_updated,
    );
}

fn tarballName(alloc: Allocator, url: []const u8) ![]const u8 {
    const basename = std.fs.path.basenamePosix(url);
    if (std.mem.startsWith(u8, basename, "package=")) {
        // package=foo?version=1.2.3-4

        var it = std.mem.tokenizeAny(u8, basename, "=&");
        const State = enum {
            expect_package,
            expect_name,
            expect_version,
            expect_number,
        };

        var name: []const u8 = undefined;
        var state: State = .expect_package;
        while (it.next()) |s| {
            switch (state) {
                .expect_package => state = .expect_name,
                .expect_version => state = .expect_number,
                .expect_name => {
                    name = s;
                    state = .expect_version;
                },
                .expect_number => {
                    return try std.fmt.allocPrint(
                        alloc,
                        "{s}_{s}.tar.gz",
                        .{ name, s },
                    );
                },
            }
        }
        return error.ParseError;
    }
    return basename;
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}).init;
    defer _ = gpa.deinit();
    const alloc = gpa.allocator();
    var arena_state = std.heap.ArenaAllocator.init(alloc);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    const args = try std.process.argsAlloc(arena);
    defer std.process.argsFree(arena, args);

    if (args.len != NUM_ARGS + 1) usage();
    const config_path = args[1];
    const out_dir_path = args[2];

    const config_root = try config_json.readConfigRoot(arena, config_path, .{});
    const config = config_root.@"generate-build";
    const assets = config.assets;

    var pool: std.Thread.Pool = undefined;
    try std.Thread.Pool.init(&pool, .{ .allocator = alloc });
    defer pool.deinit();
    var hashes_updated: usize = 0;
    var config_file_lock = std.Thread.Mutex{};
    var wg = std.Thread.WaitGroup{};

    for (assets.map.keys()) |name| {
        if (assets.map.get(name)) |asset| {
            pool.spawnWg(
                &wg,
                &downloadOne,
                .{ name, asset, out_dir_path, config_path, &config_file_lock, &hashes_updated },
            );
        }
    }

    pool.waitAndWork(&wg);

    // if any hashes were updated, write a message
    if (hashes_updated > 0) {
        std.debug.print("WARNING: wrote new hash for {} assets\n", .{hashes_updated});
    }
}

fn fatal(comptime format: []const u8, args: anytype) noreturn {
    std.debug.print(format, args);
    std.process.exit(1);
}

test {
    _ = std.testing.refAllDecls(@This());
}
