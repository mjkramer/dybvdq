"Useful utilities"

from .constants import NROWS
from .db import dq_exec

START_7AD = 67976
START_8AD = 26694

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
    if hall == 2:
        if runno >= START_8AD:
            return f'detectorid <= 4'
        return f'detectorid <= 3 and runno < {START_8AD}'
    raise "Invalid hall"

def focus_sql_old(hall, runno):
    "We're currently using this simple one"
    if hall == 1:
        if runno >= START_7AD:
            return f'detectorid = 2'
        return f'detectorid <= 2'
    if hall == 2:
        if runno >= START_8AD:
            return f'detectorid <= 2'
        return f'detectorid <= 1'
    if hall == 3:
        if runno >= START_8AD:
            return f'detectorid <= 4'
        return f'detectorid <= 3'
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

# TODO: Don't go before 21221
def get_shifted(runno, fileno, hall, page_shift):
    "For when user clicks NEXT or PREV"
    assert page_shift in [1, -1]
    oper, order = ('>', 'ASC') if page_shift == 1 else ('<', 'DESC')
    sitemask = 4 if hall == 3 else hall
    query = f'''SELECT runno, fileno
                FROM runno_fileno_sitemask
                WHERE sitemask = {sitemask}
                AND (runno {oper} {runno}
                     OR (runno = {runno} AND fileno {oper}= {fileno}))
                ORDER BY runno {order}, fileno {order}
                LIMIT 1 OFFSET {NROWS}'''
    new_run, new_file = dq_exec(query).fetchone()

    boundary = {1: START_7AD, 2: START_8AD, 3: START_8AD}[hall]
    if runno < boundary <= new_run:
        return (boundary, 1)
    if new_run < boundary <= runno:
        return get_shifted(boundary, 1, hall, page_shift)
    return new_run, new_file
