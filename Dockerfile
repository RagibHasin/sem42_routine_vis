# syntax=docker/dockerfile:1

# FROM clux/muslrust:latest AS builder-back
# COPY src src
# COPY Cargo.toml Cargo.toml
# COPY Cargo.lock Cargo.lock
# RUN cargo build --release

# FROM node:current-alpine AS builder-front
# COPY frontend .
# RUN npm run build

# COPY --from=builder-back ./target/release/sem41_routine_vis sem41_routine_vis
# COPY --from=builder-front ./public public

FROM alpine:latest

COPY target/x86_64-unknown-linux-musl/release/sem41_routine_vis sem41_routine_vis
COPY public public

EXPOSE 3000

CMD ["./sem41_routine_vis"]