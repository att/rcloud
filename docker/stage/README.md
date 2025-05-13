# docker compose: stage

This docker compose specification defines multiple units that are
commonly deployed into production, for use during acceptance testing
(prior to deployment).

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

## Additional system packages

Additional system packages can be installed to the docker image by
adding the Debian package names to the file `apt-install.txt`. This
file is read by the `../common/build.sh` script and included as a build argument
during `docker compose build`. It must contain at least one valid
Debian package.

The file `apt-install.txt` may be shared along with the
`rcloud-data.tar.gz` file created as described in the previous
section, to enable anyone to fully reproduce an RCloud installation.

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
