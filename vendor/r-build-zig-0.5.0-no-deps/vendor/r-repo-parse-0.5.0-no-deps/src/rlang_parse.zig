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

//! A limited R language parser. Primarily intended to support the use
//! of R code as data, without resorting to the use of the `eval()`
//! function. R "code as data" is used in the Authors@R field of
//! package DESCRIPTION files, for example.
//!
//! The parser returns a sequence of nodes, each of which is either a
//! function call specifier or a function argument specifier. Function
//! call specifiers contain the name of the function called, a sequence
//! of positional arguments, and a sequence of named arguments. If
//! positional and named arguments are interleaved, the overall order
//! of arguments is lost. For example, if three named arguments appear
//! before the first unnamed argument, the latter will be returned as
//! the first positional argument. There is no attempt to perform
//! argument matching as defined in
//! https://cran.r-project.org/doc/manuals/r-release/R-lang.html#Argument-matching,
//! because that is not possible without evaluating the definition of
//! the function being called.
//!
//! Parsed nodes are returned in a sequence one at a time by successive
//! calls to `Parser.next`. For a simple state machine which
//! demonstrates how to consume parsed nodes for semantic analysis, see
//! `Authors.zig`.

// -- tokenizer ----------------------------------------------------

const Token = union(enum) {
    open_round,
    close_round,
    identifier: []const u8,
    string: []const u8,
    equal,
    comma,
    eof,

    /// True if tokens are structurally equal. Strings are compared.
    pub fn eql(self: Token, other: Token) bool {
        // copied from std.testing.expectEqualInner
        const Tag = std.meta.Tag(@TypeOf(self));
        if (@as(Tag, self) != @as(Tag, other)) return false;
        return switch (self) {
            .identifier => std.mem.eql(u8, self.identifier, other.identifier),
            .string => std.mem.eql(u8, self.string, other.string),
            else => true,
        };
    }

    pub fn format(self: Token, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try switch (self) {
            .open_round => writer.print("(", .{}),
            .close_round => writer.print(")", .{}),
            .identifier => |x| writer.print("{s}", .{x}),
            .string => |x| writer.print("\"{s}\"", .{x}),
            .equal => writer.print("=", .{}),
            .comma => writer.print(",", .{}),
            .eof => writer.print("<EOF>", .{}),
        };
    }
};

pub const Tokenizer = struct {
    source: []const u8 = &.{},
    index: usize = 0,
    strings: *StringStorage,

    /// Initialise a Tokenizer and ready it to return one token at a
    /// time by calls to its `next` function. Tokens representing
    /// strings will copy the strings out of buffer and into the
    /// provided StringStorage.
    pub fn init(source: []const u8, strings: *StringStorage) Tokenizer {
        return .{ .source = source, .index = 0, .strings = strings };
    }

    pub fn deinit(self: *Tokenizer) void {
        self.* = undefined;
    }

    pub const Result = union(enum) {
        ok: TokenLoc,
        err: ErrLoc,
    };
    pub const TokenLoc = struct {
        token: Token,
        loc: usize,
    };
    pub const ErrLoc = struct {
        err: Err,
        loc: usize,
    };
    pub const StringLoc = struct {
        string: []const u8,
        loc: usize,
    };
    pub const Err = enum {
        empty,
        unterminated_string,
        bad_token,

        pub fn format(self: Err, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
            _ = fmt;
            _ = options;
            try switch (self) {
                .empty => writer.print("empty", .{}),
                .unterminated_string => writer.print("unterminated string", .{}),
                .bad_token => writer.print("bad token", .{}),
            };
        }
    };

    /// Return the next token in the source provided to the `init`
    /// function. Strings are copied to the StringStorage provided to
    /// the `init` function. Locations are byte indexes into the
    /// source.
    pub fn next(self: *Tokenizer) error{OutOfMemory}!Result {
        const State = enum {
            start,
            identifier,
            number,
            string,
            string_backslash,
            string_single,
            string_single_backslash,
            hash,
        };
        const Loc = struct {
            start: usize,
            end: usize,
        };

        var state: State = .start;
        var string: Loc = .{ .start = self.index, .end = self.index };

        while (self.index < self.source.len) {
            const c = self.source[self.index];
            const cpos = self.index;
            self.index += 1;

            switch (state) {
                .start => switch (c) {
                    'A'...'Z', 'a'...'z', '_', '.' => state = .identifier,
                    '0'...'9' => {
                        // treat numbers integers as strings
                        string.start = cpos;
                        state = .number;
                    },
                    '"' => {
                        string.start = cpos;
                        state = .string;
                    },
                    '\'' => {
                        string.start = cpos;
                        state = .string_single;
                    },
                    '(' => return ok(.open_round, cpos),
                    ')' => return ok(.close_round, cpos),
                    '=' => return ok(.equal, cpos),
                    ',' => return ok(.comma, cpos),
                    '\n', '\r', '\t', ' ' => string.start = self.index, // skip whitespace
                    '#' => state = .hash,
                    else => return err(.bad_token, cpos),
                },
                .hash => switch (c) {
                    '\n' => state = .start,
                    else => continue,
                },
                .string => switch (c) {
                    '"' => {
                        // string.start points to open quote
                        string.end = cpos;
                        const s = try self.strings.append(self.source[string.start + 1 .. string.end]);
                        return ok(.{ .string = s }, string.start);
                    },
                    '\\' => state = .string_backslash,
                    else => continue,
                },
                .string_single => switch (c) {
                    '\'' => {
                        // string.start points to open quote
                        string.end = cpos;
                        const s = try self.strings.append(self.source[string.start + 1 .. string.end]);
                        return ok(.{ .string = s }, string.start);
                    },
                    '\\' => state = .string_single_backslash,
                    else => continue,
                },
                .string_backslash => state = .string,
                .string_single_backslash => state = .string_single,

                .identifier => switch (c) {
                    'A'...'Z', 'a'...'z', '0'...'9', '-', '_', '.' => continue,
                    else => {
                        self.index -= 1; // backtrack
                        string.end = cpos;
                        const s = try self.strings.append(self.source[string.start..string.end]);
                        return ok(.{ .identifier = s }, string.start);
                    },
                },
                .number => switch (c) {
                    '0'...'9', '-', '.' => continue,
                    else => {
                        self.index -= 1; // backtrack
                        string.end = cpos;
                        const s = try self.strings.append(self.source[string.start..string.end]);
                        return ok(.{ .string = s }, string.start);
                    },
                },
            }
        }

        // end of input reached
        switch (state) {
            .start, .hash => return ok(.eof, self.index),
            .identifier => {
                string.end = self.index;
                const s = try self.strings.append(self.source[string.start..string.end]);
                return ok(.{ .identifier = s }, string.start);
            },
            .number => {
                string.end = self.index;
                const s = try self.strings.append(self.source[string.start..string.end]);
                return ok(.{ .string = s }, string.start);
            },
            .string, .string_single, .string_backslash, .string_single_backslash => {
                return err(.unterminated_string, string.start);
            },
        }
    }

    pub fn back(self: *Tokenizer, loc: usize) void {
        self.index = loc;
    }

    fn ok(tok: Token, loc: usize) Result {
        return .{ .ok = .{ .token = tok, .loc = loc } };
    }
    fn err(e: Err, loc: usize) Result {
        return .{ .err = .{ .err = e, .loc = loc } };
    }
};

// -- parser -------------------------------------------------------

const Node = union(enum) {
    function_arg: FunctionArg,
    function_call: FunctionCall,

    /// True if structurally equal.
    pub fn eql(self: Node, other: Node) bool {
        // copied from std.testing.expectEqualInner
        const Tag = std.meta.Tag(@TypeOf(self));
        if (@as(Tag, self) != @as(Tag, other)) return false;
        return switch (self) {
            .function_arg => |fa| fa.eql(other.function_arg),
            .function_call => |fc| fc.eql(other.function_call),
        };
    }

    pub fn format(self: Node, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try switch (self) {
            .function_arg => |fa| writer.print("{}", .{fa}),
            .function_call => |fc| writer.print("{}", .{fc}),
        };
    }
};

pub const FunctionCall = struct {
    name: []const u8,
    positional: []const FunctionArg,
    named: []const NamedArgument,

    /// True if structurally equal
    pub fn eql(self: FunctionCall, other: FunctionCall) bool {
        if (!std.mem.eql(u8, self.name, other.name)) return false;
        if (self.positional.len != other.positional.len or self.named.len != other.named.len) return false;

        for (self.positional, other.positional) |a, b| {
            if (!a.eql(b)) return false;
        }
        for (self.named, other.named) |a, b| {
            if (!a.eql(b)) return false;
        }
        return true;
    }

    pub fn format(self: FunctionCall, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try writer.print("(funcall {s}", .{self.name});
        for (self.positional) |fa| {
            try writer.print(" {}", .{fa});
        }
        for (self.named) |na| {
            try writer.print(" {}", .{na});
        }
        try writer.print(")", .{});
    }
};

pub const FunctionArg = union(enum) {
    null,
    identifier: []const u8,
    string: []const u8,
    function_call: FunctionCall,

    pub fn fromNode(node: Node) FunctionArg {
        return switch (node) {
            .function_arg => |fa| fa,
            .function_call => |fc| .{ .function_call = fc },
        };
    }

    pub fn eql(self: FunctionArg, other: FunctionArg) bool {
        const Tag = std.meta.Tag(@TypeOf(self));
        if (@as(Tag, self) != @as(Tag, other)) return false;
        return switch (self) {
            .null => true,
            .identifier => |i| std.mem.eql(u8, i, other.identifier),
            .string => |s| std.mem.eql(u8, s, other.string),
            .function_call => |fc| fc.eql(other.function_call),
        };
    }

    pub fn format(self: FunctionArg, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try switch (self) {
            .null => writer.print("null", .{}),
            .identifier => |s| writer.print("(identifer {s})", .{s}),
            .string => |s| writer.print("(string \"{s}\")", .{s}),
            .function_call => |fc| writer.print("{}", .{fc}),
        };
    }
};

const NamedArgument = struct {
    name: []const u8,
    value: FunctionArg,

    pub fn eql(self: NamedArgument, other: NamedArgument) bool {
        if (!std.mem.eql(u8, self.name, other.name)) return false;
        return self.value.eql(other.value);
    }

    pub fn format(self: NamedArgument, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
        _ = fmt;
        _ = options;
        try writer.print("(named-argument {s} {})", .{ self.name, self.value });
    }
};

pub const Parser = struct {
    alloc: Allocator,
    tokenizer: *Tokenizer,
    strings: *StringStorage,

    /// Provide an ArenaAllocator, because this parser leaks memory.
    pub fn init(alloc: Allocator, tokenizer: *Tokenizer, strings: *StringStorage) Parser {
        return .{
            .alloc = alloc,
            .tokenizer = tokenizer,
            .strings = strings,
        };
    }

    pub fn deinit(self: *Parser) void {
        self.* = undefined;
    }

    pub const Result = union(enum) {
        ok: NodeLoc,
        err: ErrLoc,
    };
    pub const NodeLoc = struct {
        node: Node,
        loc: usize,
    };
    pub const ErrLoc = struct {
        err: Err,
        loc: usize,
    };
    pub const StringLoc = struct {
        string: []const u8,
        loc: usize,
    };
    pub const Err = union(enum) {
        eof,

        // comma and close_round errors are returned from the start
        // state and handled by funcall_start.
        comma,
        close_round,

        expected_identifier,
        expected_argument,
        expected_equal,
        expected_funcall,
        expected_string,
        expected_close_round,
        unexpected_token: Token,
        tokenizer_error: Tokenizer.Err,
    };

    pub fn next(self: *Parser) error{ OutOfMemory, TokenizeError, ParseError }!Result {
        const FuncallState = struct {
            name: StringLoc,
            positional: std.ArrayList(FunctionArg),
            named: std.ArrayList(NamedArgument),
        };
        const FuncallStateStringLoc = struct {
            state: FuncallState,
            identifier: StringLoc,
        };
        const State = union(enum) {
            start,
            open_round,
            open_round_string: StringLoc,
            open_round_identifier: StringLoc,
            identifier: StringLoc,
            funcall_start: FuncallState,
            funcall_comma: FuncallState,
            funcall_identifier: struct {
                state: FuncallState,
                identifier: StringLoc,
            },
            funcall_string: FuncallStateStringLoc,
            funcall_identifier_equal: FuncallStateStringLoc,
            funcall_open_round_expect_string: FuncallState,
            funcall_open_round_string: struct { state: FuncallState, string_loc: StringLoc },
        };
        var state: State = .start;

        while (true) switch (state) {
            .start => {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .identifier => |s| state = .{ .identifier = .{ .string = s, .loc = res.ok.loc } },
                    .string => |s| return ok(.{ .string = s }, res.ok.loc),
                    .comma => return err(.comma, res.ok.loc),
                    .close_round => return err(.close_round, res.ok.loc),
                    .eof => return err(.eof, res.ok.loc),
                    .open_round => state = .open_round,
                    .equal => return err(.expected_identifier, res.ok.loc),
                }
            },
            .open_round => {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .string => |s| state = .{ .open_round_string = .{ .string = s, .loc = res.ok.loc } },
                    .identifier => |s| state = .{ .open_round_identifier = .{ .string = s, .loc = res.ok.loc } },
                    else => return err(.expected_string, res.ok.loc),
                }
            },
            .open_round_string => |s| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .close_round => return ok(.{ .string = s.string }, s.loc),
                    else => return err(.expected_close_round, res.ok.loc),
                }
            },
            .open_round_identifier => |_| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);

                // expect equal and drop/ignore identifier. E.g.:
                // (name=val), as in: person(...,
                // comment=(name=val) which is missing a function
                // name, probably should be comment=c(name=val)
                switch (res.ok.token) {
                    .equal => state = .open_round,
                    else => return err(.expected_equal, res.ok.loc),
                }
            },
            .identifier => |s| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .open_round => state = .{ .funcall_start = .{
                        .name = s,
                        .positional = std.ArrayList(FunctionArg).init(self.alloc),
                        .named = std.ArrayList(NamedArgument).init(self.alloc),
                    } },
                    .comma => return ok(.{ .identifier = s.string }, s.loc),
                    .close_round => {
                        self.tokenizer.back(res.ok.loc); // backtrack
                        return ok(.{ .identifier = s.string }, s.loc);
                    },
                    .eof => return ok(.{ .identifier = s.string }, res.ok.loc),
                    else => |tok| return err(.{ .unexpected_token = tok }, res.ok.loc),
                }
            },
            .funcall_start => |*st| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);

                switch (res.ok.token) {
                    .identifier => |s| state = .{ .funcall_identifier = .{
                        .state = st.*,
                        .identifier = .{ .string = s, .loc = res.ok.loc },
                    } },
                    .string => |s| state = .{ .funcall_string = .{
                        .state = st.*,
                        .identifier = .{ .string = s, .loc = res.ok.loc },
                    } },
                    .comma => state = .{ .funcall_comma = st.* },
                    .open_round => state = .{ .funcall_open_round_expect_string = st.* },
                    .close_round => {
                        // end of funcall
                        return ok_function_call(.{
                            .name = st.name.string,
                            .positional = try st.positional.toOwnedSlice(),
                            .named = try st.named.toOwnedSlice(),
                        }, st.name.loc);
                    },

                    else => |tok| {
                        std.debug.print("error: unexpected token in function {}\n", .{st});
                        return err(.{ .unexpected_token = tok }, res.ok.loc);
                    },
                }
            },
            .funcall_comma => |*st| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);

                // if we see a second comma, infer a null
                // positional argument. Otherwise, restart in
                // funcall_start state.
                switch (res.ok.token) {
                    .comma => {
                        try st.positional.append(.null);
                        state = .{ .funcall_start = st.* };
                    },
                    else => {
                        self.tokenizer.back(res.ok.loc);
                        state = .{ .funcall_start = st.* };
                    },
                }
            },
            .funcall_identifier => |*st| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .comma => {
                        try st.state.positional.append(.{ .identifier = st.identifier.string });
                        state = .{ .funcall_start = st.state };
                    },
                    .equal => state = .{ .funcall_identifier_equal = .{
                        .state = st.state,
                        .identifier = st.identifier,
                    } },
                    .open_round => {
                        // funcall as positional argument.
                        // backtrack and parse expression
                        self.tokenizer.back(st.identifier.loc);

                        const inner = try self.next();
                        if (inner == .err) return inner; // could be , or )

                        const fc: FunctionCall =
                            switch (inner.ok.node) {
                            .function_call => |fc| fc,
                            else => return err(.expected_funcall, res.ok.loc),
                        };

                        try st.state.positional.append(.{ .function_call = fc });
                        state = .{ .funcall_start = st.state };
                    },
                    else => {
                        self.tokenizer.back(res.ok.loc);
                        state = .{ .funcall_start = st.state };
                    },
                }
            },
            .funcall_string => |*st| {
                // deal with quoted named arguments
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);

                switch (res.ok.token) {
                    .comma => {
                        try st.state.positional.append(.{ .string = st.identifier.string });
                        state = .{ .funcall_start = st.state };
                    },
                    .close_round => {
                        try st.state.positional.append(.{ .string = st.identifier.string });
                        self.tokenizer.back(res.ok.loc);
                        state = .{ .funcall_start = st.state };
                    },
                    .equal => state = .{ .funcall_identifier_equal = .{
                        .state = st.state,
                        .identifier = st.identifier,
                    } },
                    else => {
                        self.tokenizer.back(res.ok.loc); // back
                        state = .{ .funcall_start = st.state };
                    },
                }
            },
            .funcall_identifier_equal => |*st| {
                // parse next expression
                const res = try self.next();
                switch (res) {
                    .err => |e| switch (e.err) {
                        .close_round, .comma => {
                            try append_named(&st.state.named, st.identifier.string, .null);
                            self.tokenizer.back(e.loc); // backtrack
                            state = .{ .funcall_start = st.state };
                        },
                        else => return res,
                    },
                    .ok => {
                        try append_named(&st.state.named, st.identifier.string, FunctionArg.fromNode(res.ok.node));
                        state = .{ .funcall_start = st.state };
                    },
                }
            },
            .funcall_open_round_expect_string => |st| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .string => |s| state = .{ .funcall_open_round_string = .{
                        .state = st,
                        .string_loc = .{ .string = s, .loc = res.ok.loc },
                    } },
                    else => return err(.expected_string, res.ok.loc),
                }
            },
            .funcall_open_round_string => |*st| {
                const res = try self.tokenizer.next();
                if (res == .err) return tokenizer_err(res.err);
                switch (res.ok.token) {
                    .close_round => {
                        try st.state.positional.append(.{ .string = st.string_loc.string });
                        state = .{ .funcall_start = st.state };
                    },
                    else => return err(.expected_close_round, res.ok.loc),
                }
            },
        };
    }

    fn append_named(named: *std.ArrayList(NamedArgument), name: []const u8, value: FunctionArg) !void {
        try named.append(.{ .name = name, .value = value });
    }

    fn ok(node: FunctionArg, loc: usize) Result {
        const eql = std.ascii.eqlIgnoreCase;
        const node_: FunctionArg = switch (node) {
            .identifier => |s| if (eql("null", s)) .null else node,
            else => node,
        };

        return .{ .ok = .{ .node = .{ .function_arg = node_ }, .loc = loc } };
    }
    fn ok_function_call(node: FunctionCall, loc: usize) Result {
        return .{ .ok = .{ .node = .{ .function_call = node }, .loc = loc } };
    }
    fn err(e: Err, loc: usize) Result {
        return .{ .err = .{ .err = e, .loc = loc } };
    }
    fn tokenizer_err(tok_err: Tokenizer.ErrLoc) Result {
        return .{ .err = .{ .err = .{ .tokenizer_error = tok_err.err }, .loc = tok_err.loc } };
    }
};

// -- tests --------------------------------------------------------

test "tokenize" {
    const alloc = std.testing.allocator;
    const source =
        \\c()
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "c" },
        .open_round,
        .close_round,
    });
}

test "tokenize 2" {
    const alloc = std.testing.allocator;
    const source =
        \\     c(
        \\  person("first", "second", , "xxx@abc.def.xyz", role = c("aut", "cre"),
        \\           comment = c(ORCID = "0000-0001-8473-069X")),
        \\  )
        \\
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "c" },
        .open_round,
        .{ .identifier = "person" },
        .open_round,
        .{ .string = "first" },
        .comma,
        .{ .string = "second" },
        .comma,
        .comma,
        .{ .string = "xxx@abc.def.xyz" },
        .comma,
        .{ .identifier = "role" },
        .equal,
        .{ .identifier = "c" },
        .open_round,
        .{ .string = "aut" },
        .comma,
        .{ .string = "cre" },
        .close_round,
        .comma,
        .{ .identifier = "comment" },
        .equal,
        .{ .identifier = "c" },
        .open_round,
        .{ .identifier = "ORCID" },
        .equal,
        .{ .string = "0000-0001-8473-069X" },
        .close_round,
        .close_round,
        .comma,
        .close_round,
    });
}

test "tokenize parenthesized string" {
    const alloc = std.testing.allocator;
    const source =
        \\ person(("parenthesized string"))
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "person" },
        .open_round,
        .open_round,
        .{ .string = "parenthesized string" },
        .close_round,
        .close_round,
    });
}

test "tokenize quoted named argument" {
    const alloc = std.testing.allocator;
    const source =
        \\ person("argument" = "value")
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "person" },
        .open_round,
        .{ .string = "argument" },
        .equal,
        .{ .string = "value" },
        .close_round,
    });
}

test "tokenize named vector argument" {
    const alloc = std.testing.allocator;
    const source =
        \\ person(given = c("first", "second"))
        \\
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "person" },
        .open_round,
        .{ .identifier = "given" },
        .equal,
        .{ .identifier = "c" },
        .open_round,
        .{ .string = "first" },
        .comma,
        .{ .string = "second" },
        .close_round,
        .close_round,
    });
}
test "tokenize comment = NULL" {
    const alloc = std.testing.allocator;
    const source =
        \\    person("Xiurui", "Zhu", , "xxx@abc.def", role = c("aut", "cre"),
        \\           comment = NULL)
    ;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    try tokenizeExpect(alloc, &tokenizer, &.{
        .{ .identifier = "person" },
        .open_round,
        .{ .string = "Xiurui" },
        .comma,
        .{ .string = "Zhu" },
        .comma,
        .comma,
        .{ .string = "xxx@abc.def" },
        .comma,
        .{ .identifier = "role" },
        .equal,
        .{ .identifier = "c" },
        .open_round,
        .{ .string = "aut" },
        .comma,
        .{ .string = "cre" },
        .close_round,
        .comma,
        .{ .identifier = "comment" },
        .equal,
        .{ .identifier = "NULL" },
        .close_round,
    });
}

test "parse named vector argument" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\ person(given = c("first", "second"))
        \\
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    std.debug.print("parse named vector argument:  ", .{});
    try doParseDebug(&parser);
}

test "parse parenthesized string" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\ person(("parenthesized string"))
        \\
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

test "parse quoted named argument" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\ person("quoted-argument" = "value")
        \\
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

test "parse comment = NULL" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\    person("Xiurui", "Zhu", , "xxx@abc.def", role = c("aut", "cre"),
        \\           comment = NULL)
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

test "parse email=)" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\    person(given = "First", family = "Second", role = "aut", email=)
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}
test "parse email=," {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\    person(given = "First", family = "Second", role = "aut", email=,)
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

test "parse" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source =
        \\         c(
        \\    person("Caio", "Lente", , "xxx@abc.def.br", role = c("aut", "cre"),
        \\           comment = c(ORCID = "0000-0001-8473-069X")),
        \\    person("Julio", "Trecenti", , "xxx@abc.com", role = "aut",
        \\           comment = c(ORCID = "0000-0002-1680-6389")),
        \\    person("Katerine", "Witkoski", , "xxx@abc.def.br", role = "ctb",
        \\           comment = c(ORCID = "0000-0002-3691-6569")),
        \\    person("Associação Brasileira de Jurimetria", role = c("cph", "fnd"))
        \\  )
        \\
    ;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

test "parse 1" {
    const alloc = std.testing.allocator;
    var arena = std.heap.ArenaAllocator.init(alloc);
    defer arena.deinit();
    const source = "c()";

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = Tokenizer.init(source, &strings);
    defer tokenizer.deinit();

    var parser = Parser.init(arena.allocator(), &tokenizer, &strings);
    defer parser.deinit();

    try doParseDebug(&parser);
}

fn doParseDebug(parser: *Parser) !void {
    while (true) {
        const res = try parser.next();
        switch (res) {
            .err => |e| {
                if (e.err == .eof) {
                    std.debug.print("EOF: {}\n", .{e.loc});
                    return;
                }
                std.debug.print("ERROR: {}: {}\n", .{ e.loc, e.err });
                return error.ParseError;
            },
            .ok => |ok| {
                std.debug.print("RESULT: {}: {}\n", .{ ok.loc, ok.node });
            },
        }
    }
}

fn tokenizeExpect(alloc: Allocator, tokenizer: *Tokenizer, expect: []const Token) !void {
    var toks = std.ArrayList(Token).init(alloc);
    defer toks.deinit();
    while (true) {
        switch (try tokenizer.next()) {
            .ok => |token_loc| {
                switch (token_loc.token) {
                    .eof => break,
                    else => {
                        try toks.append(token_loc.token);
                        // std.debug.print("Token: {}\n", .{token_loc.token});
                    },
                }
            },
            .err => |e| {
                std.debug.print("Unexpected tokenize error: {}\n", .{e});
                return error.TokenizeError;
            },
        }
    }

    try expectTokens(expect, toks.items);
}

fn expectTokens(expect: []const Token, actual: []const Token) !void {
    if (expect.len != actual.len) return error.UnequalLengths;

    // langref: lengths must be equal otherwise detectable illegal
    // behaviour, so the above if test is not strictly needed for a
    // test function
    for (expect, actual) |e, a| {
        if (!e.eql(a)) {
            std.debug.print("Expected: {}, actual: {}\n", .{ e, a });
            return error.ExpectFailed;
        }
    }
}

const std = @import("std");
const Allocator = std.mem.Allocator;
const StringStorage = @import("string_storage.zig").StringStorage;
