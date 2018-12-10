#!/bin/bash

# Normally we sleep in order to give the DBs time to spin up.
# However for a DB update, we manually wait for the DBs (in db_update.sh)
# before starting the container, so we don't need to sleep in that case.
if [[ -e /DONTSLEEP.HACK ]]; then # /DONTSLEEP.HACK created by db_update.sh
    rm /DONTSLEEP.HACK
else
    sleep 10
fi

gunicorn -w 4 -k gevent -b :5000 src:app
