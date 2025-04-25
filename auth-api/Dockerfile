# Stage 1: Build
FROM golang:1.18 AS builder
WORKDIR /app

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o auth-api

# Stage 2: Slim image
FROM alpine:latest
WORKDIR /root/

COPY --from=builder /app/auth-api .

RUN chmod +x auth-api

EXPOSE 8083
CMD ["./auth-api"]