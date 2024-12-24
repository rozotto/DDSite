#!/usr/bin/env bash

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' 

set -a; source .env; set +a

web=0
api=0

while getopts 'fwbah' OPTION; do
    case "$OPTION" in
        w)
            web=1
            ;;
        f)
            web=1
            ;;
        a)
            api=1
            ;;
        b)
            api=1
            ;;
        h)
            echo "add flag -f or -w no turn on frontend"
            echo "add flag -b or -a to turn on backend"
            echo "If no flags provided both frontend and backend started"
            exit 1
            ;;
        ?)
            echo "add flag -f or -w no turn on frontend"
            echo "add flag -b or -a to turn on backend"
            echo "If no flags provided both frontend and backend started"
            exit 1
            ;;
    esac
done

if [[ $web == 0 ]] && [[ $api == 0 ]]; then
    web=1
    api=1
fi


if [ $web == 1 ]; then
    printf "${GREEN}[ Frontend start request recieved ]${NC}\n"
fi
if [ $api == 1 ]; then
    printf "${GREEN}[ Backend start request recieved ]${NC}\n"
fi

function run_web {
    function web_succeded {
        printf "${GREEN}[ Web docker started succesfully ]${NC}\n"
    }

    function web_failed {
        printf "${RED}[ Web docker start failed ]${NC}\n"
    }

    docker compose up web -d && web_succeded || web_failed
}


function run_api {
    function api_succeded {
        printf "${GREEN}[ Api docker started succesfully ]${NC}\n"
    }

    function api_failed {
        printf "${RED}[ Api docker start failed ]${NC}\n"
    }

    docker compose up api -d && api_succeded || api_failed
}

if [ $web == 1 ]; then
    run_web
fi
if [ $api == 1 ]; then
    run_api
fi
