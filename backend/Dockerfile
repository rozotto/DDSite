FROM  python:3.8.13-bullseye

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

RUN pip install django django-cors-headers

COPY . . 

EXPOSE 8000

