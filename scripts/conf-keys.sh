#!/bin/sh
#
# Search codebase for get/set/has/Conf and return list of unique keys
{
    grep -r -hoP 'getConf\("\K[^"]+' .;
    grep -r -hoP 'setConf\("\K[^"]+' .;
    grep -r -hoP 'hasConf\("\K[^"]+' .;
    grep -r -hoP 'rcloud.config\("\K[^"]+' .;
} | sort -u
