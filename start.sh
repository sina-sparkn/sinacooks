#!/usr/bin/env bash
set -e

# ==============================================================================
# TasteCraft Recipe Site - Automated Startup Script
# Starts the Database, Strapi CMS, NestJS Backend, and React Frontend step-by-step
# ==============================================================================

# ANSI Colors
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

echo -e "\n${BOLD}${CYAN}================================================================${NC}"
echo -e "${BOLD}${CYAN}   TasteCraft Stack: Automated Step-by-Step Startup             ${NC}"
echo -e "${BOLD}${CYAN}================================================================${NC}\n"

# Process IDs
CMS_PID=""
BACKEND_PID=""
FRONTEND_PID=""

# Graceful cleanup on Ctrl+C or termination
cleanup() {
  echo -e "\n\n${YELLOW}Shutting down application processes...${NC}"
  [ -n "$FRONTEND_PID" ] && (kill -- -"$FRONTEND_PID" 2>/dev/null || kill "$FRONTEND_PID" 2>/dev/null || true)
  [ -n "$BACKEND_PID" ] && (kill -- -"$BACKEND_PID" 2>/dev/null || kill "$BACKEND_PID" 2>/dev/null || true)
  [ -n "$CMS_PID" ] && (kill -- -"$CMS_PID" 2>/dev/null || kill "$CMS_PID" 2>/dev/null || true)
  fuser -k 5173/tcp 2>/dev/null || true
  fuser -k 3000/tcp 2>/dev/null || true
  fuser -k 1337/tcp 2>/dev/null || true
  echo -e "${GREEN}[OK] All dev servers stopped cleanly.${NC}"
  echo -e "${BLUE}Note: Database container is still running in background.${NC}"
  echo -e "${BLUE}Run 'docker compose stop' or 'docker stop recipe_postgres' to stop it.${NC}\n"
  exit 0
}

trap cleanup SIGINT SIGTERM

# ------------------------------------------------------------------------------
# Step 0: Ensure Environment Files
# ------------------------------------------------------------------------------
echo -e "${BOLD}[0/4] Checking environment configurations...${NC}"
[ ! -f ".env" ] && [ -f ".env.example" ] && cp .env.example .env && echo -e "  ${GREEN}Created root .env${NC}"
[ ! -f "cms/.env" ] && [ -f "cms/.env.example" ] && cp cms/.env.example cms/.env && echo -e "  ${GREEN}Created cms/.env${NC}"
[ ! -f "backend/.env" ] && [ -f "backend/.env.example" ] && cp backend/.env.example backend/.env && echo -e "  ${GREEN}Created backend/.env${NC}"
[ ! -f "frontend/.env" ] && [ -f "frontend/.env.example" ] && cp frontend/.env.example frontend/.env && echo -e "  ${GREEN}Created frontend/.env${NC}"
echo -e "  ${GREEN}[OK] Environment files ready.${NC}\n"

# ------------------------------------------------------------------------------
# Step 1: Start PostgreSQL Database
# ------------------------------------------------------------------------------
echo -e "${BOLD}[1/4] Starting PostgreSQL 18 Database...${NC}"

is_port_open() {
  local port=$1
  timeout 1 bash -c "echo > /dev/tcp/127.0.0.1/$port" 2>/dev/null
}

if is_port_open 5432; then
  echo -e "  ${GREEN}[OK] PostgreSQL is already running and reachable on port 5432.${NC}"
else
  # Check if docker daemon is reachable
  docker_err=$(docker info 2>&1 >/dev/null || true)
  if echo "$docker_err" | grep -qi "permission denied"; then
    echo -e "  ${RED}[FAIL] Permission denied connecting to Docker daemon.${NC}"
    echo -e "  ${YELLOW}Your user does not have permission to access /var/run/docker.sock.${NC}"
    echo -e "  Run the following to add your user to the docker group:${NC}"
    echo -e "    ${BOLD}sudo usermod -aG docker \$USER && newgrp docker${NC}"
    echo -e "  Then rerun ${BOLD}./start.sh${NC}."
    exit 1
  elif [ -n "$docker_err" ]; then
    echo -e "  ${YELLOW}Docker daemon is not running. Attempting to start docker service...${NC}"
    if command -v systemctl >/dev/null 2>&1; then
      sudo systemctl start docker || true
    fi
    sleep 2
  fi

  if ! docker info >/dev/null 2>&1; then
    echo -e "  ${RED}[FAIL] Could not connect to Docker daemon.${NC}"
    echo -e "  ${YELLOW}Please start Docker with:${NC}"
    echo -e "    ${BOLD}sudo systemctl start docker${NC}"
    echo -e "  ${YELLOW}And make sure your user has permissions:${NC}"
    echo -e "    ${BOLD}sudo usermod -aG docker \$USER${NC}"
    exit 1
  fi

  # Launch Postgres with compose or direct container
  if docker compose version >/dev/null 2>&1; then
    echo -e "  ${CYAN}Starting with docker compose...${NC}"
    docker compose up -d
  elif command -v docker-compose >/dev/null 2>&1; then
    echo -e "  ${CYAN}Starting with docker-compose...${NC}"
    docker-compose up -d
  else
    echo -e "  ${CYAN}Starting postgres container directly with docker run...${NC}"
    # Check if container already exists
    if [ "$(docker ps -aq -f name=^recipe_postgres$)" ]; then
      docker start recipe_postgres >/dev/null
    else
      docker run -d --name recipe_postgres \
        --restart unless-stopped \
        -p 5432:5432 \
        -e POSTGRES_DB=app \
        -e POSTGRES_USER=recipes \
        -e POSTGRES_PASSWORD=change-me \
        -v pgdata:/var/lib/postgresql \
        postgres:18-alpine >/dev/null
    fi
  fi

  # Wait for Postgres to be ready
  echo -ne "  Waiting for PostgreSQL to be ready"
  retries=30
  while ! is_port_open 5432; do
    echo -ne "."
    sleep 1
    retries=$((retries - 1))
    if [ $retries -le 0 ]; then
      echo -e "\n  ${RED}[FAIL] Timed out waiting for PostgreSQL on port 5432.${NC}"
      exit 1
    fi
  done
  echo -e "\n  ${GREEN}[OK] PostgreSQL is accepting connections on port 5432.${NC}"
fi

# Ensure databases cms and app_test exist
if command -v docker >/dev/null 2>&1; then
  docker exec recipe_postgres psql -U recipes -d postgres -c "CREATE DATABASE cms;" 2>/dev/null || \
  docker exec recipe_postgres psql -U recipes -d app -c "CREATE DATABASE cms;" 2>/dev/null || true
  docker exec recipe_postgres psql -U recipes -d postgres -c "CREATE DATABASE app_test;" 2>/dev/null || \
  docker exec recipe_postgres psql -U recipes -d app -c "CREATE DATABASE app_test;" 2>/dev/null || true
fi
node -e '
  const { Client } = require("./backend/node_modules/pg");
  const client = new Client({ connectionString: "postgresql://recipes:change-me@localhost:5432/postgres" });
  client.connect().then(async () => {
    for (const db of ["cms", "app_test"]) {
      await client.query(`CREATE DATABASE ${db};`).catch(() => {});
    }
    await client.end();
  }).catch(() => {});
' 2>/dev/null || true
echo -e "  ${GREEN}[OK] Application databases (app, cms, app_test) verified.${NC}\n"

# ------------------------------------------------------------------------------
# Step 2: Start Strapi CMS
# ------------------------------------------------------------------------------
echo -e "${BOLD}[2/4] Starting Strapi CMS (:1337)...${NC}"
if is_port_open 1337; then
  echo -e "  ${GREEN}[OK] Strapi CMS is already running on port 1337.${NC}"
else
  # Start CMS dev server in background
  npm --prefix cms run develop > /tmp/recipe_cms.log 2>&1 &
  CMS_PID=$!

  echo -ne "  Booting Strapi CMS"
  retries=45
  cms_ready=0
  while [ $retries -gt 0 ]; do
    if curl -s http://localhost:1337 >/dev/null 2>&1 || is_port_open 1337; then
      cms_ready=1
      break
    fi
    echo -ne "."
    sleep 1
    retries=$((retries - 1))
  done

  if [ $cms_ready -eq 1 ]; then
    echo -e "\n  ${GREEN}[OK] Strapi CMS is up and responsive on http://localhost:1337${NC}"
    echo -e "    ${BLUE}Admin Panel: http://localhost:1337/admin${NC}"
  else
    echo -e "\n  ${YELLOW}[WARN] Strapi CMS did not report ready in time.${NC}"
    echo -e "  ${YELLOW}Recent CMS logs (/tmp/recipe_cms.log):${NC}"
    tail -n 12 /tmp/recipe_cms.log 2>/dev/null || true
  fi
fi
echo ""

# ------------------------------------------------------------------------------
# Step 3: Start NestJS Backend API
# ------------------------------------------------------------------------------
echo -e "${BOLD}[3/4] Starting NestJS API (:3000)...${NC}"
if is_port_open 3000; then
  echo -e "  ${GREEN}[OK] NestJS API is already running on port 3000.${NC}"
else
  # Run prisma generate if needed
  if [ ! -d "backend/src/generated/prisma" ]; then
    echo -e "  ${CYAN}Generating Prisma Client...${NC}"
    npm --prefix backend exec prisma -- generate --schema=backend/prisma/schema.prisma >/dev/null 2>&1 || true
  fi

  # Sync database schema
  echo -e "  ${CYAN}Syncing database schema (Prisma db push)...${NC}"
  (cd backend && npx prisma db push --skip-generate >/dev/null 2>&1 || true)

  # Start backend in background
  npm --prefix backend run start:dev > /tmp/recipe_backend.log 2>&1 &
  BACKEND_PID=$!

  echo -ne "  Booting NestJS API"
  retries=30
  backend_ready=0
  while [ $retries -gt 0 ]; do
    if curl -s http://localhost:3000/api/health >/dev/null 2>&1 || is_port_open 3000; then
      backend_ready=1
      break
    fi
    echo -ne "."
    sleep 1
    retries=$((retries - 1))
  done

  if [ $backend_ready -eq 1 ]; then
    echo -e "\n  ${GREEN}[OK] NestJS API is up and responsive on http://localhost:3000/api${NC}"
    echo -e "    ${BLUE}Swagger Documentation: http://localhost:3000/docs${NC}"
  else
    echo -e "\n  ${YELLOW}[WARN] NestJS did not report ready in time.${NC}"
    echo -e "  ${YELLOW}Recent Backend logs (/tmp/recipe_backend.log):${NC}"
    tail -n 12 /tmp/recipe_backend.log 2>/dev/null || true
  fi
fi
echo ""

# ------------------------------------------------------------------------------
# Step 4: Start React Frontend (:5173)
# ------------------------------------------------------------------------------
echo -e "${BOLD}[4/4] Starting React Frontend (:5173)...${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "${BOLD}${GREEN}   All services initialized!                                    ${NC}"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "  ${BOLD}Database:${NC}  PostgreSQL 18 on localhost:5432"
echo -e "  ${BOLD}CMS:${NC}       http://localhost:1337 (Admin: http://localhost:1337/admin)"
echo -e "  ${BOLD}API:${NC}       http://localhost:3000/api (Docs: http://localhost:3000/docs)"
echo -e "  ${BOLD}Frontend:${NC}  http://localhost:5173"
echo -e "${BOLD}${GREEN}================================================================${NC}"
echo -e "${YELLOW}Press Ctrl+C at any time to shut down all processes cleanly.${NC}\n"

# Run Frontend and wait so Ctrl+C cleanly stops all services via trap
npm --prefix frontend run dev &
FRONTEND_PID=$!
wait "$FRONTEND_PID"
