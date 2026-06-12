# Policy Due Date Reminder System

This repository contains a full-stack Policy Due Date Reminder System consisting of a Java Spring Boot backend, an Angular standalone frontend, and a MySQL database configuration. It features secure stateless JWT authentication, role-based dashboards (Admin & Client), dynamic policy upcoming deadline warning notifications, and an automated scheduler engine to trigger reminder logs.

---

## 🛠️ Prerequisites

To run this application locally on your host machine, you will need:
1. **Java Development Kit (JDK) 21+**
2. **Node.js (v20+)** and **npm**
3. **Apache Maven (v3.9+)**
4. **MySQL Server (v8.x or v9.x)**

---

## 💾 Database Setup

The backend expects a local MySQL instance running on port `3306` with the username `root` and password `password`.

1. Start your local MySQL server (using brew services on macOS):
   ```bash
   brew services start mysql
   ```
2. Verify that `skip_networking` is disabled and MySQL is listening on TCP port `3306`:
   ```bash
   mysql -u root -p"password" -e "SHOW VARIABLES LIKE 'port';"
   ```
   *(If port is `0`, make sure you have configured a `my.cnf` file to enable port networking).*

3. Ensure the database `policy_db` exists:
   ```bash
   mysql -u root -p"password" -e "CREATE DATABASE IF NOT EXISTS policy_db;"
   ```

---

## 🚀 Running the Backend

The Spring Boot backend exposes REST APIs on `http://localhost:8080/api` and triggers automatic database seeding on startup.

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Compile and launch the application:
   ```bash
   mvn spring-boot:run
   ```
3. The server will start on port `8080`.

---

## 💻 Running the Frontend

The Angular frontend is built using standalone components, RxJS, and Angular Material.

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. (Optional) Install dependencies if running for the first time:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Angular local development server:
   ```bash
   npm start
   ```
4. Open your web browser and navigate to: **[http://localhost:4200/](http://localhost:4200/)**

---

## 🔐 Credentials for Demo Access

On startup, the database seeder registers the following demo users:

| Role | Username | Password | Email |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `adminpass` | `admin@example.com` |
| **Client** | `client` | `clientpass` | `client@example.com` |

---

## 🐳 Running with Docker Compose

If Docker is installed and running on your system, you can build and start all containers (MySQL, Spring Boot, and Angular Nginx proxy) in a single command:

1. In the project root, execute:
   ```bash
   docker-compose up --build
   ```
2. Access the frontend app at **[http://localhost/](http://localhost/)** and the backend API at **[http://localhost:8080/api](http://localhost:8080/api)**.
