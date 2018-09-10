"DB interface for DYB Visual DQ"

# pylint: disable=missing-docstring

import os
from flask_sqlalchemy import SQLAlchemy

from app import app

def db_uri(host, port, user, passwd, database):
    return f'mysql+pymysql://{user}:{passwd}@{host}:{port}/{database}'

def get_binds():
    dq_db_uri = db_uri(os.environ['DYBVDQ_DQ_DB_HOST'],
                       os.environ['DYBVDQ_DQ_DB_PORT'],
                       os.environ['DYBVDQ_DQ_DB_USER'],
                       os.environ['DYBVDQ_DQ_DB_PASS'],
                       os.environ['DYBVDQ_DQ_DB_NAME'])

    app_db_uri = db_uri(os.environ['DYBVDQ_APP_DB_HOST'],
                        os.environ['DYBVDQ_APP_DB_PORT'],
                        os.environ['DYBVDQ_APP_DB_USER'],
                        os.environ['DYBVDQ_APP_DB_PASS'],
                        os.environ['DYBVDQ_APP_DB_NAME'])

    return {'dq_db': dq_db_uri,
            'app_db': app_db_uri}

app.config['SQLALCHEMY_BINDS'] = get_binds()
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)            # pylint: disable=invalid-name

def dq_exec(query):
    # pylint: disable=E1101
    return db.session.execute(query, bind=db.get_engine(bind='dq_db'))

def app_exec(query):
    # pylint: disable=E1101
    return db.session.execute(query, bind=db.get_engine(bind='app_db'))
