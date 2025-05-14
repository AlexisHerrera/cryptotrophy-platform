# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package files and install all dependencies (including dev)
COPY packages/organization-backend/package*.json ./
RUN npm ci

COPY packages/organization-backend/tsconfig.json ./
COPY packages/organization-backend/src ./src

# Build the TypeScript code
RUN npm run build

# Stage 2: Create the final production image
FROM node:20-alpine

WORKDIR /usr/src/app
COPY packages/organization-backend/package*.json ./

# Install *only* production dependencies
RUN npm ci --only=production

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]