#  We are using the latest Node.js distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:16.14

# Create app directory
WORKDIR /monorepo

COPY package.json /.

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Includes source
COPY . .

RUN npx lerna bootstrap

EXPOSE 3000
CMD [ "yarn", "start" ]
