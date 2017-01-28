conb
====

## Requirements
* docker-engine
* docker-composer

## Dependecies
* Docker
* MongoDB
* Node.js
* Node-RED
* Webpack
* Knockoutjs
* TypeScript

## Usage
```
$ cd /path/to/work

# git clone
$ git clone git@github.com:rog-works/conb.git
$ cd conb

# build docker image
$ docker-compose build

# install node packages
$ docker run --rm -v $(pwd)/nodered/app:/opt nodered-webpack:latest sh -c 'cd /opt && npm install --no-bin-links'

# initialize mongo database
$ docker run --rm nodered-db:latest mongo nodered --eval 'db.entry.ensureIndex({signature: 1})'

# create flows.json
$ echo '{}' > ./nodered/data/flows.json

# start docker container
$ docker-compose up -d 
```
