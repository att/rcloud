DOCKER_CONTEXT = ../..
DEBIAN_DOCKERFILE = Dockerfile
DEBIAN_TAG = rcloud-simple
DOCKER_TARGET = runtime-simple
HOST_PORT = 8080
CONTAINER_PORT = 8080
BUILD_JOBS = 16
VERSION = $(shell cat $(DOCKER_CONTEXT)/VERSION)

help:
	@echo "This Makefile provides access and a reference to docker-related commands. Use the source, Luke."

build:
	@echo "Building..."
	docker buildx build --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target $(DOCKER_TARGET) -t $(DEBIAN_TAG) $(DOCKER_CONTEXT)

build-no-cache:
	@echo "Building with --no-cache..."
	docker buildx build --no-cache --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target $(DOCKER_TARGET) -t $(DEBIAN_TAG) $(DOCKER_CONTEXT)

run:
	@echo "Running ephemeral container..."
	docker run -it --rm -p $(HOST_PORT):$(CONTAINER_PORT) \
	--mount source=rcloud-run,target=/rcloud-run	      \
	--mount source=rcloud-data,target=/rcloud-data	     \
	--add-host=redis:127.0.0.1 $(DEBIAN_TAG)

dev:
	@echo "Building dev container..."
	docker buildx build --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target dev -t runtime-dev $(DOCKER_CONTEXT)
	@echo "Starting dev container..."
	docker run -it --rm -p $(HOST_PORT):$(CONTAINER_PORT) \
	-v "`pwd`:/src" \
	--mount source=rcloud-run,target=/rcloud-run	      \
	--mount source=rcloud-data,target=/rcloud-data	     \
	--add-host=redis:127.0.0.1 --entrypoint /bin/bash runtime-dev

dist:
	@echo "Making source code distribution..."
	docker buildx build --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target dist -t rcloud-dist $(DOCKER_CONTEXT)
	@echo "Copying tarball..."
	docker create --name rcloud-cp-temp rcloud-dist                             \
	&& docker cp rcloud-cp-temp:/data/rcloud/zig-out/rcloud-$(VERSION).tar.gz . \
	&& docker rm rcloud-cp-temp

dist-fat:
	@echo "Making fat source code distribution..."
	docker buildx build --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target dist-fat -t rcloud-dist-fat $(DOCKER_CONTEXT)
	@echo "Copying tarball..."
	docker create --name rcloud-cp-temp rcloud-dist-fat                         \
	&& docker cp rcloud-cp-temp:/data/rcloud/zig-out/rcloud-full-$(VERSION).tar.gz . \
	&& docker rm rcloud-cp-temp

create:
	@echo "Creating container..."
	docker create -p $(HOST_PORT):$(CONTAINER_PORT) --name $(DEBIAN_TAG) $(DEBIAN_TAG)

destroy:
	@echo "DRY RUN: To destroy the container, run 'make destroy-no-dry-run'"

destroy-no-dry-run:
	@echo "Destroying container..."
	docker container rm $(DEBIAN_TAG)

start:
	@echo "Starting container..."
	docker start $(DEBIAN_TAG)

stop:
	@echo "Stopping container..."
	docker stop $(DEBIAN_TAG)

bash:
	@echo "Connecting to running container..."
	docker exec -it $(DEBIAN_TAG) bash

.PHONY: bash build create destroy destroy-no-dry-run help run start stop
