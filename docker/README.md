# ========================
# Launching with docker.io
# ========================

# build docker image
docker build -t hbredin/cmml-data .

# where to store MongoDB database
export DATABASE=/tmp/db

# where resources (e.g. video files) are stored
export RESOURCE=/tmp/media

# run Camomile API in container
docker run -d -t -p 3000:3000 -v $PWD:/app -v $DATABASE:/db -v $RESOURCE:/media hbredin/cmml-data
