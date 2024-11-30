DEBIAN_DOCKERFILE = Dockerfile
DEBIAN_TAG = rcloud-simple
DOCKER_TARGET = runtime-simple
HOST_PORT = 8080
CONTAINER_PORT = 8080
BUILD_JOBS = 16

help:
	@echo "This Makefile provides access and a reference to docker-related commands."

build:
	@echo "Building..."
	docker buildx build --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target $(DOCKER_TARGET) -t $(DEBIAN_TAG) .

build-no-cache:
	@echo "Building with --no-cache..."
	docker buildx build --no-cache --build-arg BUILD_JOBS=$(BUILD_JOBS) -f $(DEBIAN_DOCKERFILE) --target $(DOCKER_TARGET) -t $(DEBIAN_TAG) .

run:
	@echo "Running ephemeral container..."
	docker run -it --rm -p $(HOST_PORT):$(CONTAINER_PORT) $(DEBIAN_TAG)

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
