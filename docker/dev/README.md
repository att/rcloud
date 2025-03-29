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
