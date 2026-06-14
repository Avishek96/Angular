FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/dist/production-app ./dist/production-app
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

USER node
EXPOSE 4000
CMD ["node", "dist/production-app/server/server.mjs"]
