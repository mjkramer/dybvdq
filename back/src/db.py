"DB interface for DYB Visual DQ"

# pylint: disable=missing-docstring

import os
from flask_sqlalchemy import SQLAlchemy

import app
APP = app.APP

def db_uri(host, port, user, passwd, database):
    return f'mysql+pymysql://{user}:{passwd}@{host}:{port}/{database}'

def get_binds():
    dq_db_uri = db_uri(os.environ['DYBVDQ_DB_HOST'],
                       os.environ['DYBVDQ_DB_PORT'],
                       os.environ['DYBVDQ_DB_USER'],
                       os.environ['DYBVDQ_DB_PASS'],
                       os.environ['DYBVDQ_DB_NAME'])

    return {'dq_db': dq_db_uri}

APP.config['SQLALCHEMY_BINDS'] = get_binds()
APP.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

DB = SQLAlchemy(APP)

def dq_exec(query):
    # pylint: disable=E1101
    return DB.session.execute(query, bind=DB.get_engine('dq_db'))
