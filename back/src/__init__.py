"DYBVDQ backend"

from flask import Flask

app = Flask('dybvdq')           # pylint: disable=invalid-name

from . import routes            # pylint: disable=unused-import,wrong-import-position
