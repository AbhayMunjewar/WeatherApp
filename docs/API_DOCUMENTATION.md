# API Documentation

Complete reference for all backend API endpoints and usage examples.

## Base URL
```
http://localhost:5000
```

## Table of Contents
1. [Health Check](#health-check)
2. [Weather Endpoints](#weather-endpoints)
3. [Alerts Endpoints](#alerts-endpoints)
4. [Query Management](#query-management)
5. [User Authentication](#user-authentication)
6. [User Data](#user-data)
7. [Response Formats](#response-formats)
8. [Error Handling](#error-handling)

---

## Health Check

### GET /
Check if the API is running.

**Request:**
```bash
curl http://localhost:5000/
```

**Response:**
```
OK
```

**Status Code:** 200

---

## Weather Endpoints

### GET /weather/<city>
Get current weather data for a specific city.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| city | string | Yes | City name (e.g., "London", "New York") |

**Request:**
```bash
curl http://localhost:5000/weather/London
```

**Response (JSON):**
```json
{
  "name": "London",
  "main": {
    "temp": 15.5,
    "feels_like": 14.2,
    "humidity": 72,
    "pressure": 1013,
    "temp_min": 13.2,
    "temp_max": 17.8
  },
  "weather": [
    {
      "id": 803,
      "main": "Clouds",
      "description": "broken clouds",
      "icon": "04d"
    }
  ],
  "wind": {
    "speed": 4.5,
    "deg": 240
  },
  "clouds": {
    "all": 75
  },
  "visibility": 10000,
  "sys": {
    "sunrise": 1648465920,
    "sunset": 1648513440
  },
  "coord": {
    "lon": -0.1276,
    "lat": 51.5085
  }
}
```

**Status Code:** 200 (Success), 404 (Not Found), 500 (Server Error)

---

## Alerts Endpoints

### GET /alerts
Fetch active weather alerts and warnings.

**Parameters:**
None

**Request:**
```bash
curl http://localhost:5000/alerts
```

**Response (JSON):**
```json
{
  "alerts": [
    {
      "id": "alert_1",
      "event": "Severe Thunderstorm Warning",
      "regions": ["London", "SE England"],
      "severity": "high",
      "effective_from": "2024-03-26T10:00:00Z",
      "expires": "2024-03-26T16:00:00Z",
      "description": "Severe thunderstorms with heavy rainfall expected"
    }
  ],
  "total_count": 1
}
```

**Status Code:** 200

---

## Query Management

### POST /queries
Save a new weather query.

**Request Body:**
```json
{
  "city": "London",
  "query_type": "current",
  "timestamp": "2024-03-26T10:30:00Z"
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/queries \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "query_type": "current"
  }'
```

**Response:**
```json
{
  "id": "query_001",
  "city": "London",
  "query_type": "current",
  "timestamp": "2024-03-26T10:30:00Z",
  "status": "success"
}
```

**Status Code:** 201 (Created), 400 (Bad Request)

---

### GET /queries
Get all saved weather queries.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| limit | integer | Max results (default: 100) |
| offset | integer | Pagination offset (default: 0) |

**Request:**
```bash
curl "http://localhost:5000/queries?limit=10&offset=0"
```

**Response:**
```json
{
  "queries": [
    {
      "id": "query_001",
      "city": "London",
      "query_type": "current",
      "timestamp": "2024-03-26T10:30:00Z"
    },
    {
      "id": "query_002",
      "city": "Paris",
      "query_type": "forecast",
      "timestamp": "2024-03-25T15:45:00Z"
    }
  ],
  "total": 2,
  "limit": 10,
  "offset": 0
}
```

**Status Code:** 200

---

### GET /queries/<id>
Get a specific query by ID.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Query ID |

**Request:**
```bash
curl http://localhost:5000/queries/query_001
```

**Response:**
```json
{
  "id": "query_001",
  "city": "London",
  "query_type": "current",
  "timestamp": "2024-03-26T10:30:00Z",
  "weather_data": {
    "temp": 15.5,
    "humidity": 72,
    "condition": "Clouds"
  }
}
```

**Status Code:** 200, 404 (Not Found)

---

### PUT /queries/<id>
Update an existing query.

**Request Body:**
```json
{
  "city": "London",
  "notes": "Updated query"
}
```

**Request:**
```bash
curl -X PUT http://localhost:5000/queries/query_001 \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "notes": "Updated query"
  }'
```

**Response:**
```json
{
  "id": "query_001",
  "city": "London",
  "updated_at": "2024-03-26T11:00:00Z",
  "status": "success"
}
```

**Status Code:** 200, 404 (Not Found), 400 (Bad Request)

---

### DELETE /queries/<id>
Delete a query.

**Request:**
```bash
curl -X DELETE http://localhost:5000/queries/query_001
```

**Response:**
```json
{
  "id": "query_001",
  "status": "deleted"
}
```

**Status Code:** 200, 404 (Not Found)

---

### GET /queries/export
Export all queries as CSV or PDF.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| format | string | "csv" or "pdf" (default: "csv") |

**Request:**
```bash
curl "http://localhost:5000/queries/export?format=csv" \
  --output queries.csv
```

**Response:**
File download (CSV or PDF format)

**Status Code:** 200, 400 (Bad Request)

---

## User Authentication

### POST /auth/signup
Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "id": "user_001",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-03-26T10:30:00Z",
  "token": "eyJhbGc..."
}
```

**Status Code:** 201 (Created), 400 (Bad Request), 409 (Conflict - User exists)

---

### POST /auth/login
Authenticate and login user.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

**Response:**
```json
{
  "id": "user_001",
  "username": "john_doe",
  "email": "john@example.com",
  "token": "eyJhbGc...",
  "expires_in": 86400
}
```

**Status Code:** 200 (Success), 401 (Unauthorized), 404 (Not Found)

---

## User Data

### POST /save
Save a weather record.

**Request Body:**
```json
{
  "city": "London",
  "temperature": 15.5,
  "humidity": 72,
  "condition": "Clouds",
  "notes": "Cold and cloudy"
}
```

**Request:**
```bash
curl -X POST http://localhost:5000/save \
  -H "Content-Type: application/json" \
  -d '{
    "city": "London",
    "temperature": 15.5,
    "humidity": 72,
    "condition": "Clouds",
    "notes": "Cold and cloudy"
  }'
```

**Response:**
```json
{
  "id": "record_001",
  "city": "London",
  "temperature": 15.5,
  "created_at": "2024-03-26T10:30:00Z",
  "status": "success"
}
```

**Status Code:** 201 (Created), 400 (Bad Request)

---

### GET /records
Get all saved weather records.

**Request:**
```bash
curl http://localhost:5000/records
```

**Response:**
```json
{
  "records": [
    {
      "id": "record_001",
      "city": "London",
      "temperature": 15.5,
      "humidity": 72,
      "condition": "Clouds",
      "created_at": "2024-03-26T10:30:00Z"
    }
  ],
  "total": 1
}
```

**Status Code:** 200

---

### PUT /update/<id>
Update a weather record.

**Request Body:**
```json
{
  "notes": "Updated notes"
}
```

**Request:**
```bash
curl -X PUT http://localhost:5000/update/record_001 \
  -H "Content-Type: application/json" \
  -d '{"notes": "Updated notes"}'
```

**Response:**
```json
{
  "id": "record_001",
  "status": "updated",
  "updated_at": "2024-03-26T11:00:00Z"
}
```

**Status Code:** 200, 404 (Not Found)

---

### DELETE /delete/<id>
Delete a weather record.

**Request:**
```bash
curl -X DELETE http://localhost:5000/delete/record_001
```

**Response:**
```json
{
  "id": "record_001",
  "status": "deleted"
}
```

**Status Code:** 200, 404 (Not Found)

---

## Response Formats

### Success Response Format
```json
{
  "status": "success",
  "data": {
    // Response data here
  },
  "timestamp": "2024-03-26T10:30:00Z"
}
```

### Error Response Format
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-03-26T10:30:00Z"
}
```

---

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Missing or invalid authentication |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists (e.g., duplicate user) |
| 500 | Server Error | Internal server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Error Handling

### Common Error Responses

**Invalid City Name:**
```json
{
  "error": "City not found",
  "code": "NOT_FOUND",
  "suggestions": ["London", "Londonderry", "Londrina"]
}
```

**Missing Required Field:**
```json
{
  "error": "Missing required field: city",
  "code": "VALIDATION_ERROR",
  "field": "city"
}
```

**API Rate Limit Exceeded:**
```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "retry_after": 60
}
```

---

## Rate Limiting

- **Free Tier**: 60 calls per minute
- **Headers** include:
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Unix timestamp of reset

**Example:**
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1648470600
```

---

## CORS

CORS is enabled for development on `http://localhost:5173`

**Allowed Headers:**
- `Content-Type`
- `Authorization`

**Allowed Methods:**
- GET, POST, PUT, DELETE, OPTIONS

---

## Testing with cURL

Quick test commands:

```bash
# Health check
curl http://localhost:5000/

# Get weather
curl http://localhost:5000/weather/London

# Get alerts
curl http://localhost:5000/alerts

# List queries
curl http://localhost:5000/queries
```

---

## Questions?

- 📖 [Full README](../README.md)
- 🛠️ [Installation Guide](./INSTALLATION.md)
- 📋 [Architecture Guide](./ARCHITECTURE.md)
- 🐛 [Report Issues](https://github.com/AbhayMunjewar/WeatherApp/issues)
