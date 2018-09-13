"Useful utilities"

from functools import lru_cache

from .constants import NROWS, START_7AD, START_8AD, FIRST_RUN
from .db import app_exec, dq_exec
from .model import all_fields

def focus_sql(hall, runno):
    "Restrict detector and runno as appropriate"
    if hall == 1:
        if runno >= START_7AD:
            return f'detectorid = 2'
        return f'detectorid <= 2 and runno < {START_7AD}'
    if hall == 2:
        if runno >= START_8AD:
            return f'detectorid <= 2'
        return f'detectorid <= 1 and runno < {START_8AD}'
    if hall == 3:
        if runno >= START_8AD:
            return f'detectorid <= 4'
        return f'detectorid <= 3 and runno < {START_8AD}'
    raise "Invalid hall"

def ndet(hall, runno):
    "Number of detectors in each hall"
    if hall == 1:
        return 1 if runno >= START_7AD else 2
    if hall == 2:
        return 2 if runno >= START_8AD else 1
    if hall == 3:
        return 4 if runno >= START_8AD else 3
    raise "Invalid hall"

def get_shifted(runno, fileno, hall, page_shift, skipfirst=True):
    """For when user clicks NEXT or PREV. Also abused by back_the_hell_up, which
    uses skipfirst=False"""
    assert page_shift in [1, -1]
    oper, order = ('>', 'ASC') if page_shift == 1 else ('<', 'DESC')
    sitemask = 4 if hall == 3 else hall
    nrows = NROWS if skipfirst else NROWS-1
    query = f'''SELECT runno, fileno
                FROM runno_fileno_sitemask
                WHERE sitemask = {sitemask}
                AND (runno {oper} {runno}
                     OR (runno = {runno} AND fileno {oper}= {fileno}))
                ORDER BY runno {order}, fileno {order}
                LIMIT 1 OFFSET {nrows}'''
    new_run, new_file = dq_exec(query).fetchone()

    boundary = {1: START_7AD, 2: START_8AD, 3: START_8AD}[hall]
    if runno < boundary <= new_run:
        return (boundary, 1)
    if new_run < boundary <= runno and 1 < fileno:  # XXX check me
        assert page_shift == -1
        return get_shifted(boundary, 1, hall, page_shift)
    return new_run, new_file

@lru_cache()
def get_latest(hall):
    "Most recent run/file for a given hall"
    sitemask = 4 if hall == 3 else hall
    query = f'''SELECT runno, fileno FROM runno_fileno_sitemask
                WHERE sitemask = {sitemask}
                ORDER BY runno DESC, fileno DESC LIMIT 1'''
    return dq_exec(query).fetchone()

def back_the_hell_up(runno, hall):
    """If we're near a boundary (either 7/8AD switch or end of data), back up so we
    get exactly NROWS points"""
    mid_run = [START_7AD, START_8AD, START_8AD][hall-1]
    latest_run, latest_file = get_latest(hall)

    if runno < mid_run:
        return get_shifted(mid_run, 1, hall, -1, skipfirst=False)
    return get_shifted(latest_run, latest_file, hall, -1, skipfirst=False)

def clip_location(runno, fileno, hall):
    """Ensure we don't go beyond 21221 or latest run"""
    if runno < FIRST_RUN[hall-1]:
        return FIRST_RUN[hall-1], 1
    latest_run, latest_file = get_latest(hall)
    if runno > latest_run or (runno == latest_run and fileno > latest_file):
        return back_the_hell_up(latest_run, hall)
    return runno, fileno

def get_data(runno, fileno, hall, fields):  # pylint: disable=too-many-locals
    """Pull the data requested, starting from first VALID run/file after/including
    the specified one"""
    result = {'runnos': [],
              'filenos': [],
              'metrics': {all_fields()[field]: {} for field in fields.split(',')}}

    sitemask = [1, 2, 4][hall-1]
    focus = focus_sql(hall, runno)
    last_runno, last_fileno, last_det = None, None, None

    end_runno, end_fileno = get_shifted(runno, fileno, hall, 1)
    if end_runno == runno:
        loc_pred = f'runno = {runno} AND (fileno BETWEEN {fileno} AND {end_fileno}-1)'
    else:
        loc_pred = f'''(runno BETWEEN {runno}+1 AND {end_runno}-1) OR
                       (runno = {runno} AND fileno >= {fileno}) OR
                       (runno = {end_runno} AND fileno < {end_fileno})'''
    query = f'''SELECT runno, fileno, detectorid, {fields}
                FROM DqDetectorNew NATURAL JOIN DqDetectorNewVld
                WHERE ({loc_pred}) AND ({focus}) AND sitemask={sitemask}
                ORDER BY runno, fileno, detectorid, insertdate'''

    rows = dq_exec(query).fetchall()

    for row in rows:
        runno, fileno, det = row[:3]

        if runno != last_runno or fileno != last_fileno:
            result['runnos'].append(runno)
            result['filenos'].append(fileno)

        detkey = f'AD{det}'

        for i, field in enumerate(fields.split(',')):
            detdict = result['metrics'][all_fields()[field]].setdefault(detkey, {})
            vals = detdict.setdefault('values', [])

            if fileno == last_fileno and det == last_det:
                vals[-1] = row[i+3]
            else:
                vals.append(row[i+3])

        last_runno, last_fileno, last_det = runno, fileno, det

    return result

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
