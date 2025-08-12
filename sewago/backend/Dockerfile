FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci --no-audit --prefer-offline && npm cache clean --force
RUN npm install -g typescript

COPY . .

RUN chmod +x /app/node_modules/.bin/* || true

RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]


