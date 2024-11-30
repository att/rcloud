// This file is part of mosql.
//
// Copyright (C) 2024 <https://codeberg.org/mocompute>
//
// mosql is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// mosql is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.
const std = @import("std");
const testing = std.testing;
const c = @import("c.zig").c;

pub const Error = @import("errors.zig").Error;
const rc_to_error = @import("errors.zig").rc_to_error;

pub const Connection = struct {
    conn: ?*c.sqlite3 = null,

    /// Open a database in read-write mode. Creates if not present.
    /// Call close when finished.
    pub fn open(path: []const u8) !Connection {
        return Connection.open_flags(path, c.SQLITE_OPEN_READWRITE | c.SQLITE_OPEN_CREATE);
    }

    /// Open a database. Call close when finished.
    pub fn open_flags(path: []const u8, flags: c_int) !Connection {
        var buf: [std.fs.max_path_bytes]u8 = undefined;
        @memcpy(buf[0..path.len], path);
        buf[path.len] = 0;

        var conn: ?*c.sqlite3 = null;
        const res = c.sqlite3_open_v2(&buf, &conn, flags, null);
        if (res == c.SQLITE_OK) return .{ .conn = conn.? };

        // on error, still need to call close to release memory
        // https://sqlite.org/c3ref/open.html
        if (conn) |conn_| {
            _ = c.sqlite3_close(conn_);
        }
        return rc_to_error(res);
    }

    /// Close db and invalidate struct. Note that this may fail if the
    /// database is busy. See close_wait() for use in defer
    /// statements.
    pub fn close(self: *Connection) !void {
        assert(self.conn != null);
        const res = c.sqlite3_close(self.conn);
        if (res == c.SQLITE_OK) {
            self.* = undefined;
            return;
        } else {
            return rc_to_error(res);
        }
    }

    /// Close db and invalidate struct. This function may repeatedly
    /// sleep the current process if Connection.close returns an
    /// error.
    pub fn close_wait(self: *Connection) void {
        assert(self.conn != null);
        while (true) {
            self.close() catch {
                const milliseconds: u64 = @intCast(random_byte());
                // sleep between 2 and 512 ms
                std.time.sleep(milliseconds * @as(u64, 2e6));
                continue;
            };
            break;
        }
    }

    pub fn exec(self: Connection, sql: [:0]const u8) !void {
        assert(self.conn != null);
        const res = c.sqlite3_exec(self.conn, sql, null, null, null);

        if (is_err(res))
            return rc_to_error(res);
    }

    pub fn begin(self: Connection) !void {
        assert(self.conn != null);
        try self.exec("BEGIN");
    }
    pub fn commit(self: Connection) !void {
        assert(self.conn != null);
        try self.exec("COMMIT");
    }
    pub fn commit_wait(self: Connection) void {
        assert(self.conn != null);
        while (true) {
            self.commit() catch {
                const milliseconds: u64 = @intCast(random_byte());
                // sleep between 2 and 512 ms
                std.time.sleep(milliseconds * @as(u64, 2e6));
                continue;
            };
            break;
        }
    }
    pub fn rollback(self: Connection) !void {
        assert(self.conn != null);
        try self.exec("ROLLBACK");
    }

    pub fn changes(self: Connection) i64 {
        assert(self.conn != null);
        return @intCast(c.sqlite3_changes64(self.conn));
    }

    pub fn is_open(self: Connection) bool {
        return self.conn != null;
    }

    pub fn last_insert_rowid(self: Connection) i64 {
        assert(self.conn != null);
        return c.sqlite3_last_insert_rowid(self.conn);
    }

    fn random_byte() u8 {
        var buf: [1]u8 = undefined;
        c.sqlite3_randomness(1, &buf);
        return @intCast(buf[0]);
    }

    fn is_err(rc: c_int) bool {
        return rc != c.SQLITE_OK;
    }
};

pub const Statement = struct {
    stmt: ?*c.sqlite3_stmt = null,

    pub fn init(conn: Connection, sql: [:0]const u8) !Statement {
        var stmt: ?*c.sqlite3_stmt = undefined;
        const res = c.sqlite3_prepare_v2(conn.conn, sql, -1, &stmt, 0);
        if (Connection.is_err(res)) return rc_to_error(res);
        return .{ .stmt = stmt };
    }

    /// Finalise statement and return its return code.
    pub fn finalize(self: *Statement) Error {
        var out: Error = undefined;
        if (self.stmt) |x| {
            out = rc_to_error(c.sqlite3_finalize(x));
        } else {
            out = Error.Ok;
        }

        self.stmt = null;
        return out;
    }

    /// Finalise statement and ignore its return code. Alternatively,
    /// finalize() will return the error returned by the last call to
    /// step().
    pub fn deinit(self: *Statement) void {
        if (self.stmt) |x| {
            _ = c.sqlite3_finalize(x);
        }
        self.* = undefined;
    }

    pub fn reset(self: Statement) !void {
        var res = c.sqlite3_reset(self.stmt);
        if (Connection.is_err(res)) return rc_to_error(res);
        res = c.sqlite3_clear_bindings(self.stmt);
        if (Connection.is_err(res)) return rc_to_error(res);
    }

    /// Set column index (0-based) to null.
    pub fn bind_null(self: Statement, index: i32) void {
        const res = c.sqlite3_bind_null(self.stmt, index);
        assert(res == c.SQLITE_OK);
    }
    /// Set column index (0-based) to an int.
    pub fn bind_int(self: Statement, index: i32, val: i64) void {
        const res = c.sqlite3_bind_int64(self.stmt, index, val);
        assert(res == c.SQLITE_OK);
    }
    /// Set column index (0-based) to a double.
    pub fn bind_double(self: Statement, index: i32, val: f64) void {
        const res = c.sqlite3_bind_double(self.stmt, index, val);
        assert(res == c.SQLITE_OK);
    }
    /// Set column index (0-based) to text.
    pub fn bind_text(self: Statement, index: i32, val: []const u8) void {
        const res = c.sqlite3_bind_text(self.stmt, index, val.ptr, @intCast(val.len), c.SQLITE_STATIC);
        assert(res == c.SQLITE_OK);
    }

    /// Execute the statement. Returns .row if there is another row of
    /// results. Returns .done if there are no more rows. Returns any
    /// other error.
    pub fn step(self: Statement) !StepResult {
        switch (c.sqlite3_step(self.stmt)) {
            c.SQLITE_ROW => return .row,
            c.SQLITE_DONE => return .done,
            else => |x| return rc_to_error(x),
        }
    }

    /// Return the number of columns in the current row result.
    pub fn column_count(self: Statement) i64 {
        return c.sqlite3_column_count(self.stmt);
    }
    /// Return the value in column index (0-based) as an int.
    pub fn column_int(self: Statement, index: i32) i64 {
        return c.sqlite3_column_int64(self.stmt, index);
    }
    /// Return the value in column index (0-based) as an f64.
    pub fn column_double(self: Statement, index: i32) f64 {
        return c.sqlite3_column_double(self.stmt, index);
    }
    /// Return the value in column index (0-based) as a text slice.
    pub fn column_text(self: Statement, index: i32) []const u8 {
        const ptr = c.sqlite3_column_text(self.stmt, index);
        const len = c.sqlite3_column_bytes(self.stmt, index);
        return ptr[0..@intCast(len)];
    }

    const StepResult = enum {
        done,
        row,
    };
};

const assert = std.debug.assert;

test {
    std.testing.refAllDeclsRecursive(@This());
}

test "sqlite open and close succeeds" {
    var conn = try Connection.open(":memory:");
    try conn.close();
}

test "exec: rollback and prepared statement" {
    var conn = try Connection.open(":memory:");
    defer conn.close_wait();

    var res = try conn.exec("CREATE TABLE foo(id INTEGER PRIMARY KEY, text TEXT NOT NULL)");
    try std.testing.expectEqual(0, conn.changes()); // only counts rows changed
    {
        try conn.begin();

        res = try conn.exec("INSERT INTO foo (text) VALUES('hello')");
        try std.testing.expectEqual(1, conn.changes());
        res = try conn.exec("INSERT INTO foo (text) VALUES('hello')");
        try std.testing.expectEqual(1, conn.changes());

        try conn.rollback();
    }

    try std.testing.expectEqual(2, conn.last_insert_rowid());

    {
        var stmt = try Statement.init(conn, "SELECT COUNT(*) FROM foo");
        defer stmt.deinit();

        // expect 0 rows because of rollback
        try std.testing.expectEqual(.row, try stmt.step());
        try std.testing.expectEqual(1, stmt.column_count());
        try std.testing.expectEqual(0, stmt.column_int(0));
        try std.testing.expectEqual(.done, try stmt.step());
    }
}

test "insert and retrieve" {
    var conn = try Connection.open(":memory:");
    defer conn.close_wait();

    var res = try conn.exec("CREATE TABLE foo(id INTEGER PRIMARY KEY, text TEXT NOT NULL)");
    try std.testing.expectEqual(0, conn.changes()); // only counts rows changed
    {
        try conn.begin();

        res = try conn.exec("INSERT INTO foo (text) VALUES('hello')");
        try std.testing.expectEqual(1, conn.changes());
        res = try conn.exec("INSERT INTO foo (text) VALUES('world')");
        try std.testing.expectEqual(1, conn.changes());

        try conn.commit();
    }

    try std.testing.expectEqual(2, conn.last_insert_rowid());

    {
        var stmt = try Statement.init(conn, "SELECT COUNT(*) FROM foo");
        defer stmt.deinit();

        // expect 2 rows
        try std.testing.expectEqual(.row, try stmt.step());
        try std.testing.expectEqual(1, stmt.column_count());
        try std.testing.expectEqual(2, stmt.column_int(0));
        try std.testing.expectEqual(.done, try stmt.step());
    }

    {
        var stmt = try Statement.init(conn, "SELECT id, text FROM foo");
        defer stmt.deinit();

        // row 1
        try std.testing.expectEqual(.row, try stmt.step());
        try std.testing.expectEqual(2, stmt.column_count());
        try std.testing.expectEqual(1, stmt.column_int(0));
        try std.testing.expectEqualStrings("hello", stmt.column_text(1));

        // row 2
        try std.testing.expectEqual(.row, try stmt.step());
        try std.testing.expectEqual(2, stmt.column_count());
        try std.testing.expectEqual(2, stmt.column_int(0));
        try std.testing.expectEqualStrings("world", stmt.column_text(1));

        // done
        try std.testing.expectEqual(.done, try stmt.step());
    }
}

test "sqlite open nonexistent read-only fails" {
    const alloc = testing.allocator;

    var tmp = testing.tmpDir(.{});
    defer tmp.cleanup();
    const tmppath = try tmp.dir.realpathAlloc(alloc, ".");
    defer alloc.free(tmppath);
    const path = try std.fs.path.join(alloc, &.{ tmppath, "nonexistent" });
    defer alloc.free(path);

    // this open should fail, because nonexistent does not exist
    var conn = Connection.open_flags(path, c.SQLITE_OPEN_READONLY) catch {
        return;
    };

    // if we are here, it's an error

    // close db
    _ = conn.close() catch |err| {
        return err;
    };

    return error.TestFailed;
}
