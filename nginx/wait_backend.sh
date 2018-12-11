#!/bin/bash

while ! curl -s -m 1 dybvdq-back:5000/list_fields >/dev/null; do
    sleep 1
done
