#  We are using the alpine distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:16.14-alpine

RUN apk add --no-cache cmake make gcc g++ python3
# insall dependencies to run cmake
RUN apk add --no-cache libstdc++ libgcc curl

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY . /dist

# Install dependencies for the monorepo using yarn
RUN yarn install

# Set the working directory to "monorepo/packages/node"
WORKDIR /dist/packages/node

# Install dependencies for the node using yarn
RUN yarn install

# Print package.json version
RUN echo "Version: $(head ../lib/package.json)"


EXPOSE 1031
# Define the command to run when the container starts
CMD ["yarn", "start"]
