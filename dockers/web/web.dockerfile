FROM node:20

COPY . .

WORKDIR /frontend

RUN npm install react user-event jest-dom axios eslint-plugin-react eslint-plugin-react-hooks globals react react-dom react-router-dom react-scripts web-vitals

EXPOSE 3000
