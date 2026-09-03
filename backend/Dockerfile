FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm prune --production

FROM node:18-alpine
WORKDIR /app
# Run as non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /app /app
USER appuser
EXPOSE 5000
CMD ["npm", "start"]
