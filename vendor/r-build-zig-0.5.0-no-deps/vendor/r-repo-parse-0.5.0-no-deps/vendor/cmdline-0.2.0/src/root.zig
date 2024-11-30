const std = @import("std");
const testing = std.testing;

pub const Config = struct {
    max_repeat: u16 = 16,
};

pub fn Options(comptime config: Config) type {
    return struct {
        alloc: std.mem.Allocator,

        /// argv0, typically the program name
        argv0: []const u8 = "",

        /// positional arguments, called 'words'
        _words: std.ArrayList([]const u8),

        /// all options keyed by their full names (e.g. --verbose)
        _items: std.StringHashMap(*Option(config)),

        /// subset of options which also have a short name (e.g. -v)
        _shorts: std.AutoHashMap(u8, *Option(config)),

        /// process arguments to deallocate in deinit
        _args: ?std.process.ArgIterator = null,

        const Self = @This();
        const MyOption = Option(config);

        /// Initialize Options struct. Caller must call deinit to release
        /// internal buffers when finished. OPTIONS is a tuple of tuples.
        pub fn init(alloc: std.mem.Allocator, comptime options: anytype) error{ BadArgument, OutOfMemory }!Self {
            const ti = @typeInfo(@TypeOf(options));
            if (ti != .@"struct" or !ti.@"struct".is_tuple) @compileError("expected a tuple of tuples.");

            const OptionCreateOpts = struct {
                /// The name, used as the long option, e.g. --name
                name: ?[]const u8 = null,

                /// By default, will use first character of NAME. Supply NULL to specify no short option.
                short: ?u8 = ' ',

                /// Set to true if this is a boolean option with no value captured.
                boolean: bool = false,

                /// Set to true if this is an option that captures multiple string values
                repeat: bool = false,
            };

            var items = std.StringHashMap(*MyOption).init(alloc);
            var shorts = std.AutoHashMap(u8, *MyOption).init(alloc);
            const words = std.ArrayList([]const u8).init(alloc);

            inline for (options) |one| {
                const one_ti = @typeInfo(@TypeOf(one));
                if (one_ti != .@"struct" or !one_ti.@"struct".is_tuple) @compileError("expected a tuple of tuples.");

                comptime var create_opts = OptionCreateOpts{};

                inline for (one) |x| comptime {
                    const x_ty = @TypeOf(x);
                    const x_ti = @typeInfo(x_ty);

                    if (x_ty == comptime_int) {
                        const c: u8 = x;
                        if (c == 0) {
                            create_opts.short = null;
                        } else {
                            create_opts.short = c;
                        }
                        continue;
                    }
                    if (x_ty == bool) {
                        create_opts.boolean = true;
                        continue;
                    }
                    if (x_ty == []const u8 or (x_ti == .pointer and @typeInfo(x_ti.pointer.child) == .array)) {
                        if (create_opts.name != null) {
                            if (std.mem.eql(u8, create_opts.name.?, x)) {
                                create_opts.repeat = true;
                                continue;
                            }

                            if (x.len == 1) {
                                if (x[0] == 0) {
                                    create_opts.short = null;
                                } else {
                                    create_opts.short = x[0];
                                }
                                continue;
                            }
                            @compileError("Unexpected string that is not a single character or a repeat of previous option name: " ++ x);
                        }
                        create_opts.name = x;
                        continue;
                    }

                    @compileError("Expected a slice, bool or comptime_int, got " ++ @typeName(@TypeOf(x)));
                };

                // name must exist and be more than one character
                if (create_opts.name == null or create_opts.name.?.len < 2)
                    return error.BadArgument;

                // name must not have spaces or tabs etc
                if (std.mem.indexOfAny(u8, create_opts.name.?, " \t\r\n") != null)
                    return error.BadArgument;

                // default short option is first character of name.
                if (create_opts.short == ' ')
                    create_opts.short = create_opts.name.?[0];

                const option = try alloc.create(MyOption);

                if (create_opts.name) |name| {
                    option.init(name, create_opts.boolean);
                    try items.put(name, option);
                }

                if (create_opts.short) |s| {
                    try shorts.put(s, option);
                }

                if (create_opts.repeat)
                    option.is_repeat = true;
            }

            return .{
                .alloc = alloc,
                ._items = items,
                ._shorts = shorts,
                ._words = words,
            };
        }

        pub fn deinit(self: *Self) void {

            // destroy options
            var it = self._items.iterator();
            while (it.next()) |e| {
                self.alloc.destroy(e.value_ptr.*);
            }

            // words are slices into the process argument memory, with
            // lifetime equal to the lifetime of the
            // self.process.ArgIterator that is allocated in parse()
            self._words.deinit();

            self._shorts.deinit();
            self._items.deinit();

            if (self._args) |*args|
                args.deinit();

            self.* = undefined;
        }

        /// Parse command line arguments. Allocates for process args using
        /// its own allocator (provided in init).
        pub fn parse(self: *Self) ParseResult {
            self._args = std.process.argsWithAllocator(self.alloc) catch |err| {
                return .{ .err = .{ .systemError = err } };
            };
            return self._parse(&self._args.?) catch |err| .{ .err = .{ .systemError = err } };
        }

        /// Get a previously created option by its name.
        pub fn getOption(self: Self, name: []const u8) ?*const MyOption {
            if (self._items.get(name)) |o| return o;
            if (name.len == 1) return self._shorts.get(name[0]);
            return null;
        }

        /// Get an option's value if it is present. For boolean options
        /// that are present, this will be an empty slice. If the option
        /// is not present, null is returned.
        pub fn get(self: Self, name: []const u8) ?[]const u8 {
            if (self.getOption(name)) |o|
                // if option is present, return its value (a string), or
                // if its value is null, return an empty slice.
                if (o.present) if (o.value) |x| return x else return "";
            return null;
        }

        pub fn getMany(self: Self, name: []const u8) ?[]const []const u8 {
            if (self.getOption(name)) |o| {
                if (o.isRepeat() and o.present and o.repeat_value.len > 0) return o.repeat_value.slice();
            }
            return null;
        }

        /// Return true if option is present.
        pub fn present(self: Self, name: []const u8) bool {
            if (self.getOption(name)) |o| return o.present;
            return false;
        }

        /// Get positional arguments
        pub fn positional(self: Self) [][]const u8 {
            return self._words.items;
        }

        /// Reset all options to present = false for testing purposes, and clear words list
        pub fn reset(self: *Self) void {
            var it = self._items.iterator();
            while (it.next()) |e| {
                e.value_ptr.*.reset();
            }
            self._words.clearAndFree();
        }

        pub fn debugPrint(self: *const Self) void {
            std.debug.print("Options [{*}]: \n", .{self});
            std.debug.print("  argv0 = {s}\n", .{self.argv0});
            std.debug.print("  Positional arguments: {}\n", .{self.positional().len});
            for (self.positional()) |pos| {
                std.debug.print("    {s}\n", .{pos});
            }
            std.debug.print("  Present boolean arguments:\n", .{});
            var it = self._items.iterator();
            while (it.next()) |opt| {
                if (opt.value_ptr.*.value == null and opt.value_ptr.*.present == true)
                    std.debug.print("    {s}\n", .{opt.key_ptr.*});
            }
            std.debug.print("  Missing boolean arguments:\n", .{});
            it = self._items.iterator();
            while (it.next()) |opt| {
                if (opt.value_ptr.*.value == null and opt.value_ptr.*.present == false)
                    std.debug.print("    {s}\n", .{opt.key_ptr.*});
            }
            std.debug.print("  Present arguments:\n", .{});
            it = self._items.iterator();
            while (it.next()) |opt| {
                if (opt.value_ptr.*.value) |val| {
                    if (opt.value_ptr.*.present)
                        std.debug.print("    {s} = {s}\n", .{ opt.key_ptr.*, val });
                }
            }
            std.debug.print("  Missing arguments:\n", .{});
            it = self._items.iterator();
            while (it.next()) |opt| {
                if (opt.value_ptr.*.value) |_| {
                    if (!opt.value_ptr.*.present) {
                        std.debug.print("    {s}\n", .{opt.key_ptr.*});
                    }
                }
            }

            std.debug.print("  Present repeatable arguments:\n", .{});
            it = self._items.iterator();
            while (it.next()) |opt| {
                if (!opt.value_ptr.*.isRepeat()) continue;
                if (opt.value_ptr.*.present) {
                    for (opt.value_ptr.*.repeat_value.slice()) |x| {
                        std.debug.print("    {s} = {s}\n", .{ opt.key_ptr.*, x });
                    }
                }
            }

            std.debug.print("  Missing repeatable arguments:\n", .{});
            it = self._items.iterator();
            while (it.next()) |opt| {
                if (!opt.value_ptr.*.isRepeat()) continue;
                if (!opt.value_ptr.*.present) {
                    std.debug.print("    {s}\n", .{opt.key_ptr.*});
                }
            }
        }

        /// args must be an iterator with a next() function
        fn _parse(options: *Self, args: anytype) !ParseResult {
            var end_of_options: bool = false; // seen '--' ?

            // get argv[0], program name
            if (args.next()) |v| {
                options.argv0 = v;
            }

            while (args.next()) |v| {
                // form: positional argument
                if (end_of_options or !std.mem.startsWith(u8, v, "-")) {
                    // positional argument
                    try options._words.append(v);
                    continue;
                }

                if (std.mem.startsWith(u8, v, "--")) {
                    // form: -- (we are done parsing options)
                    if (v.len == 2) {
                        end_of_options = true;
                        continue;
                    }

                    const key = v[2..]; // chars after '--'

                    // form: --key=value
                    if (std.mem.indexOfScalar(u8, key, '=')) |i| {
                        const realised_key = key[0..i];
                        const val = key[i + 1 ..]; // skip '='

                        const res = handleKeyEqualsValue(options, realised_key, val);
                        if (res == .ok) continue else return res;
                    }

                    // form: --key value
                    const res = handleKeyConsumesNext(options, key, args);
                    if (res == .ok) continue else return res;
                }

                // form: -x
                const key = v[1]; // char after '-'

                if (options._shorts.get(key)) |opt| {
                    // if opt is a boolean flag check for packed boolean flags
                    if (opt.isBoolean()) {
                        // v[1..] captures all the chars after '-'
                        const res = handlePackedBoolean(options, v[1..], args);
                        if (res == .ok) continue else return res;
                    }

                    const res = handleSingleFlag(opt, v[1..], args);
                    if (res == .ok) continue else return res;
                }
                return .{ .err = .{ .unknownFlag = key } };
            }
            return .{ .ok = .{} };
        }

        fn handleKeyEqualsValue(options: *Self, key: []const u8, val: []const u8) ParseResult {
            if (options._items.get(key)) |opt| {
                if (!opt.isBoolean()) {
                    opt.loadFromString(val);
                    return .{ .ok = .{} };
                }
                return .{ .err = .{ .booleanWithValue = key } };
            }
            return .{ .err = .{ .unknownOption = key } };
        }

        fn handleKeyConsumesNext(options: *Self, key: []const u8, args: anytype) ParseResult {
            if (options._items.get(key)) |opt| {
                if (opt.isBoolean()) {
                    opt.present = true;
                    return .{ .ok = .{} };
                }

                if (args.next()) |next| {
                    opt.loadFromString(next);
                    return .{ .ok = .{} };
                }

                return .{ .err = .{ .missingArgument = opt.name } };
            }
            return .{ .err = .{ .unknownOption = key } };
        }

        fn handlePackedBoolean(options: *Self, flags: []const u8, args: anytype) ParseResult {
            for (flags, 1..) |x, pos| {
                if (options._shorts.get(x)) |xopt| {
                    // iterate one character at a time

                    if (xopt.isBoolean()) {
                        xopt.present = true;
                        continue;
                    }

                    // a non-boolean flag is only allowed if it's the last one
                    if (pos != flags.len)
                        return .{ .err = .{ .packedNonBooleanFlag = x } };

                    // consume next argument.
                    // intentially do not support = for the last flag in a packed set
                    if (args.next()) |next| {
                        xopt.loadFromString(next);
                        return .{ .ok = .{} };
                    }
                    return .{ .err = .{ .missingArgument = xopt.name } };
                }
                return .{ .err = .{ .unknownFlag = x } };
            }

            // all flags were boolean and processed
            return .{ .ok = .{} };
        }

        fn handleSingleFlag(
            opt: *MyOption,
            key: []const u8,
            args: anytype,
        ) ParseResult {
            // form: -o=filename.txt
            if (std.mem.indexOfScalar(u8, key, '=')) |i| {
                const val = key[i + 1 ..];
                if (val.len == 0)
                    return .{ .err = .{ .missingArgument = opt.name } };
                opt.loadFromString(val);
                return .{ .ok = .{} };
            }

            // form: -ofilename.txt
            if (key.len > 1) {
                opt.loadFromString(key[1..]);
                return .{ .ok = .{} };
            }

            // form: -o filename.txt
            if (args.next()) |next| {
                opt.loadFromString(next);
                return .{ .ok = .{} };
            }

            // ran out of arguments
            return .{ .err = .{ .missingArgument = opt.name } };
        }
    };
}

pub fn Option(comptime config: Config) type {
    return struct {
        // public fields
        name: []const u8,

        /// union with the argument value. It is initialised to an empty
        /// slice. For boolean options, this is NULL, and the PRESENT
        /// field is used instead.
        value: ?[]const u8 = "",

        /// For repeat options, their values if any.
        repeat_value: std.BoundedArray([]const u8, config.max_repeat) = .{},

        /// True if this is a repeat option.
        is_repeat: bool = false,

        /// True if the option was seen on the command line and its
        /// argument (if any) was valid.
        present: bool = false,

        const Self = @This();

        // private fields

        /// Initialise or reset an existing Option.
        pub fn init(self: *Self, name: []const u8, boolean: bool) void {
            if (boolean == true) {
                self.* = Self{ .name = name, .value = null };
            } else {
                self.* = Self{ .name = name, .value = "" };
            }

            self.reset();
        }

        /// Return true if this is a boolean option
        pub fn isBoolean(self: Self) bool {
            return self.value == null;
        }

        pub fn isRepeat(self: Self) bool {
            return self.is_repeat;
        }

        /// Reset option to not being present, for testing purposes.
        pub fn reset(self: *Self) void {
            self.present = false;
        }

        /// load a value into option from a string.
        pub fn loadFromString(self: *Self, value: []const u8) void {
            // assume success
            self.present = true;
            if (self.isRepeat()) {
                // Note: ignores values if insufficient capacity
                self.repeat_value.append(value) catch {};
            } else {
                self.value = value;
            }
        }
    };
}

/// Tagged union result of a parse operation (check .ok or .err)
const ParseResult = union(enum) {
    ok: struct {},
    err: union(enum) {
        /// a non-boolean flag was observed in a packed flag word (e.g. -itf)
        packedNonBooleanFlag: u8,

        /// attempt to assign a value to a boolean, e.g. --verbose=123
        booleanWithValue: []const u8,

        /// an unknown (single-letter) flag was observed
        unknownFlag: u8,

        /// an unknown (multi-character) option was observed
        unknownOption: []const u8,

        /// option is missing its argument
        missingArgument: []const u8,

        /// system error
        systemError: anyerror,

        pub fn toMessage(self: @This(), alloc: std.mem.Allocator) ![]const u8 {
            switch (self) {
                .packedNonBooleanFlag => |flag| {
                    return try std.fmt.allocPrint(alloc, "Flag {c} is not a boolean flag.", .{flag});
                },
                .booleanWithValue => |opt| {
                    return try std.fmt.allocPrint(alloc, "Option {s} is a boolean option and cannot be assigned a value.", .{opt});
                },
                .unknownFlag => |flag| {
                    return try std.fmt.allocPrint(alloc, "Flag {c} is unknown.", .{flag});
                },
                .unknownOption => |opt| {
                    return try std.fmt.allocPrint(alloc, "Option {s} is unknown.", .{opt});
                },
                .missingArgument => |opt| {
                    return try std.fmt.allocPrint(alloc, "Option {s} is missing its argument.", .{opt});
                },
                .systemError => |err| {
                    return try std.fmt.allocPrint(alloc, "A system error occurred: {s}\n", .{@errorName(err)});
                },
            }
        }
    },
};

test "typical command" {
    const expect = testing.expect;
    const expectEqual = testing.expectEqual;
    const expectEqualStrings = testing.expectEqualStrings;
    const alloc = testing.allocator;

    var options = try Options(.{}).init(alloc, .{
        .{"file"},       .{ "verbose", false }, .{"db"},

        // a repeatable array of strings. Set comptime maximum in
        // Config argument to Options.
        .{ "in", "in" },
    });
    defer options.deinit();

    const t1 = "create --file foo.txt --db ./db";
    {
        var res = try testCmdline(alloc, t1, &options);
        defer res.iterator.deinit();
        try expect(std.mem.eql(u8, options.get("file").?, "foo.txt"));
        try expect(std.mem.eql(u8, options.get("db").?, "./db"));
        try expect(options.present("verbose") == false);
        try expect(options.present("v") == false);

        try expect(options.positional().len == 1);
        try expect(std.mem.eql(u8, options.positional()[0], "create"));
    }

    // -f argument is packed (-fhello)
    {
        options.reset();
        var res = try testCmdline(alloc, "create -fhello.txt -v", &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expect(options.present("file") == true);
        try expect(std.mem.eql(u8, options.get("file").?, "hello.txt"));
        try expect(options.present("verbose") == true);
        try expect(options.present("v") == true);
    }

    // -f argument is packed and quoted (-f"hello world")
    {
        options.reset();
        var res = try testCmdline(alloc, "create -f\"hello world\"", &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expect(options.present("file") == true);
        try expect(std.mem.eql(u8, options.get("file").?, "hello world"));
    }

    // --file argument is missing
    {
        options.reset();
        const t2 = "create foo.txt -v";
        var res = try testCmdline(alloc, t2, &options);
        defer res.deinit();
        try expect(options.get("file") == null);

        try expect(options.positional().len == 2);
        try expect(std.mem.eql(u8, options.positional()[0], "create"));
        try expect(std.mem.eql(u8, options.positional()[1], "foo.txt"));
    }

    // --file is present but has no value
    {
        options.reset();
        const t3 = "create --file   ";
        var res = try testCmdline(alloc, t3, &options);
        defer res.deinit();

        try expect(res.parseResult == .err);
        try expect(res.parseResult.err == .missingArgument);
        try expect(std.mem.eql(u8, res.parseResult.err.missingArgument, "file"));

        try expect(options.get("file") == null);
        try expect(options.get("f") == null);
    }

    // --file argument uses --file=value form
    {
        options.reset();
        const t = "create --file=foo.txt";
        var res = try testCmdline(alloc, t, &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expect(std.mem.eql(u8, options.get("file").?, "foo.txt"));
    }

    // -f argument uses -f=value form
    {
        options.reset();
        const t = "create -f=foo.txt";
        var res = try testCmdline(alloc, t, &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expect(std.mem.eql(u8, options.get("file").?, "foo.txt"));
    }

    // --in one --in two
    {
        options.reset();
        const t = "create --in one --in two -f=foo.txt";
        var res = try testCmdline(alloc, t, &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expectEqual(2, options.getMany("in").?.len);
        try expectEqualStrings("one", options.getMany("in").?[0]);
        try expectEqualStrings("two", options.getMany("in").?[1]);
    }
}

test "use slice instead of static string" {
    const expect = testing.expect;
    const alloc = testing.allocator;

    const file_static = "file";
    const file_slice: []const u8 = file_static[0..file_static.len];

    var options = try Options(.{}).init(alloc, .{
        .{file_slice},
    });
    defer options.deinit();

    var res = try testCmdline(alloc, "create --file foo.txt", &options);
    defer res.iterator.deinit();
    try expect(std.mem.eql(u8, options.get("file").?, "foo.txt"));
}

test "flag packing" {
    const expect = testing.expect;
    const alloc = testing.allocator;
    var options = try Options(.{}).init(alloc, .{
        .{ "i-flag", false },
        .{ "t-flag", false },
        .{ "f-flag", false },
    });
    defer options.deinit();

    {
        var res = try testCmdline(alloc, "-itf", &options);
        defer res.deinit();
        try expect(options.present("i-flag") == true);
        try expect(options.present("t-flag") == true);
        try expect(options.present("f-flag") == true);
    }
    {
        options.reset();
        var res = try testCmdline(alloc, "-i", &options);
        defer res.deinit();
        try expect(options.present("i-flag") == true);
    }
}

test "mixed flag packing" {
    const expect = testing.expect;
    const eql = std.mem.eql;
    const alloc = testing.allocator;
    var options = try Options(.{}).init(alloc, .{
        .{ "extract", 'x', false },
        .{ "verify", false },
        .{"file"},
    });
    defer options.deinit();

    {
        var res = try testCmdline(alloc, "-xvf foo.txt", &options);
        defer res.deinit();
        try expect(res.parseResult == .ok);
        try expect(options.present("extract") == true);
        try expect(options.present("verify") == true);
        try expect(eql(u8, options.get("file").?, "foo.txt"));
    }
}

test "parse errors" {
    const expect = testing.expect;
    const alloc = testing.allocator;
    const eql = std.mem.eql;
    var options = try Options(.{}).init(alloc, .{
        .{ "b-flag", false },
        .{"i-flag"},
    });
    defer options.deinit();

    {
        options.reset();
        var res = try testCmdline(alloc, "-x", &options);
        defer res.deinit();

        try expect(res.parseResult == .err);
        try expect(res.parseResult.err == .unknownFlag);
        try expect(res.parseResult.err.unknownFlag == 'x');
    }
    {
        options.reset();
        var res = try testCmdline(alloc, "-bx", &options);
        defer res.deinit();

        try expect(res.parseResult == .err);
        try expect(res.parseResult.err == .unknownFlag);
        try expect(res.parseResult.err.unknownFlag == 'x');
    }
    {
        var res = try testCmdline(alloc, "-bi", &options);
        defer res.deinit();

        try expect(res.parseResult == .err);
        try expect(res.parseResult.err == .missingArgument);
        try expect(eql(u8, res.parseResult.err.missingArgument, "i-flag"));
    }
}

test "positional arguments" {
    const expect = testing.expect;
    const alloc = testing.allocator;
    var options = try Options(.{}).init(alloc, .{
        .{"file"},
        .{ "verbose", false },
        .{ "gflag", false },
    });
    defer options.deinit();

    // here the -g flag is a boolean so it doesn't consume the next word
    var res = try testCmdline(alloc, "open file -f name.txt -v -g last", &options);
    defer res.deinit();
    try expect(options.positional().len == 3);
    try expect(std.mem.eql(u8, options.positional()[0], "open"));
    try expect(std.mem.eql(u8, options.positional()[1], "file"));
    try expect(std.mem.eql(u8, options.positional()[2], "last"));
    try expect(std.mem.eql(u8, options.get("file").?, "name.txt"));
    try expect(options.present("gflag"));
}

test "args after --" {
    const expect = testing.expect;
    const alloc = testing.allocator;
    var options = try Options(.{}).init(alloc, .{});
    defer options.deinit();

    var res = try testCmdline(alloc, "-- a b c --long", &options);
    defer res.deinit();
    try expect(res.parseResult == .ok);
    try expect(options.positional().len == 4);
    try expect(std.mem.eql(u8, options.positional()[0], "a"));
    try expect(std.mem.eql(u8, options.positional()[1], "b"));
    try expect(std.mem.eql(u8, options.positional()[2], "c"));
    try expect(std.mem.eql(u8, options.positional()[3], "--long"));
}

test "suppress short option" {
    const expect = testing.expect;
    const alloc = testing.allocator;
    var options = try Options(.{}).init(alloc, .{
        .{ "special", 0 },
    });
    defer options.deinit();

    var res = try testCmdline(alloc, "-s hello", &options);
    defer res.deinit();
    try expect(!options.present("special"));
}

test "error on spaces in option name" {
    const alloc = testing.allocator;
    try testing.expectError(error.BadArgument, Options(.{}).init(alloc, .{
        .{"I tried to put some help here"},
    }));
}

test {
    std.testing.refAllDeclsRecursive(Options(.{}));
}

const TestCmdlineResult = struct {
    iterator: std.process.ArgIteratorGeneral(.{}),
    parseResult: ParseResult,

    pub fn deinit(self: *TestCmdlineResult) void {
        self.iterator.deinit();
    }
};

/// caller must `deinit` the return value
fn testCmdline(
    alloc: std.mem.Allocator,
    comptime s: []const u8,
    options: *Options(.{}),
) !TestCmdlineResult {
    // progname stands in for argv[0]
    var it = try std.process.ArgIteratorGeneral(.{}).init(alloc, "progname " ++ s);
    const res = try options._parse(&it);
    return .{ .iterator = it, .parseResult = res };
}
