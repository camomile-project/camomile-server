# Camomile REST API

## Docker setup

### MongoDB

```
$ export CMML_DB=/path/to/the/database
$ docker run -d \
         -v $CMML_DB:/data/db \
         --name my_mongodb dockerfile/mongodb
```

How can I dump the database for backup?

```
$ export CMML_DUMP=/where/to/dump
$ docker run -i -t --rm \
         --link my_mongodb:mongodb \
         -v $CMML_DUMP:/dump \
         dockerfile/mongodb \
         bash -c 'mongodump --host $MONGODB_PORT_27017_TCP_ADDR -o /dump'
```

How can I restore previous backup?

```
$ docker run -i -t --rm \
         --link my_mongodb:mongodb \
         -v $CMML_DUMP:/dump \
         dockerfile/mongodb \
         bash -c 'mongorestore --host $MONGODB_PORT_27017_TCP_ADDR /dump'
```

### Camomile REST API

```
$ export CMML_MEDIA=/path/to/media/files
$ docker run -d -P \
         -v $CMML_MEDIA:/media \
         -e ROOT_PASSWORD=R00t.p455w0rd \
         --link my_mongodb:mongodb \
         --name camomile camomile/api
$ echo "Camomile server is now available at `docker port camomile 3000`"
```

#### Docker automated build

Thanks to Docker automated build, Docker image`camomile/api` is always in track with latest version in branch `master`.

You can however build your own Docker image using
```
$ git clone git@github.com:camomile-project/camomile-server.git
$ cd camomile-server
$ docker build -t camomile/api . 
```
