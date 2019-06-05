#!/bin/sh

cd /health-dashboard

rake db:create
rake db:migrate

rails s
