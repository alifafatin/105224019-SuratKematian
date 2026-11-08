FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package.json /app/package-lock.json ./
COPY --from=dependencies /app/prisma ./prisma
COPY --from=dependencies /app/prisma.config.ts ./
COPY server.js ./
COPY src ./src
USER node
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
