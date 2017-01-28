#!/bin/bash

set -eux

sudo ln -sf /usr/share/zoneinfo/Asia/Tokyo /etc/localtime

if [ -f /usr/bin/docker ]; then
	sudo apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
	sudo sh -c "echo 'deb https://apt.dockerproject.org/repo ubuntu-trusty main' > /etc/apt/sources.list.d/docker.list"
	sudo apt-get update
	sudo apt-get install docker-engine --no-install-recommends
	sudo usermod -aG docker ubuntu
fi

if [ ! -f /usr/local/bin/docker-compose ]; then
	curl -L https://github.com/docker/compose/releases/download/1.7.0/docker-compose-`uname -s`-`uname -m` > ./docker-compose
	sudo mv ./docker-compose /usr/local/bin/docker-compose
	sudo chmod +x /usr/local/bin/docker-compose
fi

if [ ! -f /usr/bin/git ]; then
	sudo apt-get install git --no-install-recommends
fi