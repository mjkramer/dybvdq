FROM python:3.7

RUN pip3 install pipenv

# ENV LC_ALL C.UTF-8
# ENV LANG C.UTF-8

COPY . /app
WORKDIR /app

RUN set -ex && pipenv install --deploy --system

CMD sleep 10 && gunicorn -w 4 -k gevent -b :5000 src:app
