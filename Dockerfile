# Stage 1: Install dependencies
FROM node:22-alpine AS deps

ARG UID=1000
ARG GID=1000
RUN addgroup -g $GID appuser && adduser -u $UID -G appuser -D appuser

WORKDIR /app
RUN chown appuser:appuser /app
RUN npm install -g pnpm

COPY --chown=appuser:appuser package.json pnpm-lock.yaml ./

USER appuser
RUN pnpm install --frozen-lockfile


# Stage 2: Build
FROM node:22-alpine AS build

ARG UID=1000
ARG GID=1000
RUN addgroup -g $GID appuser && adduser -u $UID -G appuser -D appuser

WORKDIR /app
RUN chown appuser:appuser /app
RUN npm install -g pnpm

COPY --chown=appuser:appuser --from=deps /app/node_modules ./node_modules
COPY --chown=appuser:appuser . .

USER appuser
RUN pnpm run build


# Stage 3: Production runner
FROM node:22-alpine AS runner

ARG UID=1000
ARG GID=1000
RUN addgroup -g $GID appuser && adduser -u $UID -G appuser -D appuser

WORKDIR /app
ENV NODE_ENV=production

COPY --chown=appuser:appuser --from=build /app/build ./build
COPY --chown=appuser:appuser --from=build /app/package.json ./
COPY --chown=appuser:appuser --from=deps /app/node_modules ./node_modules

USER appuser
EXPOSE 3000

CMD ["node", "build"]
