#  We are using the alpine distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:20-alpine

RUN apk add --no-cache cmake make gcc g++ python3
# insall dependencies to run cmake
RUN apk add --no-cache libstdc++ libgcc curl

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY . /dist

# Remove the existing node_modules directory
RUN rm -rf node_modules

# Install dependencies for the monorepo, including zeromq with --build-from-source
RUN npm install --build-from-source

# Set the working directory to "monorepo/packages/node"
WORKDIR /dist/packages/node

# Print package.json version
RUN echo "Version: $(head ../lib/package.json)"

EXPOSE 1031
# Define the command to run when the container starts
CMD ["npm", "start"]
