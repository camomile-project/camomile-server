# start mongoDB daemon
mongod --config /app/docker/mongodb.conf

# install app (based on package.json)
npm install /app

# start NodeJS app
node /app/appCam.js --video-path=/media --db-port=27017 --db-host=localhost --db-name=camomile --server-port=3000
