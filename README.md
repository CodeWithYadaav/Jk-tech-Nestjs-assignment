## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

# NestJS User & Post Management API

A modern NestJS application with JWT authentication, user management, and post management features using Sequelize ORM with MySQL database.

## Features

- **JWT Authentication**: Secure login and registration system
- **User Management**: CRUD operations for users with role-based access
- **Post Management**: Create, read, update, and delete posts with author authorization
- **Database**: MySQL with Sequelize ORM
- **Validation**: Input validation using class-validator
- **Security**: Password hashing with bcrypt
- **Docker Support**: Complete containerization with MySQL and phpMyAdmin
- **Clean Architecture**: Modular design with separated concerns

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: MySQL 8.0
- **ORM**: Sequelize with TypeScript
- **Authentication**: JWT with Passport
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcryptjs
- **Language**: TypeScript
- **Containerization**: Docker & Docker Compose

## Project Structure

```
nestjs-app/
├── src/
│   ├── modules/
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   └── strategies/       # JWT & Local strategies
│   │   ├── user/                 # User management module
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.module.ts
│   │   │   ├── entities/         # User entity
│   │   │   └── dto/              # User DTOs
│   │   └── post/                 # Post management module
│   │       ├── post.controller.ts
│   │       ├── post.service.ts
│   │       ├── post.module.ts
│   │       ├── entities/         # Post entity
│   │       └── dto/              # Post DTOs
│   ├── database/                 # Database configuration
│   │   └── database.module.ts
│   ├── config/                   # Application configuration
│   │   └── configuration.ts
│   ├── app.module.ts             # Main application module
│   └── main.ts                   # Application entry point
├── docker-compose.yml            # Docker services configuration
├── Dockerfile                    # Application container
├── .env                          # Environment variables
└── script.js                     # Database seeding script
```

## Installation & Setup

### Prerequisites

- Node.js (v22 or higher)
- Docker & Docker Compose
- npm

### Option 1: Docker Setup (Recommended)

1. **Clone and navigate to the project**

   ```bash
   git clone <repository-url>
   cd nestjs-app
   ```

2. **Start all services with Docker**

   ```bash
   docker compose up -d --build
   ```

3. **Access the services**
   - **API**: http://localhost:3000
   - **phpMyAdmin**: http://localhost:8080
   - **MySQL**: localhost:3307

### Option 2: Local Development

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Run the application**
   ```bash
   npm run start:dev
   ```

## Database Seeding

To populate the database with realistic sample data, use the included seeding script:

```bash
node script.js
```

**Sample Data Includes:**

- **3 Users**: Alex Johnson, Sarah Williams, Mike Chen
- **6 Posts**: Technical blog posts about NestJS, Sequelize, Docker, JWT, etc.

**Sample Users for Testing:**

- alex.johnson@techcorp.com / SecurePass123!
- sarah.williams@startup.io / MyPassword456@
- mike.chen@freelancer.dev / DevLife789#

## API Endpoints

### Base URL: `http://localhost:3000/api`

### Authentication

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

#### Login User

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### User Management

> **Note**: Requires Authorization header: `Bearer <token>`

#### Get All Users

```http
GET /users?page=1&limit=10
Authorization: Bearer <token>
```

#### Get User by ID

```http
GET /users/:id
Authorization: Bearer <token>
```

#### Create User

```http
POST /users
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "password": "password123"
}
```

#### Update User

```http
PATCH /users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "UpdatedName",
  "lastName": "UpdatedLastName"
}
```

#### Delete User

```http
DELETE /users/:id
Authorization: Bearer <token>
```

### Post Management

#### Get All Published Posts

```http
GET /posts?page=1&limit=10
```

#### Get Post by ID

```http
GET /posts/:id
```

#### Create Post

```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My First Post",
  "content": "This is the content of my first post",
  "isPublished": true
}
```

#### Get My Posts

```http
GET /posts/my-posts?page=1&limit=10
Authorization: Bearer <token>
```

#### Update Post

```http
PATCH /posts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Post Title",
  "content": "Updated content"
}
```

#### Delete Post

```http
DELETE /posts/:id
Authorization: Bearer <token>
```

## Environment Variables

| Variable            | Description         | Default         |
| ------------------- | ------------------- | --------------- |
| `DATABASE_HOST`     | MySQL host          | localhost       |
| `DATABASE_PORT`     | MySQL port          | 3306            |
| `DATABASE_USERNAME` | MySQL username      | nestjs          |
| `DATABASE_PASSWORD` | MySQL password      | nestjspassword  |
| `DATABASE_NAME`     | Database name       | nestjs_app      |
| `JWT_SECRET`        | JWT signing secret  | your-secret-key |
| `JWT_EXPIRES_IN`    | JWT expiration time | 7d              |
| `PORT`              | Application port    | 3000            |
| `NODE_ENV`          | Environment         | development     |

## Docker Services

- **MySQL**: Database server (port 3307)
- **phpMyAdmin**: Database management UI (port 8080)
- **NestJS App**: API server (port 3000)

## Development Commands

```bash
# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Lint code
npm run lint

# Format code
npm run format
```