#  We are using the latest Node.js distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:16.14

# Set the working directory inside the container
WORKDIR /dist

# Copy the entire contents of the host's "monorepo" directory into the container's /dist directory
COPY . /dist

# Install dependencies for the monorepo using yarn
RUN yarn install --cwd /dist

# Set the working directory to "monorepo/packages/node"
WORKDIR /dist/packages/node

# Print package.json version
RUN echo "Version: $(head ../lib/package.json)"

# Run lerna bootstrap
RUN npx lerna bootstrap

EXPOSE 3000
# Define the command to run when the container starts
CMD ["yarn", "start"]
