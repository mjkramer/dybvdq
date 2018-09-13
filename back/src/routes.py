#!/usr/bin/env python
"The Flask backend for DYB Visual DQ"

# pylint: disable=wrong-import-order,wrong-import-position

from flask import jsonify, request
import os
from sqlalchemy.dialects import mysql
from typing import Dict, List

from . import app
from .constants import NROWS
from .db import db
from .util import EndOfDataException, app_exec
from .util import back_the_hell_up, clip_location, loc_pred
from .util import get_data, get_latest, get_shifted, get_taggings
from .model import Tagging, DataLocation, all_fields

@app.route('/report_taggings', methods=['POST'])
def report_taggings():
    "Receive taggings from client and save them somewhere"
    if os.environ.get('DYBVDQ_SQLALCHEMY_ECHO') == '1':
        print(request.json)

    payload = request.json
    hall = int(payload['hall'][2])
    session: str = payload['session']
    bounds: Dict = payload['bounds']
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

    loc = loc_pred(bounds['minRun'], bounds['minFile'],
                   bounds['maxRun'], bounds['maxFile'])
    del_query = f'''DELETE FROM tagging
                    WHERE session = "{session}" AND hall = {hall}
                    AND ({loc})'''
    app_exec(del_query, commit=True)

    update = [{'hall': hall, 'session': session, **tagging}
              for tagging in tagged_ids]
    stmt = mysql.insert(Tagging).values(update) # \
                # .on_duplicate_key_update(hall=Tagging.hall)
    db.get_engine(bind='app_db').execute(stmt)
    # db.session.commit()         # pylint: disable=no-member

    return 'Thanks!'

@app.route('/realdata')
def realdata():                 # pylint: disable=too-many-locals
    "A messy function that's not as bad as it used to be"
    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    session = request.args.get('session')
    page_shift = int(request.args.get('pageShift', 0))

    fields = request.args.get('fields')
    fields = [] if fields == '' else fields.split(',')

    if page_shift:
        try:
            runno, fileno = get_shifted(runno, fileno, hall, page_shift)
        except EndOfDataException:
            pass                # Sorry, we're not moving!

    runno, fileno = clip_location(runno, fileno, hall)

    result = get_data(runno, fileno, hall, fields)

    if len(result['runnos']) < NROWS:
        runno, fileno = back_the_hell_up(runno, hall)
        result = get_data(runno, fileno, hall, fields)

    assert len(result['runnos']) == NROWS

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

@app.route('/latest')
def latest():
    "Get the latest runs. Used in frontend initialization"
    annotate = lambda runno, fileno: {'runno': runno, 'fileno': fileno}
    obj = {f'EH{hall}': annotate(*get_latest(hall))
           for hall in [1, 2, 3]}
    return jsonify(obj)
