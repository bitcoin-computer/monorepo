FROM node:16.13

WORKDIR /app

COPY package.json .
COPY package-lock.json* ./

RUN npm install --include=dev

COPY . .

# Expose the port the app runs on
EXPOSE 4000

# Command to run the application
CMD ["npm", "run", "start"]
