* Feature: In view mode (view.html), appending &quiet=1 will hide the
  navbar and greeting message. This makes it easier for view.html URLs
  to be effectively used as iframes in different websites.

* Feature: In view mode (view.html), rcloud inserts any stylesheets
  present in the notebook into the main document. Currently, the only way
  to add stylesheets to a notebook is to directly edit the github
  gist. This will change in the near future.

* Feature: added a `github.user.whitelist` option to rcloud.conf to
  allow only a subset of Github users to login to any given rcloud
  deployment. If no whitelist is given, all users are allowed in

## September 19th 2013

* v0.8 release created
