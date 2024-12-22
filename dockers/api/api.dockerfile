FROM  python:3.8.13-bullseye

ENV PYTHONUNBUFFERED=1

COPY . .

WORKDIR /backend

RUN pip install --upgrade pip
RUN pip install Django djangorestframework pika psycopg2-binary Pillow django-cors-headers

EXPOSE 8000

