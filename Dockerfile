FROM rocker/drd

## This handle reaches Me
MAINTAINER "Prateek Baranwal" prateek.baranwal@gmail.com

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
  libapparmor1 \
  libedit2 \
  libssl1.0.0 \
  libssl-dev \
  sudo \
  curl


## A default user system configuration. For historical reasons,
## we want user to be 'rcloud', but it is 'docker' in r-base
RUN usermod -l rcloud docker \
  && usermod -m -d /home/rcloud rcloud \
  && groupmod -n rcloud docker \
  && echo '"\e[5~": history-search-backward' >> /etc/inputrc \
  && echo '"\e[6~": history-search-backward' >> /etc/inputrc \
  && echo "rcloud:rcloud" | chpasswd


RUN mkdir -p /data/rcloud
RUN mkdir -p /data/rcloud/data/gists
RUN chmod -R a+rwx /data/rcloud/data

ADD . /data/rcloud
RUN cd /data/rcloud && git apply docker/domainCookie.patch
RUN cd /data/rcloud \
      && scripts/bootstrapR.sh \
      && scripts/build.sh --all

COPY docker/rcloud.conf /data/rcloud/conf
COPY docker/init.sh /bin
COPY docker/index.html /data/rcloud/htdocs
COPY docker/sks.R /data/rcloud/htdocs

RUN chown -R rcloud:rcloud /data/rcloud

EXPOSE 8080

WORKDIR /data/rcloud
ENTRYPOINT /bin/init.sh