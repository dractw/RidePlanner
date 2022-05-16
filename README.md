# RidePlanner
Telegram bot for planning rides

_Under active development_

## Build
- Create `.env` file with required variables ([example](https://github.com/dractw/RidePlanner/blob/main/.env.example))

- Run `npm i`

## Run
- Dev `npm run dev`
- Prod `npm start` 

## Deploy
- Create `.env` file with required variables ([example](https://github.com/dractw/RidePlanner/blob/main/.env.example))

- Run `docker-compose up -d`

## Limitations

#### Mongodb persistent data volume with docker
To ensure that data wont be wiped out after recreating docker container, be aware to grant read/write permissions for MongoDB wich will deal with `DB_VOLUME` path.

eg. with `DB_VOLUME=/opt/app/mongo_volume`
```
chown -R 1001 /opt/app/mongo_volume
```

#### Timezone
Make sure you set up system time-zone for your local region before running this in production

Debian example: 
```
timedatectl set-timezone Europe/Moscow
```
