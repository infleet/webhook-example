ARG NODE_IMAGE=node:18.12.1-alpine3.16
# --------------> The base image

FROM $NODE_IMAGE AS base
RUN apk add --update-cache dumb-init
WORKDIR /usr/src/app

# --------------> The builder image

FROM base AS builder
RUN apk add --no-cache git python3 py3-pip curl libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --------------> The production dependencies image

FROM base AS production_dependecies
ENV NODE_ENV production
RUN apk add --no-cache git python3 py3-pip curl libc6-compat
COPY package*.json ./
RUN npm ci --only=production

# --------------> The production image [SHOULD BE THE LAST STAGE]

FROM base as production
ENV NODE_ENV production
ENV MY_API_TOKEN = "super-secret-token"
USER node
COPY --chown=node:node --from=production_dependecies /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=builder /usr/src/app/dist ./dist
COPY package*.json ./

EXPOSE 5001

CMD ["dumb-init", "node", "dist/index.js" ]