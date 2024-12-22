#!/usr/bin/env bash

set -a; source .env; set +a

echo "${DOCKERHUB_TOKEN}" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
docker compose -f"./dockers/run-app.yaml" build
docker compose -f"./dockers/run-app.yaml" push 

