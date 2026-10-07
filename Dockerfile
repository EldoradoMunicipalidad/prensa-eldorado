FROM node:20-alpine AS builder

ARG VITE_DIRECTUS_URL=/directus
ARG VITE_DIRECTUS_PUBLIC_FOLDER_ID

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN VITE_DIRECTUS_URL=${VITE_DIRECTUS_URL} VITE_DIRECTUS_PUBLIC_FOLDER_ID=${VITE_DIRECTUS_PUBLIC_FOLDER_ID} npm run build

FROM nginx:1.27-alpine

RUN apk add --no-cache ca-certificates

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
