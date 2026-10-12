FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY scripts ./scripts

RUN npm run typecheck

RUN mkdir -p /app/data && chown -R node:node /app

ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/support.db
ENV PORT=3000

VOLUME ["/app/data"]
EXPOSE 3000

USER node
CMD ["npm", "start"]