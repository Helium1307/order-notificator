# Smoke Test Guide

This guide describes how to manually verify the complete authentication and order flow.

## Prerequisites

1. Start infrastructure:
```bash
cd notification-service
docker compose up -d
```

2. Start services (in separate terminals):
```bash
cd auth-service && yarn start:dev
cd order-service && yarn start:dev
cd notification-service && yarn start:dev (or already running via docker)
```

## Test Procedures

### 1. Register a User

```bash
curl -X POST http://localhost:3001/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'
```

Expected response (201):
```json
{
  "id": "uuid-here",
  "email": "test@example.com",
  "name": "Test User"
}
```

### 2. Login and Capture Cookie

```bash
curl -c /tmp/cookies.txt -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

Expected response (200):
```json
{
  "message": "Login successful"
}
```

The `session_id` cookie should be saved in `/tmp/cookies.txt`.

### 3. Verify Session is Valid

```bash
curl -b /tmp/cookies.txt http://localhost:3001/session
```

Expected response (200):
```json
{
  "userId": "uuid-here",
  "email": "test@example.com",
  "name": "Test User"
}
```

### 4. Create Order with Valid Session

```bash
curl -b /tmp/cookies.txt -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","quantity":2}'
```

Expected response (200):
```json
{
  "message": "Order created successfully!"
}
```

### 5. Verify Email Was Sent

Open Mailpit UI at http://localhost:8025 and confirm:
- Email was sent to `test@example.com`
- Email contains order notification with the user's name

### 6. Create Order Without Session (Should Fail)

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"productId":"prod-001","quantity":1}'
```

Expected response (401):
```json
{
  "message": "Invalid session",
  "statusCode": 401
}
```

### 7. Logout

```bash
curl -b /tmp/cookies.txt -X DELETE http://localhost:3001/auth/logout
```

Expected response (200):
```json
{
  "message": "Logout successful"
}
```

### 8. Try to Use Session After Logout (Should Fail)

```bash
curl -b /tmp/cookies.txt http://localhost:3001/session
```

Expected response (401):
```json
{
  "message": "Invalid or expired session",
  "statusCode": 401
}
```

## Success Criteria

- ✅ User registration creates account with hashed password
- ✅ Login returns session cookie
- ✅ Session endpoint validates cookie and returns user info
- ✅ Orders require valid session cookie
- ✅ Order creation triggers email notification with correct user data
- ✅ Logout invalidates the session
- ✅ Requests without valid session return 401

## Notes

- All passwords are hashed using bcrypt (saltrounds: 10)
- Sessions expire based on `SESSION_TTL_SECONDS` env var (default: 3600s)
- Auth service uses SQLite database at `./auth.db` (default)
- Order service calls auth-service at `http://localhost:3001` (configurable via `AUTH_SERVICE_URL`)
