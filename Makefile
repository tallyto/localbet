.PHONY: db dev-backend dev-frontend dev install-frontend

db:
	docker compose up -d db

dev-backend:
	cd backend && ./mvnw quarkus:dev

dev-frontend:
	cd frontend && npm run dev

dev:
	$(MAKE) db
	$(MAKE) -j2 dev-backend dev-frontend

install-frontend:
	cd frontend && npm install

test-backend:
	cd backend && ./mvnw test

build-backend:
	cd backend && ./mvnw package -DskipTests

stop:
	docker compose down
