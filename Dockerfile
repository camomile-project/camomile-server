# CAMOMILE Annotation Framework
#
# VERSION 0.0.1

FROM stackbrew/ubuntu:12.04
MAINTAINER Hervé Bredin <bredin@limsi.fr>

# create volumes
# /app:   path to app directory
# /db:    path to database
# /media: path to media
VOLUME ["/app", "/db", "/media"]

# install mongodb and NodeJS
RUN apt-get update
RUN apt-get install -y python-software-properties python g++ make software-properties-common
RUN add-apt-repository ppa:chris-lea/node.js
RUN apt-get update
RUN apt-get install -y mongodb nodejs

# expose NodeJS app port
EXPOSE 3000

CMD ["/bin/bash", "/app/docker/run.sh"]

