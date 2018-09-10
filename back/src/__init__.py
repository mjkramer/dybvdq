"DYBVDQ backend"

# We apply gevent's monkey patching as early as possible, just to be safe.
# From inspecting gunicorn's ggevent.py, we see that they use subprocess=True,
# so do the same here. In theory, as long as we create our Flask before doing
# anything else, this shouldn't be necessary. We can try removing it later.
# Since IPython doesn't like this, we check for __IPYTHON__.

try:
    __IPYTHON__
except NameError:
    from gevent import monkey
    monkey.patch_all(subprocess=True)

from flask import Flask

app = Flask('dybvdq')           # pylint: disable=invalid-name

# This will begin the actual app setup
from . import routes            # pylint: disable=unused-import,wrong-import-position
