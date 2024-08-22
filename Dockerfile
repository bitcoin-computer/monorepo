# We are using the alpine distribution with Node.js 20 (LTS).
FROM node:20-alpine

# Install dependencies to run cmake and build native modules
RUN apk add --no-cache cmake make gcc g++ python3 libstdc++ libgcc curl bash zeromq zeromq-dev

# Install node-gyp and node-gyp-build globally to avoid issues during build
RUN npm install -g node-gyp node-gyp-build

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY . /dist

# Remove the existing node_modules directory
RUN rm -rf node_modules

# Install dependencies with --build-from-source, ensuring native modules are properly built
RUN npm install --build-from-source

# Ensure that the necessary binaries are in the PATH
ENV PATH="/dist/node_modules/.bin:${PATH}"

# Set the working directory to "monorepo/packages/node"
WORKDIR /dist/packages/node

# Print package.json version
RUN echo "Version: $(head ../lib/package.json)"

# Expose the necessary port
EXPOSE 1031

# Define the command to run when the container starts
CMD ["npm", "start"]
