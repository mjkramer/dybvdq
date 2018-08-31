#!/usr/bin/env python
from flask import Flask, jsonify, render_template, request
import MySQLdb
from random import gauss

import util

NROWS = 1000

app = Flask(__name__, static_folder='dybvdq-front/build')

db = MySQLdb.connect(host='aftershock.lbl.gov', port=6603,
                     user='root', passwd='***REMOVED***', db='dq_db')

# db = MySQLdb.connect(host='dybdq.ihep.ac.cn',
#                      user='dayabay', passwd='***REMOVED***', db='dq_db')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/hello')
def hello():
    return 'Hello from the API!'

@app.route('/data/<int:runno>/<int:fileno>')
def data(runno, fileno):
    vals = [gauss(runno, fileno) for _ in range(100)]
    return jsonify(vals)

@app.route('/reportTaggings', methods=['POST'])
def reportTaggings():
    print(request.json)
    return 'Thanks!'

@app.route('/realdata')
def realdata():
    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    fields = request.args.get('fields')

    result = {'runnos': [],
              'filenos': [],
              'metrics': {field: {} for field in fields.split(',')}}

    sitemask = [1, 2, 4][hall-1]
    focus_sql = util.focus_sql(hall, runno)
    cursor = db.cursor()
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
                detdict = result['metrics'][field].setdefault(detkey, {})
                vals = detdict.setdefault('values', [])

                if fileno == last_fileno and det == last_det:
                    vals[-1] = row[i+3]
                else:
                    vals.append(row[i+3])

            last_fileno, last_det = fileno, det

    return jsonify(result)

def fields():
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

@app.route('/list_fields')
def list_fields():
    return jsonify(fields())

# entry point
if __name__ == '__main__':
    app.run()
