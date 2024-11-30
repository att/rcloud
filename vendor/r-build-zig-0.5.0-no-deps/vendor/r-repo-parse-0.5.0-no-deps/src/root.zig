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

pub const version = @import("version.zig");
pub const repository = @import("repository_tools.zig");
pub const parse = @import("parse.zig");
pub const string_storage = @import("string_storage.zig");
pub const rlang_parse = @import("rlang_parse.zig");

pub const Repository = repository.Repository;
pub const Authors = @import("Authors.zig");

test {
    _ = version;
    _ = repository;
    _ = parse;
    _ = string_storage;
    _ = rlang_parse;
    _ = Authors;
}
