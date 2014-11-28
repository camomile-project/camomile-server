#!/bin/sh
 
if [ -z ${ROOT_PASSWORD+x} ];
then 
    echo "Please provide root password with option -e ROOT_PASSWORD=***";
    exit
fi

if [ -z ${MONGODB_PORT_27017_TCP_ADDR+x} ];
then 
    echo "Please link to a MongoDB container.";
    exit
fi

forever /app/app.js --root_pass=$ROOT_PASSWORD \
                 --video_path=/media \
                 --db_port=$MONGODB_PORT_27017_TCP_PORT \
                 --db_host=$MONGODB_PORT_27017_TCP_ADDR
