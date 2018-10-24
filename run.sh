#!/bin/bash

cd /health-dashboard

rake db:migrate 2>/dev/null || (rake db:create && rake db:migrate)

rails s
