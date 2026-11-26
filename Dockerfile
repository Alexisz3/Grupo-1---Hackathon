FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
ENV HOST=0.0.0.0 PORT=3000
COPY --from=build /app/dist ./dist
COPY server.js package.json ./
COPY src ./src
# Base local (SQLite) e ilustraciones: volumen «data»
RUN mkdir -p /app/data && chown node:node /app/data
ENV DATA_DIR=/app/data/
EXPOSE 3000
USER node
CMD ["node", "server.js"]
