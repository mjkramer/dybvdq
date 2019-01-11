FROM python:3.7

RUN pip3 install pipenv

# ENV LC_ALL C.UTF-8
# ENV LANG C.UTF-8

COPY Pipfile Pipfile.lock /
RUN set -ex && pipenv install --deploy --system

COPY . /app
WORKDIR /app

CMD ./start_back.sh
