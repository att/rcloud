# Deploying to Cloud Foundry

## Prepackaging the native dependencies to a tarball

On an `Ubuntu Lucid` box (e.g. using this [Docker File](https://github.com/cloudfoundry-incubator/diego-dockerfiles/blob/master/warden-ci/Dockerfile)):

1. Run `mkdir /app`
2. Copy `scripts/cf-tar-dependencies.sh` into the `/app` folder.
3. Run `cd /app; ./cf-tar-dependencies.sh`.
4. Copy the resultant `cf-ubuntu-lucid-deps.tar.gz` tar file to the root of this repo.

## Create RCloud configuration files

1. Within the `conf/` directory, create an `rcloud.conf` based on the `rcloud.conf.samp`.
2. Within the `conf/` directory, ensure that the `rserve.conf` is correct.
3. Test with `./scripts/cfRun.R`.

## Deploy to Cloud Foundry

See [Deploying CF apps](http://docs.cloudfoundry.org/devguide/deploy-apps/deploy-app.html) for more details.

1. Run `brew tap pivotal/tap && brew install cloudfoundry-cli`.
2. Run `cf api <YOUR_API>`.
3. Run `cf login`.
4. Run `cf target -o <YOUR_ORG> -s <YOUR_SPACE>`.
5. Run `cf push`.

## Internetless CF deploy

Do Step 1-4 from above 

5. Run `scripts/bootstrapR.sh --mk-dist`
6. `cf push`


