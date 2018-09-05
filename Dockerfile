FROM python:3.7

RUN pip3 install pipenv

ENV LC_ALL C.UTF-8
ENV LANG C.UTF-8

# RUN mkdir /app
# WORKDIR /app
# COPY . /app

COPY Pipfile Pipfile.lock /
RUN set -ex && pipenv install --deploy --system
RUN rm /Pipfile /Pipfile.lock

EXPOSE 5000

WORKDIR /app
CMD python3 app.py
