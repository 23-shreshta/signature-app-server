# Docker Deployment Guide

This guide explains how to build and run the PDF Signature application using Docker Compose.

## Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Getting Started

1.  **Clone the repository** (if you haven't already).
2.  **Ensure you are in the root directory** of the project.
3.  **Build and start the containers**:
    ```bash
    docker-compose up --build -d
    ```
    This command will:
    - Build the React frontend (production build via Nginx).
    - Build the Node.js backend.
    - Pull the MongoDB image.
    - Start all services and orchestrate them.

## Accessing the Application

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **MongoDB**: `localhost:27017`

## Common Commands

- **Stop the application**:
  ```bash
  docker-compose down
  ```
- **View logs**:
  ```bash
  docker-compose logs -f
  ```
- **Check service status**:
  ```bash
  docker-compose ps
  ```

## Troubleshooting

- **Port Conflict**: If port 3000 or 5000 is already in use, stop the existing processes or modify the `ports` section in `docker-compose.yml`.
- **Database Connection**: The server waits for the database to be ready. If you see connection errors, check the logs of the `db` service.
- **PDF Upload Errors**: Nginx is configured to handle up to 10MB files. If you need larger files, increase `client_max_body_size` in `client/nginx.conf`.
