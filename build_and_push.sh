#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' 

set -a; source .env; set +a

function login_success {
     printf "${GREEN}[ Docker login was completed succesfully ]${NC}\n"
}
function login_fail {
    printf "${RED}[ Docker login has failed ]${NC}\n"
    printf "Make sure .env file has variables DOCKERHUB_USERNAME and DOCKERHUB_TOKEN set up properly\n"
    exit 1
}

echo "${DOCKERHUB_TOKEN}" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin && login_success || login_fail

function build_success {
    printf "${GREEN}[ Docker build has succeded ]${NC}\n"
}

function build_fail {
    printf "${RED}[ Docker build has failed ]${NC}\n"
    printf "Check the output above to find the problem\n"
    exit 0
}

docker compose build && build_success || build_fail

function push_success {
        printf "${GREEN}[ Docker push has succeded ]${NC}\n"
}

function push_fail {

        printf "${RED}[ Docker push has failed ]${NC}\n"
        printf "Check the output above to find the problem\n"
        exit 0
}

docker compose push && push_success || push_fail

