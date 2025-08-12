# Use Node LTS
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first (for caching)
COPY package*.json ./

# Install dependencies without audit and fund prompts
RUN npm ci --no-audit --prefer-offline && npm cache clean --force

# Install TypeScript globally (fixes tsc permission issues in Railway)
RUN npm install -g typescript

# Fix permissions for binaries in node_modules/.bin
RUN chmod +x /app/node_modules/.bin/* || true

# Copy the rest of the backend source code
COPY . .

# Build
RUN npm run build

# Expose port and start server
EXPOSE 3000
CMD ["npm", "start"]
