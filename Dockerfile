#  We are using the latest Node.js distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:16.14

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY ./packages/node /dist

# Install dependencies for the monorepo using yarn
RUN yarn install

# Copy lib from host to container
COPY ./packages/lib /dist/node_modules/@bitcoin-computer/lib

#echo the package.json for debugging purposes
RUN cat /dist/node_modules/@bitcoin-computer/lib/package.json

EXPOSE 1031
# Define the command to run when the container starts
CMD ["yarn", "start"]
