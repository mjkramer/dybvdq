START_7AD = 67976
START_8AD = 26694

def focus_sql_fancy(hall, runno):
    if hall == 1:
        if runno >= START_7AD:
            return f'm.detectorid = 2'
        else:
            return f'm.detectorid <= 2 and runno < {START_7AD}'
    elif hall == 2:
        if runno >= START_8AD:
            return f'm.detectorid <= 2'
        else:
            return f'm.detectorid <= 1 and runno < {START_8AD}'
    elif hall == 2:
        if runno >= START_8AD:
            return f'm.detectorid <= 4'
        else:
            return f'm.detectorid <= 3 and runno < {START_8AD}'

def focus_sql(hall, runno):
    if hall == 1:
        if runno >= START_7AD:
            return f'detectorid = 2'
        else:
            return f'detectorid <= 2'
    elif hall == 2:
        if runno >= START_8AD:
            return f'detectorid <= 2'
        else:
            return f'detectorid <= 1'
    elif hall == 3:
        if runno >= START_8AD:
            return f'detectorid <= 4'
        else:
            return f'detectorid <= 3'

def ndet(hall, runno):
    if hall == 1:
        return 1 if runno >= START_7AD else 2
    elif hall == 2:
        return 2 if runno >= START_8AD else 1
    elif hall == 3:
        return 4 if runno >= START_8AD else 3
