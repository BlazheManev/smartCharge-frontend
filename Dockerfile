# Step 1: Build the app
FROM node:18 AS builder

WORKDIR /app
COPY package*.json ./

# Install dependencies
RUN npm ci

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
