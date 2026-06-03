# InvestWise — Smart Multi-Asset Investment Platform

[![Build Status](https://github.com/harisai-singuluri/InvestWise-Smart-Multi-Asset-Investment-App/actions/workflows/ci.yml/badge.svg)](https://github.com/harisai-singuluri/InvestWise-Smart-Multi-Asset-Investment-App/actions)
[![Java Version](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/technologies/javase/jdk21-archive-downloads.html)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> A production-grade multi-asset investment application prototype engineered to demonstrate software architecture and fintech backend reliability for a **Software Engineer (SDE-1)** position at **Pluang**.

---

## 1. Executive Summary & Fintech Architecture

InvestWise allows investors to explore multiple asset classes (**US Stocks, ETFs, Cryptocurrencies, Mutual Funds, and Digital Gold**), plan multi-year financial goals, setup automated Dollar-Cost Averaging (DCA) schedules, configure price threshold alerts, and execute simulated market and limit orders backed by an immutable double-entry accounting ledger.

### Architectural Highlights
- **Arbitrary-Precision Financial Math**: All currency, quotes, holdings, and order executions utilize Java `BigDecimal` (never floating-point types) to eliminate binary rounding errors.
- **Double-Entry Immutable Accounting**: Every trade execution creates matched debit and credit ledger legs that balance to zero, providing an immutable audit trail.
- **Idempotency & Auditable Order State Machine**: Strict state transitions (`NEW` → `ACCEPTED` → `OPEN` / `FILLED`, `CANCELLED`, `REJECTED`) with database-enforced idempotency key protection (`X-Idempotency-Key`).
- **Optimistic Concurrency Control**: Entity `@Version` columns and pessimistic write locks protect account cash balances and portfolio holdings under concurrent order processing.
- **Multi-Asset Instrument Catalog**: Seeded market instruments across 5 asset classes with simulated quotes, volatility models, and historical price curves (1D, 1W, 1M, 1Y, ALL).
- **Pluggable Market & AI Interfaces**: Interfaces decouple simulated engines from live market data providers and LLMs, featuring a deterministic financial heuristic fallback.

---

## 2. System Design & Domain Packages

```
com.investwise
├── auth            # JWT authentication, user registration, security filter chain
├── user            # User entity, profile settings, roles
├── account         # Cash accounts, available vs reserved balances
├── asset           # Multi-asset registry (STOCKS, ETFS, CRYPTO, MUTUAL_FUNDS, GOLD)
├── marketdata      # Price quotes, simulated provider, historical chart feeds
├── watchlist       # User asset watchlists
├── portfolio       # Positions, average cost, unrealized P&L, allocation analytics
├── order           # Order lifecycle, market/limit orders, idempotency validation
├── ledger          # Immutable double-entry ledger journals
├── goal            # Financial goals, target horizons, progress projections
├── recurring       # Recurring investment (DCA) schedules & auto-execution
├── alert           # Price above/below and volatility alerts
├── notification    # In-app event notifications
├── insight         # AI & heuristic portfolio risk & concentration analysis
├── common          # Standard API responses, exceptions, global error handlers
└── config          # Security, OpenAPI, Redis, Kafka configuration
```

---

## 3. Financial Order Lifecycle

```
[Client Order Request] (Includes X-Idempotency-Key)
         │
         ▼
[Idempotency Check] ──── Duplicate ───► Return Existing Order Record
         │
         ▼
[Order Validation & Balance Verification] ── Insufficient ──► REJECTED
         │
         ▼
     ACCEPTED
     ├── Market Order ──► FILLED (Simulated Execution + Double-Entry Ledger)
     └── Limit Order  ──► OPEN (Monitored against quote stream)
                           ├── Condition Met ──► FILLED
                           └── User Cancel   ──► CANCELLED (Release Reserved Cash)
```

### Double-Entry Accounting Rule
- **BUY Execution**:
  - `CASH_DEBIT`: Cash balance decreases by total settlement amount.
  - `ASSET_ACQUISITION`: Asset position increases by matching value.
  - Debits == Credits.
- **SELL Execution**:
  - `ASSET_DISPOSAL`: Asset position decreases by total settlement amount.
  - `CASH_CREDIT`: Cash balance increases by matching value.
  - Debits == Credits.

---

## 4. Technology Stack

### Backend
- **Language**: Java 21 LTS
- **Framework**: Spring Boot 3.2.0 (Spring MVC, Spring Security, Spring Data JPA, Spring Actuator)
- **Security**: Stateless JWT Authentication (`jjwt 0.12.5`), BCrypt password hashing
- **Persistence**: Hibernate ORM, PostgreSQL (production/docker), H2 (in-memory test profile)
- **Caching & Messaging**: Redis, Apache Kafka, Zookeeper
- **API Documentation**: OpenAPI 3 / Swagger UI (`springdoc-openapi 2.5.0`)
- **Testing**: JUnit 5, Mockito, Spring Boot Test, MockMvc, Testcontainers

### Frontend
- **Framework**: React 18 with TypeScript
- **Tooling**: Vite 5
- **Styling**: Tailwind CSS (custom dark fintech theme)
- **Icons**: Lucide React
- **Charts**: Recharts (Interactive Area performance curves, Asset allocation donut charts)
- **Routing**: React Router DOM v6

---

## 5. API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register user + auto-provision $100,000 demo cash |
| `POST` | `/api/v1/auth/login` | Authenticate and obtain JWT bearer token |
| `GET` | `/api/v1/auth/me` | Fetch authenticated user profile |
| `GET` | `/api/v1/accounts` | Get cash account balances (total, available, reserved) |
| `POST` | `/api/v1/accounts/demo/reset` | Reset demo cash balance back to $100,000.00 |
| `GET` | `/api/v1/assets` | Browse and filter multi-asset instruments |
| `GET` | `/api/v1/assets/{symbol}` | Get instrument details and latest market quote |
| `GET` | `/api/v1/assets/{symbol}/history` | Historical price series for charts (1D, 1W, 1M, 1Y, ALL) |
| `POST` | `/api/v1/market/quotes/{symbol}/simulate` | Simulate quote price update for trigger testing |
| `GET` | `/api/v1/portfolio` | Get active holdings, total equity, P&L, and allocation % |
| `GET` | `/api/v1/portfolio/performance` | Portfolio historical equity performance curve |
| `POST` | `/api/v1/orders` | Place simulated Buy/Sell (Market or Limit) order |
| `GET` | `/api/v1/orders` | Query user order history with status filters |
| `POST` | `/api/v1/orders/{id}/cancel` | Cancel an eligible OPEN limit order |
| `GET` | `/api/v1/transactions` | Immutable transaction trade records |
| `GET` | `/api/v1/ledger` | Double-entry balanced accounting entries |
| `GET` | `/api/v1/goals` | List user financial investment goals |
| `POST` | `/api/v1/goals` | Create investment goal with target date and risk preference |
| `POST` | `/api/v1/goals/{id}/contribute` | Contribute demo cash to an investment goal |
| `POST` | `/api/v1/goals/{id}/cancel` | Cancel goal and refund saved cash balance |
| `GET` | `/api/v1/recurring-plans` | List recurring Dollar-Cost Averaging plans |
| `POST` | `/api/v1/recurring-plans` | Create scheduled recurring DCA plan |
| `PATCH` | `/api/v1/recurring-plans/{id}/status` | Pause / Resume / Cancel recurring plan |
| `GET` | `/api/v1/watchlist` | Get user personal asset watchlist |
| `POST` | `/api/v1/watchlist/{symbol}` | Add asset to watchlist |
| `DELETE` | `/api/v1/watchlist/{symbol}` | Remove asset from watchlist |
| `GET` | `/api/v1/alerts` | List configured price alerts |
| `POST` | `/api/v1/alerts` | Create price alert (PRICE_ABOVE, PRICE_BELOW) |
| `DELETE` | `/api/v1/alerts/{id}` | Delete price alert |
| `GET` | `/api/v1/notifications` | Fetch user notification feed |
| `PATCH` | `/api/v1/notifications/{id}/read` | Mark notification as read |
| `GET` | `/api/v1/insights` | AI-assisted risk & concentration diagnostics |

---

## 6. Local Setup and Running

### Prerequisites
- Java 21 JDK
- Node.js 18+ and npm
- Docker and Docker Compose (optional for full containerized stack)

### 1. Run Backend
```bash
./mvnw clean test
./mvnw spring-boot:run
```
- API Base: `http://localhost:8080`
- Swagger UI Documentation: `http://localhost:8080/swagger-ui/index.html`
- Actuator Health Check: `http://localhost:8080/actuator/health`

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:5173`

### 3. One-Click Demo User (for Reviewers)
On the login screen, click **"1-Click Recruiter Demo Login"** to immediately sign in as `alex@investwise.app` with $100,000 cash balance!

### 4. Run Entire Stack with Docker Compose
```bash
docker-compose up --build
```

---

## 7. Testing & Verification

Run the full automated test suite:
```bash
./mvnw test
```
The test suite validates:
- User registration, login, and JWT bearer token issuance
- Order validation for insufficient cash and insufficient holdings
- Idempotency key deduplication (prevents duplicate orders)
- Balanced double-entry accounting journals (Debits == Credits)
- Cash reservations and cancellations
- Goal progress calculations and contributions
- Price alert trigger conditions
- End-to-end user investment lifecycle (`InvestWiseIntegrationTest`)

---

## 8. Disclaimer
InvestWise is an educational software engineering prototype built to demonstrate backend and full-stack engineering competency. It executes simulated orders with demo cash and does not connect to real financial brokerages or process real payments.
