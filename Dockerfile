# CAMOMILE Annotation Framework
#
# VERSION 0.1

FROM stackbrew/ubuntu:12.04
MAINTAINER Hervé Bredin <bredin@limsi.fr>

# create volumes
# /app:   path to app directory
# /media: path to media
VOLUME ["/media"]

# install NodeJS
RUN apt-get update
RUN apt-get install -y python-software-properties python g++ make software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y nodejs
RUN npm install -g forever

# expose NodeJS app port
EXPOSE 3000

ADD . /app

RUN chmod +x /app/run.sh
RUN cd /app; npm install
ENTRYPOINT ["/bin/bash", "/app/run.sh"]

