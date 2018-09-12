"Useful utilities"

from .constants import NROWS
from .db import dq_exec

START_7AD = 67976
START_8AD = 26694

def focus_sql_fancy(hall, runno):
    "What was this one for?"
    if hall == 1:
        if runno >= START_7AD:
            return f'm.detectorid = 2'
        return f'm.detectorid <= 2 and runno < {START_7AD}'
    if hall == 2:
        if runno >= START_8AD:
            return f'm.detectorid <= 2'
        return f'm.detectorid <= 1 and runno < {START_8AD}'
    if hall == 2:
        if runno >= START_8AD:
            return f'm.detectorid <= 4'
        return f'm.detectorid <= 3 and runno < {START_8AD}'
    raise "Invalid hall"

def focus_sql(hall, runno):
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

def get_shifted(runno, fileno, pageShift):
    assert pageShift in [1, -1]
    oper, order = ('>', 'ASC') if pageShift == 1 else ('<', 'DESC')
    query = f'''SELECT DISTINCT runno, fileno FROM DqDetectorNew
                WHERE runno {oper} {runno}
                OR (runno = {runno} AND fileno {oper}= {fileno})
                ORDER BY runno {order}, fileno {order}
                LIMIT 1 OFFSET {NROWS}'''
    return dq_exec(query).fetchone()
