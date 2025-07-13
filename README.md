# 🧱 Microservices Architecture with Node.js, Docker, NGINX, and Redis

A scalable microservices system using Node.js, Express, Socket.IO, MongoDB, Redis, and Docker Compose, with NGINX as a reverse proxy and load balancer.

---

## 📐 Architecture

           ┌────────────┐
           │  Client    │
           └────┬───────┘
        HTTP/WS │
                ▼
          ┌─────────────┐
          │  NGINX LB   │
          └────┬────────┘
     ┌─────────┴──────────┐
     │                    │
┌────────────┐      ┌────────────┐
│ Auth Svc x2│      │ Data Svc x3│
└─────┬──────┘      └────┬───────┘
      │                  │
┌─────▼──────┐      ┌────▼────────┐
│ Mongo Auth │      │ Mongo Data  │
└────────────┘      └─────────────┘
                       │
                ┌──────▼──────┐
                │  Redis Pub  │
                └─────────────┘

### System Components

- **Auth Service**: Handles user signup/login with JWT-based authentication.
- **Data Service**: Manages user profiles and real-time status updates using Socket.IO with Redis adapter.
- **NGINX**: Load balances HTTP and WebSocket traffic with sticky sessions.
- **MongoDB**: Stores user credentials and profile data.
- **Redis**: Enables Socket.IO communication across distributed instances.
- **Concurrency Test**: Node.js script to simulate 1000+ concurrent users.

---

## ⚙️ Setup Guide

### 1. Prerequisites

- Docker: [Install Docker](https://www.docker.com/get-started)
- Docker Compose: [Install Docker Compose](https://docs.docker.com/compose/install/)

### 2. Clone the Repository

```bash
git clone https://github.com/your-username/microservices-node-architecture.git
cd microservices-node-architecture
```

### 3. Configure Environment Variables

Update the `.env` files (in `auth-service` and `data-service`) with:

```env
JWT_SECRET=your_jwt_secret_here
```

### 4. Build and Start All Services

```bash
docker-compose up --build
```

### 5. Run Concurrency Test

```bash
cd concurrency-test
npm install
npm start
```

### 6. Health Checks

Each service exposes a `/health` endpoint.

NGINX routes requests only to healthy instances.

---

## 🚀 Bonus Features

- **Rate Limiting**: Applied using NGINX’s `limit_req_zone` directive.
- **Logging**:
  - NGINX logs incoming HTTP/WebSocket traffic and route handling.
  - Socket.IO logs client connections and events.
- **Environment Config**: Manage secrets and configs using `.env`.

---

## 🧪 Testing and Validation

- **Health Check**
  ```bash
  curl http://localhost/auth/health
  curl http://localhost/api/health
  ```

- **Real-Time Communication**  
  Update a user’s status via `/api/updatestatus` and verify real-time broadcast to connected clients.

- **Concurrency Simulation**  
  Run `test.js` to simulate 1000+ users and inspect:
  ```bash
  docker logs <nginx-container-name>
  ```

---

## 📡 API Endpoints

### 🔐 Auth Service - `http://localhost/auth`

| Method | Endpoint      | Description           |
|--------|---------------|-----------------------|
| GET    | `/health`     | Health check          |
| POST   | `/signup`     | Register new user     |
| GET    | `/login`      | Login user            |

### 📦 Data Service - `http://localhost/api`

| Method | Endpoint                                       | Description              |
|--------|------------------------------------------------|--------------------------|
| GET    | `/health`                                      | Health check             |
| POST   | `/data`                                        | Add user profile data    |
| PUT    | `/updatestatus?userData=<userId>`              | Update user status       |

### 📬 Postman Collection

Use this collection for testing:

👉 [Open in Postman](https://interstellar-space-87990.postman.co/workspace/My-Workspace~6a3b5bc9-569b-486c-8c67-8d284b9e1589/collection/10047749-4906e9eb-ec83-4b6b-9718-e5943bd87207?action=share&creator=10047749)

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Real-Time**: Socket.IO + Redis Adapter
- **Database**: MongoDB
- **Pub/Sub**: Redis
- **Reverse Proxy**: NGINX (Load Balancing + Rate Limiting)
- **Containerization**: Docker, Docker Compose

---
---

## 🪪 License

MIT License © [Harsh Patel]

---

## 🙋‍♂️ Author

- **[Harsh Patel]** – [@your-github](https://github.com/your-username)