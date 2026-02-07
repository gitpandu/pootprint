# Pootprint - Deployment Guide

This guide will help you deploy the Pootprint application on your self-hosted server using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

### 1. Build and Start the Containers

```bash
docker compose up -d --build
```

This command will:
- Build the backend and frontend Docker images
- Start both containers in detached mode
- Mount the `./data` directory for the SQLite database

### 2. Access the Application

- **Frontend**: Open your browser and navigate to `http://localhost:8080` (or `http://your-server-ip:8080`)
- **Backend API**: Available at `http://localhost:3000/api` (or `http://your-server-ip:3000/api`)

## Port and API Configuration

The application uses the following default ports:

- **Frontend**: `8080`
- **Backend**: `3000`

To change ports, edit the `docker-compose.yml` file:

```yaml
services:
  backend:
    ports:
      - "3000:3000"
  
  frontend:
    ports:
      - "8080:80"
```

The frontend is configured to proxy requests starting with `/api` to the backend service. No manual `VITE_API_URL` configuration is needed for standard deployments.

## Managing the Application

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Stop the Application

```bash
docker compose down
```

### Restart the Application

```bash
docker compose restart
```

### Rebuild After Code Changes

```bash
docker compose up -d --build
```

## Data Persistence

The SQLite database is stored in a Docker volume named `pootprint-data`. This ensures your data persists even when containers are stopped or removed.

### Backup Your Data

To backup your database, copy the `pootprint.db` file from the running container:

```bash
docker cp pootprint-backend:/app/data/pootprint.db ./backup-pootprint.db
```

### Restore Data

1. Stop the application: `docker compose down`
2. Start only the volume/service: `docker compose up -d backend`
3. Copy your backup into the container: `docker cp ./backup-pootprint.db pootprint-backend:/app/data/pootprint.db`
4. Restart the backend: `docker compose restart backend`

## Troubleshooting

### Frontend can't connect to backend

1. Check if both containers are running:
   ```bash
   docker compose ps
   ```

2. Verify the `VITE_API_URL` build argument in your `docker-compose.yml` file or environment.

3. Check backend logs:
   ```bash
   docker compose logs backend
   ```

### Port already in use

If ports 8080 or 3001 are already in use:

1. Edit `docker-compose.yml` to use different ports
2. Rebuild: `docker compose up -d --build`

## Security Considerations

**Important**: This application currently has no built-in authentication. Anyone who can access the ports can view and modify your data.

Recommended security measures:

1. **Reverse Proxy**: Use a reverse proxy (like Nginx Proxy Manager, Caddy, or Traefik) with its own authentication layer (OIDC, Basic Auth, etc.).
2. **VPN**: Access the application through a VPN (like Tailscale or Wireguard) and do not expose ports to the public internet.
3. **Firewall**: Use `ufw` or similar to restrict access to the ports.

## Updating the Application

To update to a new version:

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build
```

## Uninstalling

To completely remove the application and its data:

```bash
# Stop and remove containers and networks
docker compose down

# Remove data volume (WARNING: This deletes all your logged entries!)
docker volume rm pootprint_pootprint-data

# Remove images
docker rmi pootprint-frontend pootprint-backend
```

## Support

For issues or questions, check the logs first:

```bash
docker compose logs -f
```
