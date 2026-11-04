# ---------- dependencies ----------
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# package-lock.json was generated on Windows; if it lacks the Linux builds of
# native packages (tailwind oxide, lightningcss) npm ci fails, so fall back to npm install.
RUN npm ci || npm install --no-audit --no-fund

# ---------- build ----------
FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are baked into the JS bundle at build time.
# They are URLs the *browser* calls, so they point to the host ports, not container names.
ARG NEXT_PUBLIC_CATEGORY_API_URL=http://localhost:5001
ARG NEXT_PUBLIC_ORDER_API_URL=http://localhost:5002
ARG NEXT_PUBLIC_PAYMENT_API_URL=http://localhost:5003
ARG NEXT_PUBLIC_REVIEW_API_URL=http://localhost:5004
ARG NEXT_PUBLIC_USER_API_URL=http://localhost:5005
ENV NEXT_PUBLIC_CATEGORY_API_URL=$NEXT_PUBLIC_CATEGORY_API_URL \
    NEXT_PUBLIC_ORDER_API_URL=$NEXT_PUBLIC_ORDER_API_URL \
    NEXT_PUBLIC_PAYMENT_API_URL=$NEXT_PUBLIC_PAYMENT_API_URL \
    NEXT_PUBLIC_REVIEW_API_URL=$NEXT_PUBLIC_REVIEW_API_URL \
    NEXT_PUBLIC_USER_API_URL=$NEXT_PUBLIC_USER_API_URL \
    NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
