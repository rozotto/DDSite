FROM  python:3.8.13-bullseye

ENV PYTHONUNBUFFERED=1

WORKDIR /backend

COPY . . 

RUN pip install --upgrade pip
RUN pip install -r ./requirements.txt -v

EXPOSE 8000

