#!/usr/bin/env python
"The Flask backend for DYB Visual DQ"

from flask import Flask, jsonify, render_template, request
import pymysql             # supports gevent (for gunicorn), unlike mysqlclient

import util

pymysql.install_as_MySQLdb()

NROWS = 1000

# If nginx is configured properly, we shouldn't have any need for
# template/static_folder
APP = Flask(__name__, template_folder='../../front/build',
            static_folder='../../front/build/static')

DB = pymysql.connect(host='142.93.95.86',  # dybdq.work
                     user='root', passwd='***REMOVED***', db='dq_db')

@APP.route('/')
def index():
    "Serve the HTML entrypoint (ideally should be handled by nginx)"
    return render_template('index.html')

@APP.route('/report_taggings', methods=['POST'])
def report_taggings():
    "Receive taggings from client and save them somewhere"
    print(request.json)
    return 'Thanks!'

@APP.route('/realdata')
def realdata():                 # pylint: disable=too-many-locals
    "monstrous function that needs to be cleaned up"
    DB.ping() # in case we've idled out -- replace with connection pool?

    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    fields = request.args.get('fields')

    result = {'runnos': [],
              'filenos': [],
              'metrics': {all_fields()[field]: {} for field in fields.split(',')}}

    sitemask = [1, 2, 4][hall-1]
    focus_sql = util.focus_sql(hall, runno)
    cursor = DB.cursor()
    cur_runno, last_fileno, last_det = None, None, None
    numread = 0

    while numread < NROWS:
        if cur_runno is None:
            cur_runno = runno
        else:
            query = f'''SELECT runno
                        FROM DqDetectorNew NATURAL JOIN DqDetectorNewVld
                        WHERE runno > {cur_runno} AND sitemask = {sitemask}
                        LIMIT 1'''
            # print(query)
            cursor.execute(query)
            cur_runno = cursor.fetchone()[0]

        query = f'''SELECT runno, fileno, detectorid, {fields}
                    FROM DqDetectorNew NATURAL JOIN DqDetectorNewVld
                    WHERE runno = {cur_runno} AND {focus_sql}
                    ORDER BY runno, fileno, detectorid, insertdate'''
        # print(query)
        cursor.execute(query)
        rows = cursor.fetchall()

        last_fileno = -1

        for row in rows:
            # print(row)

            runno, fileno, det = row[:3]

            if fileno != last_fileno:
                if numread == NROWS:
                    break

                result['runnos'].append(runno)
                result['filenos'].append(fileno)
                numread += 1

            detkey = f'AD{det}'

            for i, field in enumerate(fields.split(',')):
                detdict = result['metrics'][all_fields()[field]].setdefault(detkey, {})
                vals = detdict.setdefault('values', [])

                if fileno == last_fileno and det == last_det:
                    vals[-1] = row[i+3]
                else:
                    vals.append(row[i+3])

            last_fileno, last_det = fileno, det

    return jsonify(result)

def all_fields():
    "Everything we know how to plot"
    return {
        'triggercounts': 'Trigger counts',
        'flashercounts': 'Flasher counts',
        'muoncounts': 'Muon counts',
        'ibdcounts': 'IBD counts',
        'spncounts': 'SPN counts',
        'blocktrigcounts': 'Blocked trigger counts',
        'spnenergy': 'SPN energy',
        'k40energy': 'K40 energy',
        'tl208energy': 'Tl208 energy',
        'plikecounts': 'Prompt-like counts',
        'nlikecounts': 'Delayed-like counts',
    }

@APP.route('/list_fields')
def list_fields():
    "Used by react-select for picking the quantities to plot"
    return jsonify(all_fields())

# entry point
if __name__ == '__main__':
    APP.run()
