#!/usr/bin/env bash

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
    echo "Frontend start request recieved"
fi
if [ $api == 1 ]; then
    echo "Backend start request recieved"
fi

if [ $((web + api)) == 2 ]; then
    docker compose up -d
    echo "Frontend started succesfully"
    echo "Backend started succesfully"
elif [ $web == 1 ]; then
    docker compose up web -d
    echo "Frontend started succesfully"
elif [ $api == 1 ]; then
    docker compose up api -d
    echo "Backend started succesfully"
else
    docker compose up -d
    echo "Frontend started succesfully"
    echo "Backend started succesfully"
fi
