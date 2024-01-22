# -- BUILDER BASE STAGE ------------------------

FROM node:12.22-alpine AS builder-base

# Install OS libs necessary by some packages during `npm i` (e.g.: node-canvas)
RUN apk add --update --no-cache \
  git \
  make \
  g++ \
  jpeg-dev \
  cairo-dev \
  giflib-dev \
  pango-dev

# -- DEVELOPMENT RUNTIME STAGE -----------------

FROM builder-base as development

ARG APPLICATION_PATH=applications/suite/ui
ENV APPLICATION_PATH=$APPLICATION_PATH
ENV CHOKIDAR_USEPOLLING=true

WORKDIR /src

CMD npm install && npm run dev -- --port $PORT

# -- BASE STAGE --------------------------------

FROM builder-base AS base

ARG APPLICATION_PATH=applications/suite/ui

WORKDIR /src

COPY ./$APPLICATION_PATH/package*.json /src/

RUN npm install

# -- PRODUCTION BUILD STAGE ------------------------
FROM base AS production-build

ARG APPLICATION_PATH=applications/suite/ui

WORKDIR /src

# Build the project and then dispose files not necessary to run the project
# This will make the runtime image as small as possible
COPY ./$APPLICATION_PATH/ /src/

RUN npx next telemetry disable > /dev/null
RUN npm run build
RUN npm prune --production --no-audit
RUN rm -rf .next/cache

# -- PRODUCTION RUNTIME STAGE --------------------------------
FROM node:12.22-alpine AS production

ARG APPLICATION_PATH=applications/suite/ui

WORKDIR /usr/app

COPY --from=production-build /src/package.json /usr/app/package.json
COPY --from=production-build /src/node_modules /usr/app/node_modules
COPY --from=production-build /src/next.config.js /usr/app/next.config.js
COPY --from=production-build /src/public /usr/app/public
COPY --from=production-build /src/.next /usr/app/.next

# @TODO: needs to be configured to run via node directly for production
CMD npm start -- -p $PORT
