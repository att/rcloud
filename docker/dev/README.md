# docker compose: dev

This docker compose definition is suitable for a local developer's
system during development.

Build the images:

```sh
docker compose build
```

Run the images:

```sh
docker compose up
```

To stop the containers, send a Control-C. To edit code and see the
effects, save the edits, then perform `docker compose build` and
`docker compose up` again. To clean up images (but not data), perform
`docker compose down`.

## RCloud notebook backup and restore

When using this configuration, all RCloud notebook data is stored in a
Docker volume called `rcloud_rcloud-data`. This volume may be backed
up and restored using two provided scripts. `../common/backup.sh` will create
the file `rcloud-data.tar.gz` containing the contents of the
`rcloud_rcloud-data` volume.

`../common/restore.sh` will read the file `rcloud-data.tar.gz` and **overwrite**
the Docker volume on the current host containing all RCloud data.
Because of its destructive nature, an additional argument
`--no-dry-run` must be provided.

## Additional system packages

Additional system packages can be installed to the docker image by
adding the Debian package names to the file `apt-install.txt`. This
file is read by the `../common/build.sh` script and included as a build argument
during `docker compose build`. It must contain at least one valid
Debian package.

The file `apt-install.txt` may be shared along with the
`rcloud-data.tar.gz` file created as described in the previous
section, to enable anyone to fully reproduce an RCloud installation.

## Maintenance profile

A maintenance profile is included in the docker compose configuration
file `compose.yaml`. This may be used to access a bash command line
in the container with the RCloud Docker volumes mounted. For example:

```sh
docker compose run --rm -v $(pwd):/mnt maint
```

will start an ephemeral container with the current directory mounted
in the container at `/mnt`, and with access to the `rcloud-data`
docker volume. This can be used to install data files, for example.
