# Camomile Annotation REST API

## Heroku setup

1. Follow [Heroku quickstart guide](https://devcenter.heroku.com/articles/quickstart)
2. Deploy camomile-server:

```bash
$ git clone https://github.com/camomile-project/camomile-server.git  
$ cd camomile-server  
$ heroku create  
$ heroku addons:add mongolab  
$ git push heroku master
``` 

## Local setup

1. Install requirements
    - node.js and npm
    - mongodb  

2. Get source code and install node modules:

```bash
$ git clone https://github.com/camomile-project/camomile-server.git  
$ cd camomile-server  
$ npm install  
```

3. Run:

```bash
$ mongod 
$ node app.js  
```
