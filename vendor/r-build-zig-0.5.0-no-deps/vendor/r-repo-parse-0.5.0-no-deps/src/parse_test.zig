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
const parse = @import("./parse.zig");
const StringStorage = @import("string_storage.zig").StringStorage;

test "parse" {
    const source =
        \\Package: renv
        \\Type: Package
        \\Title: Project Environments
        \\Version: 1.0.7.9000
        \\Authors@R: c(
        \\    person("Kevin", "Ushey", role = c("aut", "cre"), email = "kevin@rstudio.com",
        \\           comment = c(ORCID = "0000-0003-2880-7407")),
        \\    person("Hadley", "Wickham", role = c("aut"), email = "hadley@rstudio.com",
        \\           comment = c(ORCID = "0000-0003-4757-117X")),
        \\    person("Posit Software, PBC", role = c("cph", "fnd"))
        \\    )
        \\Description: A dependency management toolkit for R. Using 'renv', you can create
        \\    and manage project-local R libraries, save the state of these libraries to
        \\    a 'lockfile', and later restore your library as required. Together, these
        \\    tools can help make your projects more isolated, portable, and reproducible.
        \\License: MIT + file LICENSE
        \\URL: https://rstudio.github.io/renv/, https://github.com/rstudio/renv
        \\BugReports: https://github.com/rstudio/renv/issues
        \\Imports: utils
        \\Suggests: BiocManager (> 0.1), cli, covr, cpp11, devtools, gitcreds, jsonlite, jsonvalidate, knitr
        \\    (> 2.0),
        \\    miniUI, packrat, pak, R6, remotes, reticulate, rmarkdown, rstudioapi, shiny, testthat,
        \\    uuid, waldo, yaml, webfakes
        \\Encoding: UTF-8
        \\RoxygenNote: 7.3.2
        \\Roxygen: list(markdown = TRUE)
        \\VignetteBuilder: knitr
        \\Config/Needs/website: tidyverse/tidytemplate
        \\Config/testthat/edition: 3
        \\Config/testthat/parallel: true
        \\Config/testthat/start-first: bioconductor,python,install,restore,snapshot,retrieve,remotes
    ;
    const alloc = std.testing.allocator;

    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();
    var parser = parse.Parser.init(alloc, &strings);
    defer parser.deinit();
    try parser.parse(source);

    if (false) parser.debugPrint();
}

test "two stanzas" {
    const expect = testing.expect;
    const source =
        \\Field1: val1
        \\
        \\Field2: val2
    ;

    const alloc = std.testing.allocator;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();
    var parser = parse.Parser.init(alloc, &strings);
    defer parser.deinit();
    try parser.parse(source);

    const nodes = parser.nodes.items;
    try expect(.root == nodes[0]);
    try expect(.stanza == nodes[1]);
    try expect(.field == nodes[2]);
    try expect(.name_and_version == nodes[3]);
    try testing.expectEqualStrings("val1", nodes[3].name_and_version.name);
    try expect(.field_end == nodes[4]);
    try expect(.stanza_end == nodes[5]);
    try expect(.stanza == nodes[6]);
    try expect(.field == nodes[7]);
    try expect(.name_and_version == nodes[8]);
    try expect(.field_end == nodes[9]);
    try expect(.stanza_end == nodes[10]);
    try expect(.eof == nodes[11]);
}

test "package and version" {
    const expect = testing.expect;
    const source =
        \\Package: mypackage
        \\Version: 1.2.3
    ;

    const alloc = std.testing.allocator;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();
    var parser = parse.Parser.init(alloc, &strings);
    defer parser.deinit();
    try parser.parse(source);

    const nodes = parser.nodes.items;
    try expect(.root == nodes[0]);
    try expect(.stanza == nodes[1]);
    try expect(.field == nodes[2]);
    try expect(.name_and_version == nodes[3]);
    try testing.expectEqualStrings("mypackage", nodes[3].name_and_version.name);
    try expect(.field_end == nodes[4]);
    try expect(.field == nodes[5]);
    try expect(.string_node == nodes[6]);
    try testing.expectEqualStrings("1.2.3", nodes[6].string_node.value);
    try expect(.field_end == nodes[7]);
    try expect(.stanza_end == nodes[8]);
    try expect(.eof == nodes[9]);
}

test "extra blank line" {
    const expect = testing.expect;
    const source =
        \\Package: mypackage
        \\Version: 1.2.3
        \\
        \\
    ;

    const alloc = std.testing.allocator;
    var strings = try StringStorage.init(alloc, std.heap.page_allocator);
    defer strings.deinit();

    var tokenizer = parse.Tokenizer.init(source);
    defer tokenizer.deinit();
    while (true) {
        const token = tokenizer.next();
        if (token.tag == .eof) break;
    }

    var parser = parse.Parser.init(alloc, &strings);
    defer parser.deinit();
    try parser.parse(source);

    const nodes = parser.nodes.items;
    try expect(.root == nodes[0]);
    try expect(.stanza == nodes[1]);
    try expect(.field == nodes[2]);
    try expect(.name_and_version == nodes[3]);
    try testing.expectEqualStrings("mypackage", nodes[3].name_and_version.name);
    try expect(.field_end == nodes[4]);
    try expect(.field == nodes[5]);
    try expect(.string_node == nodes[6]);
    try testing.expectEqualStrings("1.2.3", nodes[6].string_node.value);
    try expect(.field_end == nodes[7]);
    try expect(.stanza_end == nodes[8]);
    try expect(.stanza == nodes[9]);
    try expect(.stanza_end == nodes[10]);
    try expect(.eof == nodes[11]);
}

test "tokenize" {
    try testTokenize("Field: val (<2)", &.{ .identifier, .colon, .identifier, .open_round, .less_than, .close_round, .eof });
    try testTokenize("Field: val (<=2)", &.{ .identifier, .colon, .identifier, .open_round, .less_than_equal, .close_round, .eof });
    try testTokenize("Field: val (> 2)", &.{ .identifier, .colon, .identifier, .open_round, .greater_than, .close_round, .eof });
    try testTokenize("Field: val(>= 2)", &.{ .identifier, .colon, .identifier, .open_round, .greater_than_equal, .close_round, .eof });
    try testTokenize("Field/foo@*: val(a), val^2", &.{ .identifier, .colon, .identifier, .open_round, .identifier, .close_round, .comma, .identifier, .eof });
}

test "tokenize continuation" {
    const data =
        \\Field1: val1 val2
        \\ continues
        \\  again
        \\Field2: val3
        \\
        \\NextStanza: hello
    ;
    try testTokenize(data, &.{ .identifier, .colon, .identifier, .identifier, .identifier, .identifier, .end_field, .identifier, .colon, .identifier, .end_stanza, .identifier, .colon, .identifier, .eof });
}

test "tokenize string" {
    const data = "\"string with \\\" inside";

    try testTokenize(data, &.{ .string_literal, .eof });

    var tokenizer = parse.Tokenizer.init(data);
    const token = tokenizer.next();
    try testing.expectEqualStrings(data, token.lexeme(data).?);
}

test "tokenize version" {
    const data = "(> 3.2.1)";
    try testTokenize(data, &.{ .open_round, .greater_than, .close_round, .eof });

    var tokenizer = parse.Tokenizer.init(data);
    _ = tokenizer.next();
    const token = tokenizer.next();
    try testing.expectEqualStrings("3.2.1", token.lexeme(data).?);
}

test "tokenize R" {
    const data =
        \\Authors@R: c(
        \\    person("Kevin", "Ushey", role = c("aut", "cre"))
        \\    )
    ;
    // TODO: not yet implemented
    try testTokenize(data, &.{
        .identifier,
        .colon,
        .identifier,
        .open_round,
        .identifier,
        .open_round,
        .unparsed,
        .close_round,
        .eof,
    });
}

test "tokenize description" {
    const data =
        \\Version: 1.0.7.9000
        \\Description: A dependency management toolkit for R. Using 'renv', you can create
        \\    and manage project-local R libraries, save the state of these libraries to
        \\    a 'lockfile', and later restore your library as required. Together, these
        \\    tools can help make your projects more isolated, portable, and reproducible.
        \\Authors@R: c(
        \\    person("Kevin", "Ushey", role = c("aut", "cre"))
        \\    )
        \\URL: https://rstudio.github.io/renv/, https://github.com/rstudio/renv
        \\Suggests: BiocManager (> 0.1), cli, covr, cpp11, devtools, gitcreds, jsonlite, jsonvalidate, knitr
        \\    (> 2.0),
        \\    miniUI, packrat, pak, R6, remotes, reticulate, rmarkdown, rstudioapi, shiny, testthat,
        \\    uuid, waldo, yaml, webfakes
    ;
    var tokenizer = parse.Tokenizer.init(data);
    defer tokenizer.deinit();

    while (true) {
        const token = tokenizer.next();
        if (token.tag == .eof) break;
    }
}

fn testTokenize(source: []const u8, expected_token_tags: []const parse.Token.Tag) !void {
    var tokenizer = parse.Tokenizer.init(source);
    defer tokenizer.deinit();
    for (expected_token_tags) |expected_token_tag| {
        const token = tokenizer.next();
        std.testing.expectEqual(expected_token_tag, token.tag) catch |err| {
            var tok = parse.Tokenizer.init(source);
            defer tok.deinit();
            var t = tok.next();
            while (t.tag != .eof) : (t = tok.next()) {
                // std.debug.print("{}\n", .{t});
            }
            return err;
        };
    }
    // Last token should always be eof, even when the last token was invalid,
    // in which case the tokenizer is in an invalid state, which can only be
    // recovered by opinionated means outside the scope of this implementation.
    const last_token = tokenizer.next();
    try std.testing.expectEqual(parse.Token.Tag.eof, last_token.tag);
    try std.testing.expectEqual(source.len, last_token.loc.start);
    try std.testing.expectEqual(source.len, last_token.loc.end);
}
