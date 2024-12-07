# We are using the alpine distribution with Node.js 20 (LTS).
FROM node:20-alpine

# install dependencies to run cmake
RUN apk add --no-cache cmake make git gcc g++ python3 libstdc++ libgcc curl bash ninja zeromq zeromq-dev zip unzip

# Install node-gyp and node-gyp-build globally to avoid issues during build
RUN npm install -g node-gyp node-gyp-build

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY . /dist

# Remove the existing node_modules directory
RUN rm -rf node_modules

# Set VCPKG_FORCE_SYSTEM_BINARIES to avoid vcpkg errors
ENV VCPKG_FORCE_SYSTEM_BINARIES=1

# Install dependencies
RUN npm install --build-from-source

# Ensure that the necessary binaries are in the PATH
ENV PATH="/dist/node_modules/.bin:${PATH}"

# Set the working directory to "monorepo/packages/node"
WORKDIR packages/node

# Expose the necessary port
EXPOSE 1031

# Define the command to run when the container starts
CMD ["npm", "start"]
