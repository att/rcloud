# Cmdline

Simple command line parser. Simple tuple initialisation.

# Installation
Add to your `build.zig.zon`:
```sh
zig fetch --save https://codeberg.org/mocompute/cmdline/archive/v0.2.0.tar.gz
```

Then include in your `build.zig`:

```zig
    const cmdline = b.dependency("cmdline", .{
        .target = target,
        .optimize = dep_optimize,
    }).module("cmdline");

    exe.root_module.addImport("cmdline", cmdline);
```

# Features

- Valid option styles
  - `--long argument`
  - `-l argument`
  - `--long=argument`
  - `-l=argument`
  - `--boolean` (no argument)
  - `-b`
  - `-abc` (packed boolean flags, equiv. to `-a -b -c`)
  - `-xvf file.txt` (packed bools followed by string option, equiv. to
    `-x -v -f=file.txt`)
  - `--` stops all option parsing, any remaining arguments are
    considered positional
  - Repeatable options

- Positional arguments
  - everything without a dash is positional (unless it's an argument
    to an option), can be interleaved with options

- Short option character can be different from first letter of long
  option, e.g. (`--extract` and `-x` can be the same option).

- Does not check for required arguments or print usage or errors.

- Simple initialisation

- Does not aim to be full featured, just the basics


# Usage
```zig
// provide an allocator, and define all options:
var options = try Options.init(
    alloc,
    .{
        // specified --file and -f which expect an argument
        .{"file"},

        // creates --extract and -x as the same option, boolean
        .{"extract", 'x', false},

        // order of arguments does not matter
        .{'x', false, "extract"},

        // don't want to allow a short option
        .{"unique", 0},

        // repeatable option
        .{"in", "in"}
     },
);
defer options.deinit();

// parse the command line arguments from std.os.process
const result = options.parse();

if (result == .err) {
    // switch on .err for detailed error information, and/or
    // print usage and exit
}

if (options.get("file")) |filename| { ... }
if (options.present("extract")) { ... }
for (options.positional().items) |pos| { ... }
if (options.getMany("in")) |many| { for(many) { ... }}
```

# Alternatives

Several libraries already exist and provide more or different
features. A selection is below, along with notable differences to this
library. See [Awesome Zig](https://github.com/zigcc/awesome-zig) for more.

## zig-clap
https://github.com/Hejsil/zig-clap

- Supports options that can be specified multiple times
- Prints help message
- Parses help message to specify command line options
- Provides autodoc

## Zig Argument Parser
https://github.com/ikskuh/zig-args

- Config via a struct
- Supports booleans with values (yes/no, etc)
- Supports enumerations

## Zigcli
https://github.com/jiacai2050/zigcli

- Provides several example executables

## Yazap
https://github.com/PrajwalCH/yazap

- Supports options that can be specified multiple times
- Provides structured support for nested subcommands with positional
  arguments
