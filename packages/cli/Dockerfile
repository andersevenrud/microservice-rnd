FROM node:16-alpine

WORKDIR /usr/src/cli
COPY . .

# Install dependencies and build
RUN npm config set update-notifier false
RUN npm ci --silent --no-audit --no-fund --production

# Removes any non-essential files
RUN npm install --silent --no-audit --no-fund -g clean-modules@2.0.4 && \
      clean-modules -y && \
      npm remove -g clean-modules
RUN npm cache clean --force

# Run a dummy process. This is never used in production because any scripts
# in this package is launched as independent jobs.
USER node
ENV NODE_ENV production
CMD tail -f /dev/null
