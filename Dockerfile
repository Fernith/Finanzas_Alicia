# --- ETAPA 1: Compilar React ---
FROM node:20-slim AS frontend-builder
WORKDIR /app
# Usamos el nombre exacto de tu carpeta
COPY finanzas-frontend/package*.json ./
RUN npm install
COPY finanzas-frontend/ .
RUN npm run build

# --- ETAPA 2: Compilar Rust ---
FROM rust:latest AS backend-builder
WORKDIR /app
# Al copiar la carpeta entera, también se copia la carpeta oculta .sqlx
COPY finanzas-backend/ .
# Esta variable le dice a sqlx que lea la carpeta .sqlx en vez de conectarse a internet
ENV SQLX_OFFLINE=true
RUN cargo build --release

# --- ETAPA 3: Contenedor de Producción ---
FROM debian:bookworm-slim
WORKDIR /app

RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

# Copiamos el ejecutable y el frontend ya compilado
COPY --from=backend-builder /app/target/release/finanzas-backend /app/server
COPY --from=frontend-builder /app/dist /app/public

RUN chmod +x /app/server
CMD ["./server"]