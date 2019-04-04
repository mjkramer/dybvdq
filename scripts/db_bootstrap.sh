#!/bin/bash

shopt -s expand_aliases

BASEDIR=$(cd $(dirname $BASH_SOURCE)/.. && pwd) # root of dybvdq repo

. $BASEDIR/deploy/.env

echo "Bootstrap started at $(date)"

TODAY=$(date +%Y%m%d)

DUMPDIR=$DYBVDQ_DQ_DB_DATA/../dumps
mkdir -p $DUMPDIR

# Need /bin/bash to suppress "pseudo-terminal will not be allocated" blah
ssh -J mkramer@lxslc6.ihep.ac.cn guwq@dybdq.ihep.ac.cn /bin/bash <<-EOF
  cd matt/mysqldumps
  echo "=== (dybdq.ihep) Dumping dq_db"
  mysqldump -h dybdq.ihep.ac.cn -u dybrw --password=$DYBVDQ_IHEP_DQ_DB_PASS --opt dq_db DqDetectorNew DqDetectorNewVld DqLiveTime DqLiveTimeVld most_recent_file_tag > dq_db.$TODAY.sql
  echo "=== (dybdq.ihep) Dumping offline_db"
  mysqldump -h dybdb1.ihep.ac.cn -u dayabay --password=$DYBVDQ_IHEP_OFFLINE_DB_PASS --opt --skip-lock-tables offline_db DaqRawDataFileInfo DaqRawDataFileInfoVld > offline_db.$TODAY.sql
  echo "=== (dybdq.ihep) Copying to dybdq.work"
  scp dq_db.$TODAY.sql offline_db.$TODAY.sql root@$DYBVDQ_HOSTNAME:$DUMPDIR
EOF

echo "=== Spinning up DB"
cd $BASEDIR/deploy
docker-compose up -d dq_db

echo "=== Waiting for DB"
while ! docker exec dybvdq-dq_db mysql --password=$DYBVDQ_DQ_DB_PASS -e "SELECT 1"; do
    echo wait
    sleep 1
done

sleep 5

alias dq_mysql="docker exec -i dybvdq-dq_db mysql --password=$DYBVDQ_DQ_DB_PASS dq_db"

echo "=== Loading data into DB"
dq_mysql < $DUMPDIR/dq_db.$TODAY.sql
dq_mysql < $DUMPDIR/offline_db.$TODAY.sql

echo "=== Building indexes and derived tables"
dq_mysql < $BASEDIR/extra/indexes.sql

echo "=== Shutting down DB"
docker-compose down dq_db

echo "=== Bootstrap completed at $(date)"
