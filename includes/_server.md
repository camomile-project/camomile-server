# Server

The Camomile server is available on [Github](https://github.com/camomile-project/camomile-server).

## Installation

The recommended way to install and run the Camomile server is using [Docker](https://docs.docker.com/).

### MongoDB

It relies on [MongoDB](https://www.mongodb.org/) for storing annotations.

```bash
$ export CMML_DB="/path/to/the/database"
$ docker run -d \
         -v $CMML_DB:/data/db \
         --name my_mongodb dockerfile/mongodb
```

### Camomile REST API

Once the MongoDB container is up and running, the [NodeJS](https://nodejs.org/) Camomile server can use it as storage backend.


```bash
$ export CMML_MEDIA="/path/to/media/files"
$ docker run -d -P \
         -v $CMML_MEDIA:/media \
         -e ROOT_PASSWORD="R00t.p455w0rd" \
         --link my_mongodb:mongodb \
         --name camomile camomile/api
$ echo "Camomile server is now available at `docker port camomile 3000`"
```
