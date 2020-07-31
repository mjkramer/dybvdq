"Local database for DYB Visual DQ"

# pylint: disable=missing-docstring,too-few-public-methods,no-member

# from mypy_extensions import TypedDict
from sqlalchemy.sql.expression import func

from .db import db

# DataLocation = TypedDict('DataLocation',  # pylint: disable=invalid-name
#                          {'runno': int, 'fileno': int})

class Tagging(db.Model):
    __bind_key__ = 'app_db'

    session = db.Column(db.String(80), primary_key=True)
    hall = db.Column(db.Integer, primary_key=True)
    runno = db.Column(db.Integer, primary_key=True)
    fileno = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, default=func.now())
    comment = db.Column(db.Text, default='')
    untag = db.Column(db.Boolean, default=False)

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
        'triggercounts': 'Trigger rate',
        'flashercounts': 'Flasher rate',
        'muoncounts': 'Muon rate',
        'ibdcounts': 'IBD rate',
        'spncounts': 'SPN rate',
        'blocktrigcounts': 'Blocked trigger rate',
        'spnenergy': 'SPN energy',
        'k40energy': 'K40 energy',
        'tl208energy': 'Tl208 energy',
        'plikecounts': 'Prompt-like rate',
        'nlikecounts': 'Delayed-like rate',

        'triggercountsWP': 'WP trigger rate',
        'flashercountsWP': 'WP flasher rate',
        'muoncountsWP': 'WP muon rate',
        'blocktrigcountsWP': 'WP blocked trigger rate',
    }

db.create_all()
