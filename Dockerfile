FROM node:24-bullseye

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .

RUN npm run build

RUN npx prisma generate --schema=src/database/prisma/schema.prisma

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
