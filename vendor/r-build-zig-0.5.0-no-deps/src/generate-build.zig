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

const r_repo_parse = @import("r-repo-parse");
const NAVC = r_repo_parse.version.NameAndVersionConstraint;
const NAVCHashMap = r_repo_parse.version.NameAndVersionConstraintHashMap;
const NAVCHashMapSortContext = r_repo_parse.version.NameAndVersionConstraintSortContext;
const Repository = r_repo_parse.repository.Repository;

const mos = @import("mos");
const download = mos.download;
const config_json = @import("config-json.zig");

const ConfigRoot = config_json.ConfigRoot;
const Config = config_json.Config;
const Assets = Config.Assets;

fn usage() noreturn {
    std.debug.print(
        \\Usage: generate-build <config.json> <out_dir> [src_pkg_dir...]
    , .{});
    std.process.exit(1);
}
const NUM_ARGS_MIN = 2;

/// Requires thread-safe allocator. Will leak memory in case of errors.
fn readRepositories(alloc: Allocator, repos: []Config.Repo, out_dir: []const u8) !Repository {
    var repository = try Repository.init(alloc);

    const download_options = blk: {
        var urls = try std.ArrayList([]const u8).initCapacity(alloc, repos.len);
        var paths = try std.ArrayList([]const u8).initCapacity(alloc, repos.len);

        for (repos) |repo| {
            const url = try std.fmt.allocPrint(alloc, "{s}/src/contrib/PACKAGES.gz", .{repo.url});
            const path = try std.fs.path.join(alloc, &.{ out_dir, repo.name, "PACKAGES.gz" });
            if (std.fs.path.dirname(path)) |dir| try std.fs.cwd().makePath(dir);
            urls.appendAssumeCapacity(url);
            paths.appendAssumeCapacity(path);
        }

        const urls_s = try urls.toOwnedSlice();
        const paths_s = try paths.toOwnedSlice();
        break :blk download.DownloadOptions{
            .url = urls_s,
            .path = paths_s,
        };
    };
    defer {
        alloc.free(download_options.url);
        alloc.free(download_options.path);
    }

    const statuses = try download.downloadFiles(alloc, download_options);
    defer alloc.free(statuses);

    var index: usize = 0;
    var errorp = false;
    while (index < statuses.len) : (index += 1) {
        switch (statuses[index]) {
            .ok => {
                std.debug.print("Downloaded {s}\n", .{download_options.url[index]});
                continue;
            },
            .err => |e| {
                std.debug.print("ERROR: downloading '{s}': {s}\n", .{
                    download_options.url[index],
                    e,
                });
                errorp = true;
            },
        }
    }
    if (errorp) std.process.exit(1);

    var buf = try std.ArrayList(u8).initCapacity(alloc, 16 * 1024);
    defer buf.deinit();

    index = 0;
    while (index < download_options.path.len) : (index += 1) {
        const file = try std.fs.cwd().openFile(download_options.path[index], .{});
        defer file.close();
        try std.compress.gzip.decompress(file.reader(), buf.writer());

        _ = try repository.read(repos[index].url, buf.items);

        buf.clearRetainingCapacity();
    }
    return repository;
}

fn readPackageDirs(alloc: Allocator, dirs: []const []const u8) !Repository {
    var repo = try Repository.init(alloc);
    errdefer repo.deinit();

    var i: usize = 0;
    while (i < dirs.len) : (i += 1) {
        var package_dir = std.fs.cwd().openDir(dirs[i], .{ .iterate = true }) catch |err| {
            fatal("ERROR: could not open package directory '{s}': {s}\n", .{ dirs[i], @errorName(err) });
        };
        defer package_dir.close();

        readPackagesIntoRepository(alloc, &repo, package_dir) catch |err| {
            fatal("ERROR: could not read package '{s}': {s}\n", .{ dirs[i], @errorName(err) });
        };
        std.debug.print("read package directory '{s}'\n", .{dirs[i]});
    }

    std.debug.print("Packages read:\n", .{});
    var it = repo.iter();
    while (it.next()) |p| {
        std.debug.print("    {s} {s}\n", .{ p.name, p.version_string });
    }
    return repo;
}

/// Walk directory recursively and add all DESCRIPTION files to the given repository.
fn readPackagesIntoRepository(alloc: Allocator, repository: *Repository, dir: std.fs.Dir) !void {
    var walker = try dir.walk(alloc);
    defer walker.deinit();

    while (try walker.next()) |d| {
        switch (d.kind) {
            .file => {
                if (std.mem.eql(u8, "DESCRIPTION", d.basename)) {
                    const file = try d.dir.openFile(d.basename, .{});
                    defer file.close();
                    const buf = try file.readToEndAlloc(alloc, 128 * 1024);
                    defer alloc.free(buf);

                    std.debug.print("reading {s}\n", .{d.path});
                    _ = try repository.read(d.path, buf);
                }
            },

            // walker is a recursive walker, so there's no need to recurse
            // into directories.
            else => continue,
        }
    }
}

/// Walk through all roots recursively looking for a directory called
/// name. Caller owns returned slice memory.
fn findDirectory(alloc: Allocator, name: []const u8, roots: []const []const u8) !?[]const u8 {
    for (roots) |root| {
        if (std.mem.eql(u8, name, std.fs.path.basename(root)))
            return try alloc.dupe(u8, root);

        var start = std.fs.cwd().openDir(root, .{ .iterate = true }) catch |err| {
            std.debug.print("WARNING: cannot open directory '{s}': {s}\n", .{ root, @errorName(err) });
            continue;
        };
        defer start.close();

        var walker = try start.walk(alloc);
        defer walker.deinit();

        while (try walker.next()) |d| {
            switch (d.kind) {
                .directory => {
                    if (std.mem.eql(u8, name, d.basename)) {
                        return try std.fs.path.join(alloc, &.{ root, d.path });
                    }
                },
                else => continue,
            }
        }
    }
    return null;
}

fn findTarball(
    alloc: Allocator,
    package: NAVC,
    repo: Repository,
    index: Repository.Index,
) !?[]const u8 {
    if (index.findPackage(package)) |found| {
        const slice = repo.packages.slice();
        const name = slice.items(.name)[found];
        const ver = slice.items(.version_string)[found];

        const tarball = try std.fmt.allocPrint(
            alloc,
            "{s}_{s}.tar.gz",
            .{ name, ver },
        );
        return tarball;
    }
    return null;
}

/// Caller owns returned slice memory.
fn calculateDependencies(alloc: Allocator, packages: Repository, cloud: Repository) ![]NAVC {
    // collect external dependencies
    var deps = try getDirectDependencies(alloc, packages);
    defer deps.deinit();

    // sort the hash map
    deps.sort(NAVCHashMapSortContext{ .keys = deps.keys() });

    // print direct dependencies
    std.debug.print("\nDirect dependencies:\n", .{});
    for (deps.keys()) |navc| {
        std.debug.print("    {}\n", .{navc});
    }

    // collect their transitive dependencies
    const temp_keys = try alloc.dupe(NAVC, deps.keys());
    defer alloc.free(temp_keys);

    for (temp_keys) |navc| {
        const trans = cloud.transitiveDependenciesNoBase(alloc, navc) catch |err| switch (err) {
            error.NotFound => {
                std.debug.print("skipping {s}: could not find transitive dependencies.\n", .{navc.name});
                continue;
            },
            error.OutOfMemory => {
                fatal("out of memory.\n", .{});
            },
        };
        defer alloc.free(trans);
        for (trans) |x|
            try deps.put(x, true);
    }

    // sort the hash map
    deps.sort(NAVCHashMapSortContext{ .keys = deps.keys() });

    // print everything out
    std.debug.print("\nTransitive dependencies:\n", .{});
    for (deps.keys()) |navc| {
        std.debug.print("    {}\n", .{navc});
    }

    // merge version constraints
    const merged = try r_repo_parse.version.mergeNameAndVersionConstraints(alloc, deps.keys());
    std.debug.print("\nMerged transitive dependencies:\n", .{});
    for (merged) |navc| {
        std.debug.print("    {}\n", .{navc});
    }

    return merged;
}

/// Caller must free returned slice.
fn getDirectDependencies(alloc: Allocator, packages: Repository) !NAVCHashMap {
    var deps = NAVCHashMap.init(alloc);

    var it = packages.iter();
    while (it.next()) |p| {
        for (p.depends) |navc| {
            if (isBaseOrRecommended(navc.name)) continue;
            if (try packages.findLatestPackage(alloc, navc) == null) {
                try deps.put(navc, true);
            }
        }
        for (p.imports) |navc| {
            if (isBaseOrRecommended(navc.name)) continue;
            if (try packages.findLatestPackage(alloc, navc) == null) {
                try deps.put(navc, true);
            }
        }
        for (p.linkingTo) |navc| {
            if (isBaseOrRecommended(navc.name)) continue;
            if (try packages.findLatestPackage(alloc, navc) == null) {
                try deps.put(navc, true);
            }
        }
    }
    return deps;
}

/// Requires thread-safe allocator.
fn checkAndCreateAssets(
    alloc: Allocator,
    packages: []NAVC,
    cloud: Repository,
    cloud_index: Repository.Index,
    assets_orig: Assets,
) !Assets {
    // find the source
    var assets = Assets{};
    var lock = std.Thread.Mutex{};

    var pool: std.Thread.Pool = undefined;
    try std.Thread.Pool.init(&pool, .{ .allocator = alloc });
    defer pool.deinit();
    var wg = std.Thread.WaitGroup{};

    for (packages) |navc| {
        pool.spawnWg(
            &wg,
            &checkAndAddOnePackage,
            .{ alloc, navc, cloud, cloud_index, &assets, assets_orig, &lock },
        );
    }
    pool.waitAndWork(&wg);

    const C = struct {
        keys: []const []const u8,
        pub fn lessThan(ctx: @This(), a_index: usize, b_index: usize) bool {
            return std.mem.order(u8, ctx.keys[a_index], ctx.keys[b_index]) == .lt;
        }
    }; // TODO: move this to a util lib somewhere

    assets.map.sort(C{ .keys = assets.map.keys() });
    return assets;
}

fn checkAndAddOnePackage(
    alloc: Allocator,
    package: NAVC,
    cloud: Repository,
    index: Repository.Index,
    assets: *Assets,
    assets_orig: Assets,
    lock: *Mutex,
) void {
    const allocPrint = std.fmt.allocPrint;

    if (Repository.Tools.matchPackage(index, package)) |found| {
        const slice = cloud.packages.slice();
        const name = slice.items(.name)[found];
        const repo = slice.items(.repository)[found];
        const ver = slice.items(.version_string)[found];
        const url1 = allocPrint(
            alloc,
            "{s}/package={s}&version={s}",
            .{ repo, name, ver },
        ) catch @panic("OOM");
        const url2 = allocPrint(
            alloc,
            "{s}/src/contrib/{s}_{s}.tar.gz",
            .{ repo, name, ver },
        ) catch @panic("OOM");
        const url3 = allocPrint(
            alloc,
            "{s}/src/contrib/Archive/{s}_{s}.tar.gz",
            .{ repo, name, ver },
        ) catch @panic("OOM");

        if (download.headOk(alloc, url1) catch false) {
            lock.lock();
            defer lock.unlock();
            updateAssetEntry(alloc, package.name, url1, assets, assets_orig);
        } else if (download.headOk(alloc, url2) catch false) {
            lock.lock();
            defer lock.unlock();
            updateAssetEntry(alloc, package.name, url2, assets, assets_orig);
        } else if (download.headOk(alloc, url3) catch false) {
            lock.lock();
            defer lock.unlock();
            updateAssetEntry(alloc, package.name, url3, assets, assets_orig);
        } else {
            fatal("ERROR: NOT FOUND: {s}\nERROR: NOT FOUND: {s}\nERROR: NOT FOUND: {s}", .{ url1, url2, url3 });
        }
    }
}

fn updateAssetEntry(
    alloc: Allocator,
    name: []const u8,
    url: []const u8,
    assets: *Assets,
    orig_assets: Assets,
) void {
    if (orig_assets.map.get(name)) |orig| {
        if (std.mem.eql(u8, orig.url, url)) {
            assets.map.put(alloc, name, orig) catch @panic("OOM");
            return;
        }
    }

    std.debug.print("Adding asset: {s}: {s}\n", .{ name, url });
    assets.map.put(alloc, name, .{ .url = url }) catch @panic("OOM");
}

fn writeAssets(alloc: Allocator, path: []const u8, assets: Assets) !void {
    var config_root = try config_json.readConfigRoot(alloc, path, .{});

    // merge and clobber existing assets dict
    {
        var it = assets.map.iterator();
        while (it.next()) |e| {
            try config_root.@"generate-build".assets.map.put(alloc, e.key_ptr.*, e.value_ptr.*);
        }
    }

    const bak = try std.fmt.allocPrint(alloc, "{s}.__bak__", .{path});
    std.fs.cwd().deleteFile(bak) catch {};
    try std.fs.cwd().copyFile(path, std.fs.cwd(), bak, .{});
    {
        const config_file = try std.fs.cwd().createFile(path, .{});
        defer config_file.close();
        try std.json.stringify(config_root, .{ .whitespace = .indent_2 }, config_file.writer());
    }
    std.fs.cwd().deleteFile(bak) catch {};

    std.debug.print("\nWrote {s}\n", .{path});
}

fn writeBuildRules(
    alloc: Allocator,
    out_path: []const u8,
    config_path: []const u8,
    merged: []NAVC,
    packages: Repository,
    cloud: Repository,
    cloud_index: Repository.Index,
    package_dirs: []const []const u8,
) !void {
    var file = try std.fs.cwd().createFile(out_path, .{});
    defer file.close();
    const writer = file.writer();

    try std.fmt.format(writer,
        \\// This file is generated by generate-build. Do not edit by hand.
        \\
        \\const std = @import("std");
        \\pub fn build(b: *std.Build, asset_dir: std.Build.LazyPath) !void {{
        \\
        \\const libdir = b.addWriteFiles();
        \\
    , .{});

    var merged_packages = try std.ArrayList(Repository.Package).initCapacity(alloc, merged.len);
    defer merged_packages.deinit();
    for (merged) |navc| {
        if (Repository.Tools.matchPackage(cloud_index, navc)) |idx| {
            merged_packages.appendAssumeCapacity(cloud.packages.get(idx));
        } else unreachable;
    }

    {
        const ordered = try cloud.calculateInstallationOrder(merged_packages.items, .{});
        defer alloc.free(ordered);

        for (ordered) |p| {
            const tarball = try std.fmt.allocPrint(
                alloc,
                "{s}_{s}.tar.gz",
                .{ p.name, p.version_string },
            );

            try writeOnePackage(writer, p, tarball, config_path, false);
        }
    }
    {
        const ordered = try packages.calculateInstallationOrderAll();
        for (ordered) |p| {
            if (try findDirectory(alloc, p.name, package_dirs)) |dir| {
                defer alloc.free(dir);
                try writeOnePackage(writer, p, dir, config_path, true);
            } else {
                std.debug.print("WARNING: failed to find directory for {s}\n", .{p.name});
            }
        }
    }

    try std.fmt.format(writer, "\n}}\n", .{});
    std.debug.print("Wrote {s}\n", .{out_path});
}

fn writeOnePackage(
    writer: anytype,
    p: Repository.Package,
    dir: []const u8,
    config_path: []const u8,
    is_dir: bool,
) !void {
    const format = std.fmt.format;

    try format(writer,
        \\
        \\const @"{s}" = b.addSystemCommand(&.{{ "R" }});
        \\
    , .{p.name});
    try format(writer,
        \\@"{s}".addArgs(&.{{
        \\    "CMD",
        \\    "INSTALL",
        \\    "--no-docs",
        \\    "--no-multiarch",
        \\    "-l",
        \\}});
        \\
    , .{p.name});
    try format(writer,
        \\_ = @"{s}".addDirectoryArg(libdir.getDirectory());
        \\
    , .{p.name});

    if (is_dir) {
        try format(writer,
            \\const @"{0s}_src" = b.addWriteFiles();
            \\_ = @"{0s}_src".addCopyDirectory(b.path("{1s}"), "", .{{}});
            \\_ = @"{0s}".addDirectoryArg(@"{0s}_src".getDirectory());
            \\@"{0s}".step.name = "{0s}";
            \\
        , .{ p.name, dir });
    } else {
        try format(writer,
            \\_ = @"{0s}".addFileArg(asset_dir.path(b, "{1s}"));
            \\@"{0s}".step.name = "{0s}";
            \\@"{0s}".addFileInput(b.path("{2s}"));
            \\
        , .{ p.name, dir, config_path });
    }

    // capture stdout
    try format(writer,
        \\const @"{0s}_out" = @"{0s}".captureStdOut();
        \\
    , .{p.name});

    // capture stderr and discard it
    try format(writer,
        \\_ = @"{s}".captureStdErr();
        \\
    , .{p.name});

    for (p.depends) |navc| {
        if (isBaseOrRecommended(navc.name)) continue;
        try format(writer,
            \\@"{s}".step.dependOn(&@"{s}".step);
            \\
        , .{ p.name, navc.name });
    }
    for (p.imports) |navc| {
        if (isBaseOrRecommended(navc.name)) continue;
        try format(writer,
            \\@"{s}".step.dependOn(&@"{s}".step);
            \\
        , .{ p.name, navc.name });
    }
    for (p.linkingTo) |navc| {
        if (isBaseOrRecommended(navc.name)) continue;
        try format(writer,
            \\@"{s}".step.dependOn(&@"{s}".step);
            \\
        , .{ p.name, navc.name });
    }

    try format(writer,
        \\ const @"{0s}_install" = b.addInstallDirectory(.{{
        \\.source_dir = libdir.getDirectory().path(b, "{0s}"),
        \\.install_dir = .{{ .custom = "lib" }},
        \\.install_subdir = "{0s}",
        \\}});
        \\
        \\@"{0s}_install".step.dependOn(&@"{0s}".step);
        \\
    , .{p.name});

    try format(writer,
        \\b.getInstallStep().dependOn(&@"{s}_install".step);
        \\
    , .{p.name});

    try format(writer,
        \\b.getInstallStep().dependOn(&b.addInstallFileWithDir(@"{0s}_out", .{{ .custom = "logs" }}, "{0s}.log").step);
        \\
    , .{p.name});
}

pub fn main() !void {
    var gpa = std.heap.GeneralPurposeAllocator(.{}).init;
    defer _ = gpa.deinit();

    var arena = std.heap.ArenaAllocator.init(gpa.allocator());
    defer arena.deinit();
    var tsa = std.heap.ThreadSafeAllocator{ .child_allocator = arena.allocator() };
    const alloc = tsa.allocator();

    const args = try std.process.argsAlloc(alloc);
    defer std.process.argsFree(alloc, args);

    if (args.len < NUM_ARGS_MIN + 1) usage();
    const config_path = args[1];
    const out_dir_path = args[2];

    const config_root = config_json.readConfigRoot(alloc, config_path, .{}) catch |err| {
        fatal("ERROR: failed to read config file '{s}': {s}", .{ config_path, @errorName(err) });
    };
    const config = config_root.@"generate-build";
    const repos = config.repos;
    const assets_orig = config.assets;

    // this requires a threadsafe allocator
    const cloud = readRepositories(alloc, repos, out_dir_path) catch |err| {
        fatal("ERROR: failed to download/read repositories: {s}\n", .{@errorName(err)});
    };
    const cloud_index = Repository.Index.init(cloud) catch |err| {
        fatal("ERROR: failed to create repository index: {s}\n", .{@errorName(err)});
    };

    const package_dirs = args[NUM_ARGS_MIN + 1 .. args.len];

    std.debug.print("Package directories:\n", .{});
    for (package_dirs) |d| {
        std.debug.print("    {s}\n", .{d});
    }

    const packages = readPackageDirs(alloc, package_dirs) catch |err| {
        fatal("ERROR: failed to read package directories: {s}\n", .{@errorName(err)});
    };
    const merged = calculateDependencies(alloc, packages, cloud) catch |err| {
        fatal("ERROR: failed to calculate dependencies: {s}\n", .{@errorName(err)});
    };

    const assets = checkAndCreateAssets(alloc, merged, cloud, cloud_index, assets_orig) catch |err| {
        fatal("ERROR: failed to check and create assets: {s}\n", .{@errorName(err)});
    };
    try writeAssets(alloc, config_path, assets);

    const generated = try std.fs.path.join(alloc, &.{ out_dir_path, "build.zig" });
    try writeBuildRules(
        alloc,
        generated,
        config_path,
        merged,
        packages,
        cloud,
        cloud_index,
        package_dirs,
    );
}

fn isBaseOrRecommended(name: []const u8) bool {
    const isBasePackage = Repository.Tools.isBasePackage;
    const isRecommendedPackage = Repository.Tools.isRecommendedPackage;
    return isBasePackage(name) or isRecommendedPackage(name);
}

fn fatal(comptime format: []const u8, args: anytype) noreturn {
    std.debug.print(format, args);
    std.process.exit(1);
}

test {
    _ = std.testing.refAllDecls(@This());
}
