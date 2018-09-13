"Local database for DYB Visual DQ"

# pylint: disable=missing-docstring,too-few-public-methods,no-member

from mypy_extensions import TypedDict
from .db import db

DataLocation = TypedDict('DataLocation',  # pylint: disable=invalid-name
                         {'runno': int, 'fileno': int})

class Tagging(db.Model):
    __bind_key__ = 'app_db'

    session = db.Column(db.String(80), primary_key=True)
    timestamp = db.Column(db.DateTime, primary_key=True)
    hall = db.Column(db.Integer, primary_key=True)
    runno = db.Column(db.Integer, primary_key=True)
    fileno = db.Column(db.Integer, primary_key=True)

class DqDetectorNew(db.Model):
    __tablename__ = 'DqDetectorNew'
    __bind_key__ = 'dq_db'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.get_engine(bind='dq_db')
    }

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

db.create_all()
