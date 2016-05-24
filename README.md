# Camomile REST API

## Deployment

The easiest way to setup a Camomile REST API is to use `docker` and `docker-compose`.  
This was tested with `docker 1.11.1` and `docker-compose 1.6.0`.

```shell
# Download docker-compose configuration file
$ wget https://raw.githubusercontent.com/camomile-project/camomile-server/master/docker-compose.yml

# Set path to MongoDB data directory
$ export CMML_DB=/where/to/store/mongodb/files

# Set path to CAMOMILE logging directory
$ export CMML_LOGS=/where/to/store/camomile/logs

# Set path to CAMOMILE media directory
$ export CMML_MEDIA=/where/media/are/stored

# Set path to CAMOMILE file metadata directory
$ export CMML_UPLOAD=/where/to/store/upload

# Set CAMOMILE port
$ export CMML_PORT=3000

# Set CAMOMILE root password
$ export CMML_PASSWORD=roO7p4s5wOrD

# Run MongoDB and CAMOMILE REST API
$ docker-compose up -d
```

### CAMOMILE client

Now, you should be able to connect to the CAMOMILE server using the Python client:

```shell
# Install Python CAMOMILE client
$ pip install camomile
$ python
```
```python
>>> from camomile import Camomile
>>> client = Camomile("http://localhost:3000")
>>> client.login("root", password="roO7p4s5wOrD")
{u'success': u'Authentication succeeded.'}
```

### Docker automated build

Thanks to Docker automated build, Docker image`camomile/api` is always in track with latest version in branch `master`.

You can however build your own Docker image using
```
$ git clone git@github.com:camomile-project/camomile-server.git
$ cd camomile-server
$ docker build -t camomile/api .
```

## Development

```shell
# Pull CAMOMILE source code from Github repository
$ git clone git@github.com:camomile-project/camomile-server.git && \
  cd camomile-server && git checkout develop

# Run MongoDB and CAMOMILE REST API (set CMML_* variables if needed)
$ docker-compose -f docker-compose.dev.yml up

# Edit CAMOMILE source code and your changes will be reflected automatically
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
