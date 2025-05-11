# Kanban Board Server

Backend server for the Kanban board application built with Express.js and MongoDB.

## Features

- JWT-based authentication
- RESTful API endpoints
- MongoDB integration
- Input validation
- Error handling
- Middleware for route protection

## API Routes

### Authentication

```
POST /api/auth/signup
Body: {
  "name": "string",
  "email": "string",
  "password": "string"
}
Response: {
  "token": "jwt_token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}

POST /api/auth/login
Body: {
  "email": "string",
  "password": "string"
}
Response: {
  "token": "jwt_token",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string"
  }
}
```

### Board Management

```
GET /api/board
Response: {
  "board": {
    "id": "string",
    "title": "string",
    "description": "string"
  },
  "columns": [{
    "id": "string",
    "title": "string",
    "tasks": [{
      "id": "string",
      "title": "string",
      "description": "string"
    }]
  }]
}
```

### Column Management

```
POST /api/column
Body: {
  "title": "string",
  "boardId": "string"
}
```

### Task Management

```
POST /api/task
Body: {
  "title": "string",
  "description": "string",
  "columnId": "string",
  "boardId": "string"
}

PATCH /api/task/:id
Body: {
  "title": "string",
  "description": "string",
  "columnId": "string",
  "order": "number"
}

DELETE /api/task/:id
```

## Environment Variables

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRATION`: Token expiration time (e.g., "24h")
- `PORT`: Server port (default: 5000)

## Development
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm run dev
   ```

The server will start on the specified port (default: 5000).
