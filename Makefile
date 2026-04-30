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

# --- dev helpers ---
api:
	$(COMPOSE) exec api sh

worker:
	$(COMPOSE) exec worker sh

scheduler:
	$(COMPOSE) exec scheduler sh