FROM rocker/drd

## This handle reaches Me
MAINTAINER "Prateek Baranwal"

ENV DEBIAN-FRONTEND noninteractive
ENV ROOT /data/rcloud

RUN apt-get update \
  && apt-get install -y -t unstable --no-install-recommends \
  libcairo2 \
  libpng-dev \
  libboost-dev \
  libxt-dev \
  libcairo2-dev \
  libxml2-dev \
  libcurl4-openssl-dev \
  ca-certificates \
  file \
  git \
  libssl1.0.2 \
  libapparmor1 \
  libedit2 \
  libssl-dev \
  sudo \
  curl \
  python-dev \
  python-zmq \
  ipython \
  python-matplotlib




## A default user system configuration. For historical reasons,
## we want user to be 'rcloud', but it is 'docker' in r-base
RUN usermod -l rcloud docker \
  && usermod -m -d /home/rcloud rcloud \
  && groupmod -n rcloud docker \
  && echo '"\e[5~": history-search-backward' >> /etc/inputrc \
  && echo '"\e[6~": history-search-backward' >> /etc/inputrc \
  && echo "rcloud:rcloud" | chpasswd

## Create RCloud project folder

RUN mkdir -p /data/rcloud
RUN mkdir -p /data/rcloud/data/gists
RUN chmod -R a+rwx /data/rcloud/data

## Get Pandoc
RUN cd /tmp \
    && wget https://s3.amazonaws.com/rstudio-buildtools/pandoc-1.13.1.zip \
    && unzip ./pandoc-1.13.1.zip \
    && cp pandoc-1.13.1/linux/debian/x86_64/* /usr/local/bin/ \
    && rm -rf pandoc-1.13.1

ADD conf             /data/rcloud/conf
ADD htdocs           /data/rcloud/htdocs
ADD packages         /data/rcloud/packages
ADD rcloud.client    /data/rcloud/rcloud.client
ADD rcloud.packages  /data/rcloud/rcloud.packages
ADD rcloud.support   /data/rcloud/rcloud.support
ADD scripts          /data/rcloud/scripts
ADD tests            /data/rcloud/tests
ADD VERSION          /data/rcloud/VERSION
ADD package.json     /data/rcloud/package.json
ADD Gruntfile.js     /data/rcloud/Grunfile.js
ADD docker           /data/rcloud/docker


RUN cd /data/rcloud && git apply docker/domainCookie.patch
RUN cd /data/rcloud \
      && scripts/bootstrapR.sh \
      && scripts/build.sh --all

## Get rcloud extention modules
RUN cd /data/rcloud/rcloud.packages \
    && git clone https://github.com/att/rcloud.shiny.git \
    && git clone https://github.com/att/rcloud.params.git \
    && git clone https://github.com/att/rcloud.logo.git \
    && git clone https://github.com/att/rcloud.dcplot.git \
    && R -e "install.packages(c('rcloud.shiny','rpython2'),repos=c('http://rforge.net','http://r.research.att.com'))"

COPY docker/rcloud.conf /data/rcloud/conf
COPY docker/init.sh /bin
COPY docker/index.html /data/rcloud/htdocs
COPY docker/dockerbye.R /data/rcloud/htdocs

RUN chown -R rcloud:rcloud /data/rcloud

EXPOSE 8080

WORKDIR /data/rcloud
ENTRYPOINT /bin/init.sh
