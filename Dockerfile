#  We are using the latest Node.js distribution with Long Term Support (LTS) as of 11/04/2020.
FROM node:16.14

# Set the working directory inside the container
WORKDIR /home/monorepo

# Copy the entire contents of the host's "monorepo" directory into the container's /home/monorepo directory
COPY . /home/monorepo

# Install dependencies for the monorepo using yarn
RUN yarn install --cwd /home/monorepo

# Set the working directory to "monorepo/packages/node"
WORKDIR /home/monorepo/packages/node

# Run lerna bootstrap
RUN npx lerna bootstrap

EXPOSE 3000
# Define the command to run when the container starts
CMD ["yarn", "start"]
