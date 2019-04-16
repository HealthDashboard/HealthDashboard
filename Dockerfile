FROM ruby:2.5

MAINTAINER health-dashboard@gmail.com

RUN apt-get update && apt-get upgrade -y && apt-get install -y nodejs

WORKDIR /health-dashboard

ADD Gemfile /health-dashboard/

RUN bundle install

ADD . /health-dashboard/

# TODO: O primeiro bundle install não está fazendo download de tudo.
RUN gem install bundler --no-doc
RUN bundle install

ENTRYPOINT ["./bin/wait-for-it.sh", "--timeout=0", "postgresql:5432", "--", "./run.sh"]
