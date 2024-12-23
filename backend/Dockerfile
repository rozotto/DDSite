FROM  python:3.8.13-bullseye

ENV PYTHONUNBUFFERED=1

COPY . .

WORKDIR /backend

RUN pip install --upgrade pip
RUN pip install -r requirements.txt

EXPOSE 8000

