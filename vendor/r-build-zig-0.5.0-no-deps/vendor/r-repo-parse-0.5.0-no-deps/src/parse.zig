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

//! Parse Debian Control Files with a focus on the R PACKAGES file !
//! format.
//!
//! Inspired by Zig tokenizer and parser.
const std = @import("std");
const testing = std.testing;
const Allocator = std.mem.Allocator;

const StringStorage = @import("string_storage.zig").StringStorage;

const version = @import("version.zig");
const Version = version.Version;
const Constraint = version.Operator;
const VersionConstraint = version.VersionConstraint;

/// Parser
///
/// See parse_test.zig for a test which can print the ast node list
/// generated from a moderately complicated example.
pub const Parser = struct {
    alloc: Allocator,
    strings: *StringStorage,
    nodes: NodeList,
    parse_error: ?ParseError = null,

    // private, for use only during parsing. undefined otherwise.
    _source: []const u8,
    _tokenizer: Tokenizer,

    pub const ParseError = struct {
        message: []const u8,
        token: Token,
        line: usize,
        pub fn debugPrint(self: ParseError, source: ?[]const u8) void {
            if (source) |s| {
                std.debug.print("ERROR: ParseError on line {}: {s}: {s}\n", .{
                    self.line,
                    self.message,
                    s[self.token.loc.start..self.token.loc.end],
                });
            } else {
                std.debug.print("ERROR: ParseError on line {}: {s}: {}\n", .{
                    self.line,
                    self.message,
                    self.token,
                });
            }
        }
    };
    pub const NodeList = std.ArrayList(Node);
    pub const RootNode = struct {};
    pub const StanzaNode = struct {};
    pub const FieldNode = struct {
        name: []const u8,
    };
    pub const NameAndVersionNode = struct {
        name: []const u8,
        version_constraint: VersionConstraint = .{},
    };
    pub const StringNode = struct {
        value: []const u8,
    };
    pub const FieldEndNode = void;
    pub const StanzaEndNode = void;

    pub const Node = union(enum) {
        root: RootNode,
        stanza: StanzaNode,
        field: FieldNode,
        name_and_version: NameAndVersionNode,
        string_node: StringNode,
        field_end: FieldEndNode,
        stanza_end: StanzaEndNode,
        eof,

        pub fn format(self: Node, comptime fmt: []const u8, options: std.fmt.FormatOptions, writer: anytype) !void {
            _ = fmt;
            _ = options;
            try switch (self) {
                .root => writer.print("(root)", .{}),
                .stanza => writer.print("(stanza)", .{}),
                .field => |x| writer.print("(field {s})", .{x.name}),
                .name_and_version => |x| writer.print("(name-ver {s} {s})", .{ x.name, x.version_constraint }),
                .string_node => |x| writer.print("(string {s})", .{x.value}),
                .field_end => writer.print("(field-end)", .{}),
                .stanza_end => writer.print("(stanza-end)", .{}),
                .eof => writer.print("(eof)", .{}),
            };
        }
    };

    pub fn init(alloc: Allocator, string_storage: *StringStorage) Parser {
        return .{
            .alloc = alloc,
            .strings = string_storage,
            .nodes = std.ArrayList(Node).init(alloc),
            ._source = "",
            ._tokenizer = undefined,
        };
    }

    pub fn deinit(self: *Parser) void {
        self._tokenizer.deinit();
        self.nodes.deinit();
        self.* = undefined;
    }

    pub fn numStanzas(self: Parser) usize {
        var count: usize = 0;
        for (self.nodes.items) |node| {
            if (node == .stanza) count += 1;
        }
        return count;
    }

    pub fn debugPrint(self: Parser) void {
        for (self.nodes.items) |node| {
            std.debug.print("  {s}", .{node});
        }
    }

    /// Parse source that was provided to init().
    pub fn parse(self: *Parser, source: []const u8) error{ ParseError, OutOfMemory, InvalidState }!void {
        // set up source and nodes buffer
        self._source = source;
        try self.nodes.ensureTotalCapacity(source.len / 10);

        self._tokenizer = Tokenizer.init(source);

        try self.appendNode(Node{ .root = .{} });

        while (true) {
            const token = try self.parseStanza();
            if (token.tag == .eof) break;
        }
        try self.appendNode(Node{ .eof = {} });

        if (self.parse_error) |_| {
            return error.ParseError;
        }
    }

    fn parseStanza(self: *Parser) !Token {
        try self.appendNode(Node{ .stanza = .{} });

        var token: Token = undefined;
        while (true) {
            token = try self.parseField();
            switch (token.tag) {
                .end_stanza, .eof => break,
                .end_field => continue,
                .identifier => continue,
                else => unreachable,
            }
        }

        try self.appendNode(Node{ .stanza_end = {} });
        return token;
    }

    fn parseField(self: *Parser) !Token {
        var field: FieldNode = undefined;
        var token: Token = undefined;
        while (true) {
            token = self._tokenizer.next();
            switch (token.tag) {
                .eof, .end_field, .end_stanza => return token,
                .identifier => {
                    field.name = try self.lexeme(token);
                    const expect_colon = self._tokenizer.next();
                    if (expect_colon.tag != .colon)
                        return self.parseError(expect_colon, "expected a colon after field name");

                    try self.appendNode(.{ .field = field });
                    token = try self.parseValue();
                    switch (token.tag) {
                        // .end_stanza token replaces .end_field if it's the last field in a stanza
                        .eof, .end_stanza => {
                            break;
                        },
                        .end_field => {
                            break;
                        },

                        else => continue,
                    }
                },
                else => {
                    return self.parseError(token, "expected identifier");
                },
            }
        }

        try self.appendNode(Node{ .field_end = {} });
        return token;
    }

    fn parseValue(self: *Parser) !Token {
        // Parse strategy is to try to parse a list of package names.
        // If that fails, backtrack and capture a single string
        // literal until the end of field token.

        var node: Node = undefined;

        const ParseValueState = enum {
            start,
            identifier,
            identifier_open_round,
            string,
        };

        var state: ParseValueState = .start;

        var token: Token = undefined;
        var start: usize = 0; // a value cannot appear at loc zero
        while (true) {
            token = self._tokenizer.next();
            if (start == 0) start = token.loc.start;

            switch (state) {
                .start => switch (token.tag) {
                    .invalid => {
                        return self.parseError(token, "syntax error");
                    },
                    .identifier => {
                        state = .identifier;
                        node = Node{
                            .name_and_version = .{ .name = try self.lexeme(token) },
                        };
                    },
                    .comma => {
                        continue;
                    },
                    .eof, .end_field, .end_stanza => break,
                    else => {
                        state = .string;
                        node = Node{
                            .string_node = .{ .value = try self.lexeme(token) },
                        };
                    },
                },
                .identifier => switch (token.tag) {
                    .invalid => {
                        return self.parseError(token, "syntax error");
                    },
                    .comma => {
                        state = .start;
                        try self.appendNode(node);
                    },
                    .open_round => {
                        state = .identifier_open_round;
                    },
                    .eof, .end_field, .end_stanza => {
                        state = .start;
                        try self.appendNode(node);
                        break;
                    },
                    else => {
                        // switch to string, starting back at the first token we saw
                        node = Node{
                            .string_node = .{ .value = self._source[start..token.loc.end] },
                        };
                        state = .string;
                    },
                },
                .identifier_open_round => switch (token.tag) {
                    .invalid => {
                        return self.parseError(token, "syntax error");
                    },
                    .less_than, .less_than_equal, .equal, .greater_than_equal, .greater_than => {
                        const ver = Version.parse(try self.lexeme(token)) catch {
                            // revert back to string
                            node = Node{
                                .string_node = .{ .value = self._source[start..token.loc.end] },
                            };
                            state = .string;
                            continue;
                        };
                        const constraint: Constraint = switch (token.tag) {
                            .less_than => .lt,
                            .less_than_equal => .lte,
                            .equal => .eq,
                            .greater_than_equal => .gte,
                            .greater_than => .gt,
                            else => return self.parseError(token, "expected operator (<, >, = etc)"),
                        };

                        state = .start;
                        node.name_and_version.version_constraint = VersionConstraint.init(constraint, ver);
                        try self.appendNode(node);

                        const expect_close_round = self._tokenizer.next();
                        if (expect_close_round.tag != .close_round) {
                            // switch back to string
                            node = Node{
                                .string_node = .{ .value = self._source[start..token.loc.end] },
                            };
                            state = .string;
                        }
                    },
                    .eof, .end_field, .end_stanza => {
                        return self.parseError(token, "unexpected end field, stanza or file: expected close_round");
                    },
                    else => {
                        // switch to string
                        node = Node{
                            .string_node = .{ .value = self._source[start..token.loc.end] },
                        };
                        state = .string;
                    },
                },
                .string => switch (token.tag) {
                    .invalid => {
                        return self.parseError(token, "syntax error");
                    },
                    .eof, .end_field, .end_stanza => {
                        try self.appendNode(node);
                        break;
                    },
                    else => {
                        // extend string
                        node.string_node.value = self._source[start..token.loc.end];
                    },
                },
            }
        }

        return token;
    }

    fn appendNode(self: *Parser, node: Node) error{ OutOfMemory, ParseError, InvalidState }!void {
        var final = node;
        switch (final) {
            .string_node => |*s| {
                s.value = try self.strings.append(s.value);
            },
            .field => |*x| {
                x.name = try self.strings.append(x.name);
            },
            .name_and_version => |*x| {
                x.name = try self.strings.append(x.name);
            },
            else => {},
        }
        try self.nodes.append(final);
    }

    fn lexeme(self: *Parser, token: Token) error{ParseError}![]const u8 {
        return token.lexeme(self._source) orelse b: {
            _ = self.parseError(token, "expected lexeme");
            break :b error.ParseError;
        };
    }

    fn parseError(self: *Parser, token: Token, message: []const u8) Token {
        self.parse_error = .{
            .token = token,
            .message = message,
            .line = self.locToLine(token.loc),
        };
        return .{ .tag = .eof, .loc = token.loc };
    }

    fn locToLine(self: Parser, loc: Token.Loc) usize {
        var count: usize = 1;
        var index: usize = 0;
        while (index < loc.start) : (index += 1) {
            if (self._source[index] == '\n') count += 1;
        }
        return count;
    }
};

// -- tokenize ---------------------------------------------------------------

pub const Token = struct {
    tag: Tag,
    loc: Loc,

    pub const Loc = struct {
        start: usize,
        end: usize,
    };

    pub const Tag = enum {
        invalid,
        unparsed,
        identifier,
        string_literal,
        colon,
        comma,
        end_field,
        end_stanza,
        open_round,
        close_round,
        less_than,
        less_than_equal,
        equal,
        plus,
        greater_than_equal,
        greater_than,
        eof,
    };

    pub fn lexeme(token: Token, source: []const u8) ?[]const u8 {
        return switch (token.tag) {
            .end_field,
            .end_stanza,
            .eof,
            => null,

            .identifier,
            .invalid,
            .unparsed,
            .string_literal,
            .less_than,
            .less_than_equal,
            .equal,
            .greater_than_equal,
            .greater_than,
            => source[token.loc.start..token.loc.end],

            .colon => ":",
            .close_round => ")",
            .comma => ",",
            .open_round => "(",
            .plus => "+",
        };
    }

    pub fn debugPrint(self: Token, source: []const u8) void {
        if (self.lexeme(source)) |lex| {
            std.debug.print("{} {s}\n", .{ self.tag, lex });
        } else {
            std.debug.print("{}\n", .{self.tag});
        }
    }
};

pub const Tokenizer = struct {
    buffer: []const u8,
    index: usize,

    pub fn init(buffer: []const u8) Tokenizer {
        return .{
            .buffer = buffer,

            // UTF-8 BOM
            .index = if (std.mem.startsWith(u8, buffer, "\xEF\xBB\xBF")) 3 else 0,
        };
    }

    pub fn deinit(self: *Tokenizer) void {
        self.* = undefined;
    }

    pub fn reset(self: *Tokenizer) void {
        self.index = 0;
    }

    const State = enum {
        start,
        identifier,
        identifier_open_round,
        version_literal,
        version_literal_dot,
        version_literal_minus,
        version_literal_r,
        version_literal_r_digit,
        expect_version,
        newline,
        open_angle, // <
        open_angle_equal, // <=
        close_angle, // >
        close_angle_equal, // >=
        equal,
        unparsed,
        invalid,
    };

    /// Return next token. Will always return an .eof at the end. If
    /// an unrecognized token appears in the input, the remainder of
    /// the field is returned as a string_literal.
    pub fn next(self: *Tokenizer) Token {
        var state: State = .start;
        var result: Token = .{
            .tag = .eof,
            .loc = .{
                .start = self.index,
                .end = self.index,
            },
        };

        while (self.index < self.buffer.len) : (self.index += 1) {
            const c = self.buffer[self.index];
            switch (state) {
                .start => switch (c) {
                    0 => {
                        if (self.index == self.buffer.len) return .{
                            .tag = .eof,
                            .loc = .{ .start = self.index, .end = self.index },
                        };
                        state = .invalid;
                    },
                    '\r', '\t', ' ' => {
                        result.loc.start = self.index + 1;
                    },
                    '\n' => {
                        state = .newline;
                    },
                    'a'...'z', 'A'...'Z', '_' => {
                        state = .identifier;
                        result.tag = .identifier;
                    },
                    '0'...'9' => {
                        state = .version_literal;
                        result.tag = .string_literal;
                    },
                    '(' => {
                        result.tag = .open_round;
                        self.index += 1;
                        break;
                    },
                    ')' => {
                        result.tag = .close_round;
                        self.index += 1;
                        break;
                    },
                    '<' => {
                        state = .open_angle;
                    },
                    '>' => {
                        state = .close_angle;
                    },
                    '=' => {
                        state = .equal;
                    },
                    ':' => {
                        result.tag = .colon;
                        self.index += 1;
                        break;
                    },
                    ',' => {
                        result.tag = .comma;
                        self.index += 1;
                        break;
                    },
                    0x01...0x08, 0x0b, 0x0c, 0x0e...0x1f, 0x7f => {
                        state = .invalid;
                    },
                    else => {
                        result.tag = .string_literal;
                        state = .unparsed;
                    },
                },
                .open_angle => {
                    switch (c) {
                        ' ', '\r', '\n', '\t' => {
                            state = .expect_version;
                            result.tag = .less_than;
                        },
                        '=' => {
                            state = .expect_version;
                            result.tag = .less_than_equal;
                        },
                        'r', '0'...'9' => {
                            state = .expect_version;
                            result.tag = .less_than;
                            self.index -= 1; // backtrack
                        },
                        else => {
                            state = .unparsed;
                        },
                    }
                },
                .open_angle_equal => {
                    switch (c) {
                        ' ', '\r', '\n', '\t' => {
                            state = .expect_version;
                            result.tag = .less_than_equal;
                        },
                        'r', '0'...'9' => {
                            state = .expect_version;
                            result.tag = .less_than_equal;
                            self.index -= 1; // backtrack
                        },
                        else => {
                            state = .unparsed;
                        },
                    }
                },
                .close_angle => {
                    switch (c) {
                        ' ', '\r', '\n', '\t' => {
                            state = .expect_version;
                            result.tag = .greater_than;
                        },
                        '=' => {
                            state = .expect_version;
                            result.tag = .greater_than_equal;
                        },
                        'r', '0'...'9' => {
                            state = .expect_version;
                            result.tag = .greater_than;
                            self.index -= 1; // backtrack
                        },
                        else => {
                            state = .unparsed;
                        },
                    }
                },
                .close_angle_equal => {
                    switch (c) {
                        ' ', '\r', '\n', '\t' => {
                            state = .expect_version;
                            result.tag = .greater_than_equal;
                        },
                        'r', '0'...'9' => {
                            state = .expect_version;
                            result.tag = .greater_than_equal;
                            self.index -= 1; // backtrack
                        },
                        else => {
                            state = .unparsed;
                        },
                    }
                },
                .equal => {
                    switch (c) {
                        ' ', '\r', '\n', '\t', '=' => {
                            state = .expect_version;
                            result.tag = .equal;
                        },
                        'r', '0'...'9' => {
                            state = .expect_version;
                            result.tag = .equal;
                            self.index -= 1; // backtrack
                        },
                        else => {
                            state = .unparsed;
                        },
                    }
                },

                // comes after an operator
                .expect_version => {
                    switch (c) {
                        ' ', '\r', '\n', '\t' => {
                            continue;
                        },
                        'r', '0'...'9' => {
                            state = .version_literal;
                            result.loc.start = self.index;
                        },
                        else => {
                            result.tag = .equal;
                            break;
                        },
                    }
                },
                .newline => switch (c) {
                    ' ', '\t' => {
                        // newline followed by space or tab continues a field definition
                        state = .start;
                        result.loc.start = self.index + 1;
                    },
                    '\n' => {
                        // two newlines in a row end stanza
                        result.tag = .end_stanza;
                        self.index += 1;
                        break;
                    },
                    else => {
                        result.tag = .end_field;
                        break;
                    },
                },
                .version_literal => {
                    switch (c) {
                        '\n' => {
                            break;
                        },
                        ')' => break,
                        'r' => {
                            state = .version_literal_r;
                        },
                        '.' => {
                            state = .version_literal_dot;
                        },
                        '-' => {
                            state = .version_literal_minus;
                        },
                        ' ', '\r', '\t' => {
                            break;
                        },
                        '0'...'9' => continue,
                        else => {
                            state = .unparsed;
                            result.tag = .string_literal;
                        },
                    }
                },
                .version_literal_dot => {
                    switch (c) {
                        '0'...'9' => {
                            state = .version_literal;
                        },
                        else => {
                            result.tag = .unparsed;
                            break;
                        },
                    }
                },
                .version_literal_minus => {
                    switch (c) {
                        '0'...'9' => {
                            state = .version_literal;
                        },
                        else => {
                            result.tag = .unparsed;
                            break;
                        },
                    }
                },
                .version_literal_r => {
                    switch (c) {
                        '0'...'9' => {
                            state = .version_literal_r_digit;
                        },
                        else => {
                            result.tag = .unparsed;
                            break;
                        },
                    }
                },
                .version_literal_r_digit => {
                    switch (c) {
                        ' ', '\n', '\r', '\t' => {
                            break;
                        },
                        '0'...'9' => continue,
                        else => {
                            result.tag = .unparsed;
                            break;
                        },
                    }
                },

                .identifier => {
                    switch (c) {
                        'a'...'z', 'A'...'Z', '_', '0'...'9' => continue,
                        '\n', ':', ',', '(', ')' => {
                            break;
                        },

                        ' ', '\r', '\t' => {
                            break;
                        },
                        0x01...0x08, 0x0b, 0x0c, 0x0e...0x1f, 0x7f => {
                            state = .invalid;
                        },
                        else => continue,
                    }
                },
                .identifier_open_round => {
                    switch (c) {
                        ' ', '\r', '\n', '\t', '<', '>', '=' => {
                            self.index -= 1; // backtrack
                            break;
                        },
                        else => {
                            state = .identifier;
                        },
                    }
                },

                .invalid => switch (c) {
                    0 => if (self.index == self.buffer.len) {
                        result.tag = .invalid;
                        break;
                    },
                    '\n' => {
                        result.tag = .invalid;
                        break;
                    },
                    else => continue,
                },
                .unparsed => switch (c) {
                    0 => if (self.index == self.buffer.len) {
                        result.tag = .unparsed;
                        break;
                    },
                    '\n' => {
                        result.tag = .unparsed;
                        break;
                    },
                    else => continue,
                },
            }
        }

        result.loc.end = self.index;
        return result;
    }
};

test "parse tests" {
    _ = @import("parse_test.zig");
}
