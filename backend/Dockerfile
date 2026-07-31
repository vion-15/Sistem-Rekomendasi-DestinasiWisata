# ===========================
# Stage 1
# ===========================
FROM golang:1.26-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

# ===========================
# Stage 2
# ===========================
FROM alpine:latest

WORKDIR /app

RUN apk --no-cache add ca-certificates

COPY --from=builder /app/backend .

EXPOSE 8080

CMD ["./backend"]