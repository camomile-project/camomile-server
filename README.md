# Camomile Annotation REST API

## Docker setup

### Step 1 | Run MongoDB

```
$ export CMML_DB=/path/to/the/database
$ docker pull dockerfile/mongodb
$ docker run -d -v $CMML_DB:/data/db --name mongodb dockerfile/mongodb
```

Dumping the database (e.g. for backup) is as easy as

```
$ export CMML_DUMP=/where/to/dump
$ docker run -i -t --rm --link mongodb:mongodb -v $CMML_DUMP:/dump dockerfile/mongodb bash -c 'mongodump --host $MONGODB_PORT_27017_TCP_ADDR -o /dump'
```

### Step 2 | Run Camomile Server 

```
$ git clone git@github.com:camomile-project/camomile-server.git
$ cd camomile-server
$ docker build -t camomile/server .
$ export CMML_MEDIA=/path/to/media/files
$ docker run -d -P -v $CMML_MEDIA:/media --link mongodb:mongodb --name camomile camomile/server --password=R00t.p455w0rd
$ echo "Camomile server is now available at `docker port camomile 3000`"
```

## Heroku setup

### Step 1 | Follow [Heroku quickstart guide](https://devcenter.heroku.com/articles/quickstart)

### Step 2 | Deploy Camomile Server

```bash
$ git clone https://github.com/camomile-project/camomile-server.git  
$ cd camomile-server  
$ heroku create  
$ heroku addons:add mongolab  
$ git push heroku master
``` 

Default **root** password is **camomile**.
