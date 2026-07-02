# MD-Classes Portal — Backend

REST API for the **Margdarshan Classes** student portal. Spring Boot 3.5 + Java 17 + Postgres 16 + JWT auth.

## What's in this pass

- **Auth module** end-to-end: register, login, refresh, logout, forgot/reset stubs.
- **Student module** with role-aware CRUD (ADMIN, TEACHER, STUDENT visibility rules).
- **Spring Security** with stateless JWT (HS256, com.auth0:java-jwt), `@PreAuthorize`, BCrypt(12) password hashing.
- **JPA + Flyway** on Postgres 16.
- **Global error handling** (`@RestControllerAdvice` → uniform `ApiError` body).
- **Bean validation** on every request DTO.
- **OpenAPI 3** docs at `/swagger-ui.html` with bearer-auth button.
- **Tests:** unit (`JwtServiceTest`) + a full register → login → CRUD integration test against **Testcontainers Postgres**.
- **Docker** multi-stage build + `docker-compose.yml` for one-shot local up.

See `documents/apidesign.md` for the full target API across all 14 modules — this commit ships the foundation + Auth + Students; the other 12 modules are scaffolded into the same pattern.

## Prerequisites

- Docker and Docker Compose (installed and running)
- JDK 17 (Optional, only needed if running tests or building outside Docker)

## Quick start

```sh
# 1. Configuration
cp .env.example .env
# Edit .env: set MD_JWT_SECRET to something 32+ chars (e.g. `openssl rand -base64 48`)
# (A default dev key is pre-configured in the repository for quick start)

# 2. Boot the app and database via Docker Compose (Flyway applies V1 on first run)
docker compose up --build

# 3. Sanity check
curl -s localhost:8080/world           # → hello world
# Open OpenAPI UI in browser:
# http://localhost:8080/swagger-ui.html
```

### Useful Docker Compose commands

- **Start in background (detached mode):**
  ```sh
  docker compose up --build -d
  ```
- **Stop and remove containers (keeps database volumes):**
  ```sh
  docker compose down
  ```
- **View live application logs:**
  ```sh
  docker compose logs -f
  ```
- **Clean start (re-create volumes, wipe database):**
  ```sh
  docker compose down -v
  docker compose up --build
  ```

## End-to-end smoke

```sh
# Register an admin
curl -sX POST localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sheersh","email":"sheersh@md.test","password":"hunter22hunter22","role":"ADMIN"}' | jq

# Login → grab access token
ACCESS=$(curl -sX POST localhost:8080/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"sheersh@md.test","password":"hunter22hunter22"}' | jq -r .accessToken)

# List students (empty)
curl -s localhost:8080/api/students -H "Authorization: Bearer $ACCESS" | jq

# Create a student
curl -sX POST localhost:8080/api/students \
  -H "Authorization: Bearer $ACCESS" -H 'Content-Type: application/json' \
  -d '{"name":"Yash","email":"yash@md.test","password":"yashpass1","phone":"9876543210","course":"Java Full Stack","batchId":"B001"}' | jq

# Bad token → 401
curl -sI localhost:8080/api/students -H "Authorization: Bearer junk"
```

## Environment variables

| Var | Required | Purpose |
|---|---|---|
| `MD_JWT_SECRET` | **yes** | HS256 signing key. Must be ≥32 chars. Generate with `openssl rand -base64 48`. App refuses to boot if missing. |
| `MD_DB_URL` | yes | JDBC URL. Default `jdbc:postgresql://localhost:5432/md_portal`. |
| `MD_DB_USER` | yes | DB user. |
| `MD_DB_PASSWORD` | yes | DB password. |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | for compose only | Used by the Postgres container in `docker-compose.yml`. |

JWT TTLs and issuer are tunable via `app.jwt.access-ttl` (default `PT15M`), `app.jwt.refresh-ttl` (default `P7D`), `app.jwt.issuer` (default `md-classes-portal`).

## API surface (this pass)

| Method | Path | Auth | Roles |
|---|---|---|---|
| GET | `/world` | public | – |
| GET | `/actuator/health` | public | – |
| GET | `/swagger-ui.html` | public | – |
| POST | `/api/auth/register` | public | (creates STUDENT by default; ADMIN role requested in the body) |
| POST | `/api/auth/login` | public | – |
| POST | `/api/auth/refresh` | public | – |
| POST | `/api/auth/logout` | bearer | any |
| POST | `/api/auth/forgot-password` | public | – (stub) |
| POST | `/api/auth/reset-password` | public | – (stub) |
| POST | `/api/students` | bearer | ADMIN |
| GET | `/api/students` | bearer | ADMIN, TEACHER (paged: `?page=&size=`) |
| GET | `/api/students/{id}` | bearer | ADMIN, TEACHER, owning STUDENT |
| PUT | `/api/students/{id}` | bearer | ADMIN, owning STUDENT |
| DELETE | `/api/students/{id}` | bearer | ADMIN |

Full target API (14 modules, ~40 endpoints) is described in `documents/apidesign.md`.

## Tests

```sh
./gradlew test
```

Runs:
- `JwtServiceTest` — token generation, type guards, secret/expiration rejection.
- `AuthFlowIntegrationTest` (`@SpringBootTest` + Testcontainers Postgres) — register → login → protected GET → bad token → student-creates-student → role-enforcement → refresh.
- `PortalApplicationTests.contextLoads()`.

The integration test spins up a real Postgres 16 container per test class — needs Docker running.

## Layout

```
src/main/java/md_classes/portal/
├── PortalApplication.java
├── config/         SecurityConfig, JwtAuthFilter, OpenApiConfig
├── controller/     Auth, Student, Hello (smoke)
├── domain/         User, Student   (JPA)
├── dto/            auth/*, student/*, error/ApiError
├── enums/          Role
├── exception/      ApiExceptionHandler + domain/ exceptions
├── repository/     User, Student
└── service/        JwtService, AuthService, StudentService

src/main/resources/
├── application.properties               (base, profile-agnostic)
├── application-local.properties         (gitignored, dev)
├── application-test.properties          (Testcontainers)
└── db/migration/V1__init_users_students.sql
```

## Out of this pass

Twelve modules from `apidesign.md` are intentionally deferred until the foundation lands cleanly: Attendance, Tests, Notes, Assignments, Announcements, Fees, Parent portal, Progress, Batches, Courses, Notifications, Files. Each will follow the same `dto/ → service/ → controller/ → migration` shape as the Student module.

Also deferred: real email delivery for forgot/reset, refresh-token rotation + blacklist, file uploads (S3/Cloudinary), production hosting, audit log, rate limiting.
