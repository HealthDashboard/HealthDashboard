#!/bin/bash

cd /health-dashboard

rake db:create
rake db:migrate
rake db:seed || sleep 3

rails s
