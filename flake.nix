{
  description = "RCloud development";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.05";

    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { flake-utils, nixpkgs, ... } @ inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [
        ];

        pkgs = import nixpkgs {
          overlays = overlays;
          system = system;
        };

      in
        {
          overlays = overlays;

          devShells.default =
            pkgs.mkShell {
              buildInputs = with pkgs; [
                autoconf
                automake
                bashInteractive
                cairo
                curl
                killall
                git
                gnumake
                icu
                libxcrypt
                libxml2
                nodejs-slim
                nodePackages.npm
                openssl
                pkg-config
                redis
                R
                rPackages.codetools
                rPackages.Matrix
                wget
              ];

              LD_LIBRARY_PATH = with pkgs; lib.makeLibraryPath [ openssl ];
              LOCALE_ARCHIVE = if pkgs.stdenv.isLinux then "${pkgs.glibcLocales}/lib/locale/locale-archive" else "";
            };

          devShells.dev =
            pkgs.mkShell {
              buildInputs = with pkgs; [
                autoconf
                automake
                bashInteractive
                cairo
                curl
                killall
                git
                gnumake
                icu
                libxcrypt
                libxml2
                nodejs-slim
                nodePackages.npm
                openssl
                pkg-config
                redis
                R
                rPackages.codetools
                rPackages.Matrix
                wget
              ];

              LD_LIBRARY_PATH = with pkgs; lib.makeLibraryPath [ openssl ];
              LOCALE_ARCHIVE = if pkgs.stdenv.isLinux then "${pkgs.glibcLocales}/lib/locale/locale-archive" else "";
            };
        });
}
