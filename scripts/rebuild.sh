#!/bin/sh
# force rebuild of all javascript

(cd htdocs/js/; make clean && make) || exit
(cd htdocs/lib/; make clean && make)
