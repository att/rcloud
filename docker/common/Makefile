DOCKER_CONTEXT = ../..
DEBIAN_DOCKERFILE = Dockerfile
VERSION = $(shell cat $(DOCKER_CONTEXT)/VERSION)

help:
	@echo "This Makefile provides access and a reference to docker-related commands. Use the source, Luke."

dist:
	@echo "Making source code distribution..."
	docker buildx build -f $(DEBIAN_DOCKERFILE) --target dist -t rcloud-dist $(DOCKER_CONTEXT)
	@echo "Copying tarball..."
	docker create --name rcloud-cp-temp rcloud-dist                             \
	&& docker cp rcloud-cp-temp:/data/rcloud/zig-out/rcloud-$(VERSION).tar.gz . \
	&& docker rm rcloud-cp-temp \
	&& docker image rm rcloud-dist

dist-fat:
	@echo "Making fat source code distribution..."
	docker buildx build -f $(DEBIAN_DOCKERFILE) --target dist-fat -t rcloud-dist-fat $(DOCKER_CONTEXT)
	@echo "Copying tarball..."
	docker create --name rcloud-cp-temp rcloud-dist-fat                         \
	&& docker cp rcloud-cp-temp:/data/rcloud/zig-out/rcloud-full-$(VERSION).tar.gz . \
	&& docker rm rcloud-cp-temp \
	&& docker image rm rcloud-dist-fat

.PHONY: help dist dist-fat
