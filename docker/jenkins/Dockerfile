# MossCart CI controller: Jenkins LTS + Docker CLI + Compose v2 + common Pipeline plugins
FROM jenkins/jenkins:lts-jdk17

USER root

ARG DOCKER_VERSION=27.3.1
ARG COMPOSE_VERSION=2.29.7

RUN apt-get update \
  && apt-get install -y --no-install-recommends curl ca-certificates git \
  && curl -fsSL "https://download.docker.com/linux/static/stable/x86_64/docker-${DOCKER_VERSION}.tgz" \
    | tar xz --strip 1 -C /usr/local/bin docker/docker \
  && mkdir -p /usr/local/lib/docker/cli-plugins \
  && curl -fsSL "https://github.com/docker/compose/releases/download/v${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose \
  && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose \
  && rm -rf /var/lib/apt/lists/*

# Plugins file lives next to this Dockerfile; build context must be repo root (see docker-compose)
COPY docker/jenkins/plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN chown jenkins:jenkins /usr/share/jenkins/ref/plugins.txt

USER jenkins

RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
