COMPOSE=docker compose -f docker-compose.yaml
SERVICE=api

# --- core ---
up:
	$(COMPOSE) up

down:
	$(COMPOSE) down

build:
	$(COMPOSE) build

logs:
	$(COMPOSE) logs -f

# --- exec ---
sh:
	$(COMPOSE) exec $(SERVICE) sh

# --- npm ---
install:
	$(COMPOSE) exec $(SERVICE) npm install $(pkg)

add:
	$(COMPOSE) exec $(SERVICE) npm install $(pkg)

remove:
	$(COMPOSE) exec $(SERVICE) npm remove $(pkg)

# --- roles ---
api:
	$(COMPOSE) exec $(SERVICE) npm run start:dev:api

worker:
	$(COMPOSE) exec $(SERVICE) npm run start:dev:worker

scheduler:
	$(COMPOSE) exec $(SERVICE) npm run start:dev:scheduler

# --- dev helpers ---
api:
	$(COMPOSE) exec api sh

migrate:
	$(COMPOSE) exec api npm run migration:run

migration-generate:
	$(COMPOSE) exec api npm run migration:generate

migration-revert:
	$(COMPOSE) exec api npm run migration:revert