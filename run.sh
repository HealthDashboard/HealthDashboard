#!/bin/bash

cd /health-dashboard

rake db:migrate
rake db:seed

if [ -n "${1}" ]; then
    ${1}
else
    rails s
fi

