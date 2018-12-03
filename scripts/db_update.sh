#!/bin/bash

# Pull relevant tables from official DQ/offline DB, load into local DB, rebuild indices
# Should be run as a cron job

shopt -s expand_aliases

while getopts "n" o; do
    case "$o" in
        # in case we need to perform any manual steps (e.g. rebuild backend image)
        n) dontstartback=1;;
    esac
done
shift $((OPTIND-1))

echo "Update started at $(date)"

. ~/.db_secrets

TODAY=$(date +%Y%m%d)

echo "=== Clearing old dumps"
cd ~/visual_dq/dq_db/dumps
find . -name '*.sql' -mtime +14 | xargs -r -t rm 2>&1

# Need /bin/bash to suppress "pseudo-terminal will not be allocated" blah
ssh -J mkramer@lxslc6.ihep.ac.cn guwq@dybdq.ihep.ac.cn /bin/bash <<-EOF
  cd matt/mysqldumps
  echo "=== (dybdq.ihep) Clearing old dumps"
  find . -name '*.sql' -mtime +5 | xargs -r -t rm 2>&1
  echo "=== (dybdq.ihep) Dumping dq_db"
  mysqldump -h dybdq.ihep.ac.cn -u dybrw --password=$DQ_DB_PASS --opt dq_db DqDetectorNew DqDetectorNewVld DqLiveTime DqLiveTimeVld most_recent_file_tag > dq_db.$TODAY.sql
  echo "=== (dybdq.ihep) Dumping offline_db"
  mysqldump -h dybdb1.ihep.ac.cn -u dayabay --password=$OFFLINE_DB_PASS --opt --skip-lock-tables offline_db DaqRawDataFileInfo DaqRawDataFileInfoVld > offline_db.$TODAY.sql
  echo "=== (dybdq.ihep) Copying to dybdq.work"
  scp dq_db.$TODAY.sql offline_db.$TODAY.sql root@dybdq.work:visual_dq/dq_db/dumps
EOF

echo "=== Shutting down backend and DB"
docker cp ~/visual_dq/dybvdq/extra/maintenance.html dybvdq-nginx:/webroot
docker stop dybvdq-back
docker stop dybvdq-dq_db
docker rm dybvdq-dq_db

echo "=== Wiping old DB"
rm -rf ~/visual_dq/dq_db/data/*

echo "=== Starting fresh DB"
cd ~/visual_dq/dybvdq/deploy
docker-compose up -d dq_db
sleep 60                 # use code from P17B to determine when DB comes online?

alias dq_mysql="docker exec -i dybvdq-dq_db mysql --password=$OFFLINE_DB_PASS dq_db"

echo "=== Loading data into DB"
dq_mysql < ~/visual_dq/dq_db/dumps/dq_db.$TODAY.sql
dq_mysql < ~/visual_dq/dq_db/dumps/offline_db.$TODAY.sql

echo "=== Building indexes and derived tables"
dq_mysql < ~/visual_dq/dybvdq/extra/indexes.sql

if [ -z "$dontstartback" ]; then
    echo "=== Starting backend"
    docker start dybvdq-back
    docker exec dybvdq-nginx rm /webroot/maintenance.html
fi

echo "=== Update completed at $(date)"
