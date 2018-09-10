"Local database for DYB Visual DQ"

# pylint: disable=missing-docstring,too-few-public-methods,no-member

from .db import db

class Tagging(db.Model):
    __bind_key__ = 'app_db'

    session = db.Column(db.String(80), primary_key=True)
    fileno = db.Column(db.Integer, primary_key=True, nullable=False)
    runno = db.Column(db.Integer, primary_key=True, nullable=False)
    hall = db.Column(db.Integer, primary_key=True, nullable=False)

db.create_all()
