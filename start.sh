#!/usr/bin/env bash

set -a; source .env; set +a

docker compose -f"./dockers/run-app.yaml" up -d
