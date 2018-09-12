#!/bin/bash

# Updating apt-get data
apt-get update -y

# Installing project requirements
apt-get install postgresql-10 postgresql-client-10 postgresql-server-dev-10 ruby-all-dev rails build-essential patch ruby-dev zlib1g-dev liblzma-dev -y

# Docker instalation
apt-get install apt-transport-https ca-certificates curl software-properties-common -y
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add -
if [ -n "`apt-key fingerprint 0EBFCD88`" ]; then
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
	apt-get update
	apt-get install docker-ce -y
    usermod -a -G docker vagrant
fi
