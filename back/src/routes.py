#!/usr/bin/env python
"The Flask backend for DYB Visual DQ"

# pylint: disable=wrong-import-order,wrong-import-position

from flask import jsonify, request
from sqlalchemy.dialects import mysql
from typing import List

from . import app
from .util import focus_sql, get_shifted
from .constants import NROWS
from .db import db, dq_exec, app_exec
from .model import Tagging, DataLocation, all_fields

@app.route('/report_taggings', methods=['POST'])
def report_taggings():
    "Receive taggings from client and save them somewhere"
    print(request.json)

    payload = request.json
    hall = int(payload['hall'][2])
    session: str = payload['session']
    tagged_ids: List[DataLocation] = payload['taggedIds']

    # HACK
    if not tagged_ids:
        return 'Thanks!'

    # for tagged in payload['taggedIds']:
    #     tagging = Tagging(fileno=tagged['fileno'],
    #                       runno=tagged['runno'],
    #                       hall=hall,
    #                       session=session)
    #     db.session.add(tagging)  # pylint: disable=no-member

    update = [{'hall': hall, 'session': session, **tagging}
              for tagging in tagged_ids]
    stmt = mysql.insert(Tagging).values(update) \
                .on_duplicate_key_update(hall=Tagging.hall)
    db.get_engine(bind='app_db').execute(stmt)

    # db.session.commit()         # pylint: disable=no-member

    return 'Thanks!'

def get_taggings(hall, session, lowbound, highbound):
    "Fetch any saved taggings between the bounds"
    low_runno, low_fileno = lowbound
    high_runno, high_fileno = highbound

    if low_runno == high_runno:
        pred = f'''runno={low_runno} AND
                   (fileno BETWEEN {low_fileno} AND {high_fileno})'''
    else:
        pred = f'''(runno BETWEEN {low_runno}+1 AND {high_runno}-1) OR
                   (runno={low_runno} AND fileno>={low_fileno}) OR
                   (runno={high_runno} AND fileno<={high_fileno})'''

    query = f'''SELECT runno, fileno FROM tagging
                WHERE ({pred}) AND hall={hall} AND session="{session}"
                ORDER BY runno, fileno'''

    result = app_exec(query).fetchall()
    return set(map(tuple, result))

@app.route('/realdata')
def realdata():                 # pylint: disable=too-many-locals
    "monstrous function that needs to be cleaned up"
    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    fields = request.args.get('fields')
    session = request.args.get('session')
    page_shift = int(request.args.get('pageShift', 0))

    if page_shift:
        runno, fileno = get_shifted(runno, fileno, hall, page_shift)

    result = {'runnos': [],
              'filenos': [],
              'metrics': {all_fields()[field]: {} for field in fields.split(',')}}

    sitemask = [1, 2, 4][hall-1]
    focus = focus_sql(hall, runno)
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
                    WHERE runno = {cur_runno} AND {focus}
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

    lowbound = (result['runnos'][0], result['filenos'][0])
    highbound = (result['runnos'][-1], result['filenos'][-1])
    taggings = set(get_taggings(hall, session, lowbound, highbound))

    result['tagStatus'] = [(runno, fileno) in taggings
                           for (runno, fileno)
                           in zip(result['runnos'], result['filenos'])]

    return jsonify(result)

@app.route('/list_fields')
def list_fields():
    "Used by react-select for picking the quantities to plot"
    return jsonify(all_fields())
