FROM ruby:2.5

MAINTAINER health-dashboard@gmail.com

RUN apt-get upgrade && apt-get update && apt-get install -y nodejs
 
WORKDIR /health-dashboard

ADD Gemfile /health-dashboard/

RUN bundle install

ADD . /health-dashboard/

RUN bundle install

CMD ./run.sh

