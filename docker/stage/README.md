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
