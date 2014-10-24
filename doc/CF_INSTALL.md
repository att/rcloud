# Deploying to Cloud Foundry

## Prepackaging the native dependencies to a tarball

On an `Ubuntu Lucid` box (e.g. using this [Docker File](https://github.com/cloudfoundry-incubator/diego-dockerfiles/blob/master/warden-ci/Dockerfile)):

1. Run `mkdir /app`
1. Copy `scripts/cf-tar-dependencies.sh` into the `/app` folder.
1. Run `cd /app; ./cf-tar-dependencies.sh`.
1. Copy the resultant `cf-ubuntu-lucid-deps.tar.gz` tar file to the root of this repo.

## Create RCloud configuration files

1. Within `conf` directory, create an `rcloud.conf.dev` and `rcloud.conf.prod` for your development or production environment based on `rcloud.conf.samp`.
1. Test with `./scripts/cf-run.sh`.

## Deploy to Cloud Foundry

See [Deploying CF apps](http://docs.cloudfoundry.org/devguide/deploy-apps/deploy-app.html) for more details.

1. Run `brew tap pivotal/tap && brew install cloudfoundry-cli`.
1. Run `cf api <YOUR_API>`.
1. Run `cf login`.
1. Run `cf target -o <YOUR_ORG> -s <YOUR_SPACE>`.
1. Run `cf push`.
