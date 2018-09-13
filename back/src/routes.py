#!/usr/bin/env python
"The Flask backend for DYB Visual DQ"

# pylint: disable=wrong-import-order,wrong-import-position

from flask import jsonify, request
from sqlalchemy.dialects import mysql
from typing import List

from . import app
from .constants import NROWS
from .util import back_the_hell_up, clip_location
from .util import get_data, get_latest, get_shifted, get_taggings
from .db import db
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

@app.route('/realdata')
def realdata():                 # pylint: disable=too-many-locals
    "A messy function that's not as bad as it used to be"
    runno = int(request.args.get('runno'))
    fileno = int(request.args.get('fileno'))
    hall = int(request.args.get('hall')[2])
    fields = request.args.get('fields')
    session = request.args.get('session')
    page_shift = int(request.args.get('pageShift', 0))

    print('A', runno, fileno)

    if page_shift:
        runno, fileno = get_shifted(runno, fileno, hall, page_shift)

    print('B', runno, fileno)

    runno, fileno = clip_location(runno, fileno, hall)

    print('C', runno, fileno)

    result = get_data(runno, fileno, hall, fields)

    if len(result['runnos']) < NROWS:
        # print('WTF', len(result['runnos']))
        runno, fileno = back_the_hell_up(runno, hall)
        result = get_data(runno, fileno, hall, fields)

    print('LEN', len(result['runnos']))
    assert len(result['runnos']) == NROWS

    lowbound = (result['runnos'][0], result['filenos'][0])
    highbound = (result['runnos'][-1], result['filenos'][-1])
    taggings = set(get_taggings(hall, session, lowbound, highbound))

    result['tagStatus'] = [(runno, fileno) in taggings
                           for (runno, fileno)
                           in zip(result['runnos'], result['filenos'])]

    latest_run, latest_file = get_latest(hall)
    result['latest'] = {'runno': latest_run, 'fileno': latest_file}

    return jsonify(result)

@app.route('/list_fields')
def list_fields():
    "Used by react-select for picking the quantities to plot"
    return jsonify(all_fields())
