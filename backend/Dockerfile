# Stage 1: install dependencies into an isolated prefix so the final image
# carries no build toolchain (compilers, pip cache, etc.)
FROM python:3.11-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: lean production image
FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /install /usr/local
COPY ./app ./app
COPY alembic.ini ./alembic.ini
COPY ./alembic ./alembic
COPY start.sh ./start.sh
RUN chmod +x start.sh
EXPOSE 8000
CMD ["./start.sh"]
