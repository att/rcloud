const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});
    _ = b.addModule("cmdline", .{
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    // Creates a step for unit testing. This only builds the test executable
    // but does not run it.
    const cmdline_unit_tests = b.addTest(.{
        .root_source_file = b.path("src/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    const run_cmdline_unit_tests = b.addRunArtifact(cmdline_unit_tests);
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_cmdline_unit_tests.step);
}
