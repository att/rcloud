
# Run Rcloud with Vagrant

This directory contains a configuration that allows running
Rcloud within a Vagrant virtual machine.

# Installation

## 1. Install Vagrant

See https://www.vagrantup.com/ for details.

## 2. Clone the rcloud repository

In your (git) shell, run

```
git clone https://github.com/att/rcloud
```

## 3. Register a developer application on GitHub

Go to https://github.com/settings/applications/new
and fill the form:
* "Application name" can be arbitrary, a good choice is
  `Rcloud development instance` or something similar
* "Homepage URL": `https://github.com/att/rcloud`
* "Application Description" is again arbitrary and optional.
* "Authorization callback URL" must be
  `http://127.0.0.1:8080/login_successful.R`

# Usage

Start Rcloud using the application client ID and secret,
from the cloned rcloud repository:

```
cd vagrant
RCLOUD_GITHUB_CLIENT_ID=<your-client-id> \
RCLOUD_GITHUB_CLIENT_SECRET=<your-client-escret> vagrant up
```

If Rcloud is already running, you can restart it with

```
cd vagrant
RCLOUD_GITHUB_CLIENT_ID=<your-client-id> \
RCLOUD_GITHUB_CLIENT_SECRET=<your-client-secret> \
vagrant provision --provision-with restart
```

To start the web client, go to http://127.0.0.1:8080/login.R
in your browser, and log in with your GitHub credentials.
