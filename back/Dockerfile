FROM python:3.7

RUN pip3 install pipenv

# ENV LC_ALL C.UTF-8
# ENV LANG C.UTF-8

COPY back/Pipfile back/Pipfile.lock /
RUN set -ex && pipenv install --deploy --system
RUN rm /Pipfile /Pipfile.lock

VOLUME /app
WORKDIR /app/back/src
CMD gunicorn -w 4 -k gevent -b :5000 app:app
