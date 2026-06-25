<<<<<<< HEAD
# DataVault

A full‑stack cloud storage web application with secure sharing, file history, and role‑based access.

## Tech stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Spring Boot 3.2, Spring Security, JWT
- **Database:** H2 (dev), MySQL supported
- **Storage:** Local filesystem uploads folder
- **CI/CD:** Jenkins, Docker

## Features

- Upload/download files with SHA‑256 integrity check
- Duplicate detection and blocking per user
- File sharing with expiry and permissions (VIEW/DOWNLOAD)
- File history/versions
- Search by filename, filter by type, sort by date
- Role support: ADMIN, USER, VIEWER
- Email verification flow (token + resend)
- Theme support (Settings page)


## Getting started

### Prerequisites

- Java 17
- Node.js 20
- Docker
- Jenkins (optional)

### Run backend

```bash
cd server
mvn spring-boot:run
```

The server starts on http://localhost:8081/api

### Run frontend

```bash
cd client
npm install
npm run dev
```

The UI is served by Vite (default http://localhost:3000).

## Docker

### Build images

```bash
docker build -t datavault-server ./server
docker build -t datavault-client ./client
```

### Run containers

```bash
docker run -d -p 8081:8081 --name datavault-server datavault-server
docker run -d -p 3000:3000 --name datavault-client datavault-client
```

## Jenkins

A Jenkinsfile is included to:

- Build server jar and client bundle
- Build Docker images
- Push to Docker Hub (requires credentials ID `docker-hub-credentials`)

## Environment

Configure the following keys in `server/src/main/resources/application.properties`:

- `app.file.upload-dir`: file storage path
- `app.jwt.secret` and `app.jwt.expiration`: JWT settings
- `app.cors.allowed-origins`: frontend origin
- Google OAuth2 client credentials (if using Google sign‑in)
- Formspree endpoint (optional)

## Roles

- **ADMIN**: full access
- **USER**: standard access
- **VIEWER**: view/download only

The logged‑in user’s role comes from the `users.role` column and is enforced via Spring Security authorities.

## Security

- Passwords are encoded with BCrypt
- JWT authentication for API calls
- File sharing uses expiring tokens
- Email verification required before full sign‑in

## Notes

- Duplicate uploads are blocked using SHA‑256 file hashing.
- Shareable links are created with expiry and can be revoked.
- File trash supports restore and permanent delete.
=======
# Multi-Tier-Cloud-Based-File-Storage-System
 Developed a full-stack File Storage System with React.js frontend and Spring Boot backend. Implemented secure file handling, REST APIs, database integration, and prepared the application for DevOps deployment using Docker, Jenkins CI/CD, and AWS EC2.  
>>>>>>> 946ec2fdbbd8e8a1c65661859122464bb4cfcadb
