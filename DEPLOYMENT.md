# Pootprint - Deployment Guide

This guide will help you deploy the Pootprint application on your self-hosted server using Docker.

## Prerequisites

- Docker installed (version 20.10 or higher)
- Docker Compose installed (version 2.0 or higher)

## Quick Start

### 1. Build and Start the Container

```bash
docker compose up -d --build
```

This command will:
- Build the unified React + Express application Docker image
- Start the single container in detached mode
- Mount the SQLite database volume for data persistence

### 2. Access the Application

- **Frontend & API**: Open your browser and navigate to `http://localhost:8080` (or `http://your-server-ip:8080`)
- **Backend API Endpoints**: Available directly under `/api` on the same port (e.g., `http://localhost:8080/api/health`)

## Port and API Configuration

The application runs internally on port `3000` but is exposed on port `8080` by default. 

To change the port exposed on your server, edit the port binding in `docker-compose.yml`:

```yaml
services:
  pootprint:
    ports:
      - "8080:3000"  # Change "8080" to your preferred host port
```

Because the frontend is served directly by the Express backend, all api requests are relative and run on the same port, resolving any CORS or routing proxy complexities.

## Managing the Application

### View Logs

```bash
# All logs
docker compose logs -f
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
docker cp pootprint:/app/data/pootprint.db ./backup-pootprint.db
```

### Restore Data

1. Stop the application: `docker compose down`
2. Start only the volume/service: `docker compose up -d pootprint`
3. Copy your backup into the container: `docker cp ./backup-pootprint.db pootprint:/app/data/pootprint.db`
4. Restart the container: `docker compose restart pootprint`

## Troubleshooting

### Frontend can't connect to backend

1. Check if both containers are running:
   ```bash
   docker compose ps
   ```

2. Verify the `VITE_API_URL` build argument in your `docker-compose.yml` file or environment.

3. Check container logs:
   ```bash
   docker compose logs pootprint
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

# Remove image
docker rmi pootprint
```

## Support

For issues or questions, check the logs first:

```bash
docker compose logs -f
```
