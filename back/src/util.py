"Useful utilities"

from functools import lru_cache

from .constants import NROWS, START_7AD, START_8AD, FIRST_RUN
from .db import app_exec, dq_exec
from .model import all_fields

class EndOfDataException(Exception):
    "We've hit the end, captain!"
    pass

def field_desc(field):
    "Given short name (e.g. plikecounts) of field, return full name plus unit"
    desc = all_fields()[field]
    if desc.endswith('rate'):
        return f'{desc}, Hz'
    if desc.endswith('energy'):
        return f'{desc}, MeV'
    return desc

def sitemask(hall):
    "Converts hall [1, 2, 3] to sitemask [1, 2, 4]"
    return [1, 2, 4][hall - 1]

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

def dets_for(hall, runno):
    "Active detectors in each hall"
    if hall == 1:
        return [2] if runno >= START_7AD else [1, 2]
    if hall == 2:
        return [1, 2] if runno >= START_8AD else [1]
    if hall == 3:
        return [1, 2, 3, 4] if runno >= START_8AD else [1, 2, 3]
    raise "Invalid hall"

def assert_is_sane(data):
    "Verifies absence of gaps in the data we're sending to the client"
    assert len(data['runnos']) == len(data['filenos']) == NROWS
    for metname in data['metrics'].keys():
        for detname in data['metrics'][metname].keys():
            assert len(data['metrics'][metname][detname]['values']) == NROWS

def get_shifted(runno, fileno, hall, page_shift, skipfirst=True):
    """For when user clicks NEXT or PREV. Also abused by back_the_hell_up and
    get_data, which uses skipfirst=False """
    assert page_shift in [1, -1]
    oper, order = ('>', 'ASC') if page_shift == 1 else ('<', 'DESC')
    nrows = NROWS if skipfirst else NROWS-1
    query = f'''SELECT runno, fileno
                FROM runno_fileno_sitemask
                WHERE sitemask = {sitemask(hall)}
                AND streamtype = 'Physics'
                AND (runno {oper} {runno}
                     OR (runno = {runno} AND fileno {oper}= {fileno}))
                ORDER BY runno {order}, fileno {order}
                LIMIT 1 OFFSET {nrows}'''
    result = dq_exec(query).fetchone()
    if result is None:          # Went past the end
        raise EndOfDataException
    new_run, new_file = result

    boundary = {1: START_7AD, 2: START_8AD, 3: START_8AD}[hall]
    if runno < boundary <= new_run:
        assert page_shift == 1
        return (boundary, 1)
    on_boundary = runno == boundary and fileno == 1 # don't recurse if on_boundary!
    if new_run < boundary <= runno and not on_boundary:
        assert page_shift == -1
        return get_shifted(boundary, 1, hall, page_shift)
    return new_run, new_file

@lru_cache()
def get_latest(hall):
    "Most recent run/file for a given hall"
    # RFS = runno_fileno_sitemask
    # query = select(RFS.runno, RFS.fileno)       \
    #     .where(RFS.sitemask == sitemask(hall))  \
    #     .order_by(RFS.runno.desc(), RFS.fileno) \
    #     .limit(1);
    query = f'''SELECT runno, fileno FROM runno_fileno_sitemask
                WHERE sitemask = {sitemask(hall)}
                AND streamtype = 'Physics'
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

def loc_pred(runno, fileno, end_runno, end_fileno):
    "Generate SQL to select the specified file range (inclusive)"
    if end_runno == runno:
        return f'(runno = {runno} AND (fileno BETWEEN {fileno} AND {end_fileno}))'
    return f'''((runno BETWEEN {runno}+1 AND {end_runno}-1) OR
                (runno = {runno} AND fileno >= {fileno}) OR
                (runno = {end_runno} AND fileno <= {end_fileno}))'''

def get_livetimes(runno, fileno, end_runno, end_fileno, hall):
    "Get the livetimes for the given range of files"
    loc = loc_pred(runno, fileno, end_runno, end_fileno)
    # query = f'''SELECT runno, fileno, integralruntime
    #             FROM DqLiveTime NATURAL JOIN DqLiveTimeVld WHERE
    #             ({loc}) AND sitemask = {sitemask(hall)}
    #             GROUP BY runno, fileno '''

    # using window functions, we can ensure we get only the latest SEQNO
    query = f''' WITH ranked AS (
                   SELECT runno, fileno, integralruntime,
                          ROW_NUMBER() OVER
                            (PARTITION BY runno, fileno ORDER BY seqno DESC) AS rn
                   FROM DqLiveTime NATURAL JOIN DqLiveTimeVld
                   WHERE ({loc}) AND sitemask = {sitemask(hall)})
                 SELECT runno, fileno, integralruntime FROM ranked WHERE rn = 1'''
    return dq_exec(query)

def get_data(start_runno, start_fileno, hall, fields):  # pylint: disable=too-many-locals
    """Pull the data requested, starting from first VALID run/file after/including
    the specified one"""
    result = {'runnos': [],
              'filenos': [],
              'metrics': {
                  field_desc(field): {
                      f'AD{det}': {'values': []}
                      for det in dets_for(hall, start_runno)}
                  for field in fields}}

    focus = focus_sql(hall, start_runno)

    try:
        end_runno, end_fileno = get_shifted(start_runno, start_fileno, hall, 1, skipfirst=False)
    except EndOfDataException:  # return empty result, let caller decide how to proceed
        return result

    if any(f.endswith('counts') for f in fields):
        livetimes = {}
        rows = get_livetimes(start_runno, start_fileno, end_runno, end_fileno, hall)
        for runno, fileno, lt_ms in rows:
            livetimes[(runno, fileno)] = lt_ms / 1000
        default_livetime = sum(livetimes.values()) / len(livetimes)

    field_sel = f', {",".join(fields)}' if fields else ''
    loc = loc_pred(start_runno, start_fileno, end_runno, end_fileno)

    query = f'''SELECT runno, fileno, detectorid {field_sel}
                FROM DqDetectorNew NATURAL JOIN DqDetectorNewVld vld
                LEFT JOIN runno_fileno_sitemask USING (runno, fileno)
                WHERE ({loc}) AND ({focus}) AND vld.sitemask = {sitemask(hall)}
                AND streamtype = 'Physics'
                ORDER BY runno, fileno, detectorid, insertdate'''

    rows = dq_exec(query).fetchall()

    def val_arr(field, det):
        return result['metrics'][field_desc(field)][f'AD{det}']['values']

    last_runno, last_fileno = None, None

    for row in rows:
        runno, fileno, det = row[:3]

        if runno != last_runno or fileno != last_fileno:
            result['runnos'].append(runno)
            result['filenos'].append(fileno)
            for each_det in dets_for(hall, start_runno):
                for field in fields:
                    val_arr(field, each_det).append(-2)  # default value

        for i, field in enumerate(fields):
            val = row[i+3]

            if field.endswith('counts'):
                try:
                    norm = livetimes[(runno, fileno)]
                except KeyError:
                    print(f'WARNING: Missing livetime for {runno}, {fileno}')
                    norm = default_livetime
                if val is not None:  # in case we got a NULL in this row
                    val /= norm

            if val is None:
                val = -3

            val_arr(field, det)[-1] = val  # replace default/older
        last_runno, last_fileno = runno, fileno
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

    query = f'''SELECT runno, fileno, comment FROM tagging
                WHERE ({pred}) AND hall={hall} AND session="{session}"
                ORDER BY runno, fileno'''

    result = app_exec(query).fetchall()
    taggings = [(runno, fileno) for runno, fileno, _ in result]
    comments = [comment for _, _, comment in result]
    return taggings, comments
