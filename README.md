# Camomile REST API

## Installation

The easiest way to setup a Camomile REST API is to use `docker` and `docker-compose`.  
This was tested with `docker 1.10.2` and `docker-compose 0.6`.

**Warning:** `MongoDB` does not work well with `docker` on Mac OS X.

```bash
# persistent storage for MongoDB
$ export CMML_DB=/where/to/store/mongodb/files

# directory (on host) where CAMOMILE should dump its logs
$ export CMML_LOGS=/where/to/store/camomile/logs

# directory (on host) where media files are stored
$ export CMML_MEDIA=/where/media/are/stored

# port (on host) where CAMOMILE REST API is reachable
$ export CMML_PORT=3000

# CAMOMILE root password
$ export CMML_PASSWORD=roO7p4s5wOrD

$ git clone https://github.com/camomile-project/camomile-server.git
$ cd camomiler-server
$ docker-compose up -d
```

Now, you should be able to connect to the CAMOMILE server using the Python client:

```python
$ pip install camomile
$ python
>>> from camomile import Camomile
>>> client = Camomile("http://localhost:3000")
>>> client.login("root", password="roO7p4s5wOrD")
{u'success': u'Authentication succeeded.'}
```

#### Docker automated build

Thanks to Docker automated build, Docker image`camomile/api` is always in track with latest version in branch `master`.

You can however build your own Docker image using
```
$ git clone git@github.com:camomile-project/camomile-server.git
$ cd camomile-server
$ docker build -t camomile/api .
```


## FAQ

**Warning:** this section is not up to date.

### How can I dump the database for backup?

```
$ export CMML_DUMP=/where/to/dump
$ docker run -i -t --rm \
         --link db:mongo \
         -v $CMML_DUMP:/dump \
         mongo \
         bash -c 'mongodump --host $MONGO_PORT_27017_TCP_ADDR -o /dump'
```

### How can I restore previous backup?

```
$ docker run -i -t --rm \
         --link db:mongo \
         -v $CMML_DUMP:/dump \
         mongo \
         bash -c 'mongorestore --host $MONGO_PORT_27017_TCP_ADDR /dump'
```
