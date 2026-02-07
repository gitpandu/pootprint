# Pootprint

A minimal, self-hosted health tracker for monitoring bowel movements. Track your digestive health with ease and privacy.

## Features

- **Quick Logging**: Record date, time, consistency, and amount in seconds.
- **Visual Analytics**: Interactive charts to track frequency and patterns over time.
- **Detailed Tracking**: Add notes for each entry to monitor diet or symptoms.
- **Multi-language**: Support for English and Bahasa Indonesia.
- **Privacy First**: Self-hosted solution where you own your data.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express + Better-SQLite3
- **Visualization**: Recharts
- **Icons**: Lucide React

## Quick Start

### Prerequisites

- Docker & Docker Compose

### Deploy

1. Clone the repo:
   ```bash
   git clone https://github.com/gitpandu/pootprint.git
   cd pootprint
   ```

2. Run:
   ```bash
   docker compose up -d --build
   ```

3. Open `http://localhost:8080`

## Ports

| Service  | Port |
|----------|------|
| Frontend | 8080 |
| Backend  | 3000 |

## Configuration

Edit `docker-compose.yml` to change ports or other settings.

The frontend is configured to proxy API requests to the backend, so manual API URL configuration is generally not needed.

## License

MIT
