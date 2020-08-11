#!/bin/bash

# Submit jobs on IHEP cluster to fill missing data in DQ DB
# Also generate a list of missing KUP/ODM files

# This script is meant to be executed on the IHEP system
# E.g. ssh mkramer@lxslc7.ihep.ac.cn /bin/bash < fill_gaps.sh
# Recommend running via cron every 3 days or so

FIRST_RUN=78000                 # Bump me up as needed

load-nuwa
DATE=$(date +%Y%m%d)
cd workfs/db_fill2

for dirname in gaps jobs; do
    pushd data/$dirname
    find . -name 'dq.auto.*' -mtime +20 | xargs -r -t rm 2>&1
    popd
done

# The 'until' is there to keep retrying in case the POS DB timeouts
# -g N => ignore files less than N days old
until dqtools/refill/dqdb_gaps.py -g 2 $FIRST_RUN 999999 data/gaps/dq.auto.$DATE; do sleep 5; done
dqtools/refill/gen_cmds.py data/gaps/dq.auto.$DATE data/jobs/dq.auto.$DATE
dqtools/refill/split.sh data/jobs/dq.auto.$DATE jobs_dq dump_dataqual.sh
dqtools/refill/split.sh data/jobs/dq.auto.$DATE jobs_lt dump_livetime.sh
dqtools/refill/submit.sh data/jobs/dq.auto.$DATE jobs_dq
dqtools/refill/submit.sh data/jobs/dq.auto.$DATE jobs_lt

# For the emailer script
cp data/jobs/dq.auto.$DATE/missing_any.txt data/misc/missing_kupodm.txt
