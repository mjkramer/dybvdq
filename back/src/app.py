#!/usr/bin/env python
"The Flask backend for DYB Visual DQ"

# pylint: disable=wrong-import-order,wrong-import-position

# We apply gevent's monkey patching as early as possible, just to be safe.
# From inspecting gunicorn's ggevent.py, we see that they use subprocess=True,
# so do the same here. In theory, as long as we create our Flask before doing
# anything else, this shouldn't be necessary. We can try removing it later.
from gevent import monkey
monkey.patch_all(subprocess=True)

from flask import Flask, jsonify, request

APP = Flask(__name__)

import util
from db import dq_exec

NROWS = 1000

@APP.route('/report_taggings', methods=['POST'])
def report_taggings():
    "Receive taggings from client and save them somewhere"
    print(request.json)
    return 'Thanks!'

@APP.route('/realdata')
def realdata():                 # pylint: disable=too-many-locals
    "monstrous function that needs to be cleaned up"
    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    fields = request.args.get('fields')

    result = {'runnos': [],
              'filenos': [],
              'metrics': {all_fields()[field]: {} for field in fields.split(',')}}

    sitemask = [1, 2, 4][hall-1]
    focus_sql = util.focus_sql(hall, runno)
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
            cur_runno = dq_exec(query).fetchone()[0]

        query = f'''SELECT runno, fileno, detectorid, {fields}
                    FROM DqDetectorNew NATURAL JOIN DqDetectorNewVld
                    WHERE runno = {cur_runno} AND {focus_sql}
                    ORDER BY runno, fileno, detectorid, insertdate'''
        rows = dq_exec(query).fetchall()

        last_fileno = -1

        for row in rows:
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
