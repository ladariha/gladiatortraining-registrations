# API Documentation

This document provides comprehensive documentation for the Gladiator Training Registrations REST API.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL and Versioning](#base-url-and-versioning)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Events API](#events-api)
- [Registrations API](#registrations-api)
- [User Management](#user-management)
- [Administration APIs](#administration-apis)

## Overview

The plugin extends the WordPress REST API with custom endpoints for event management and registration functionality. The API follows RESTful conventions with proper HTTP methods, status codes, and JSON responses.

## Authentication

The API uses WordPress's built-in authentication system:

- **Cookie Authentication**: For logged-in WordPress users
- **Application Passwords**: WordPress application passwords (recommended for external integrations)
- **Basic Authentication**: Available through WordPress plugins

### Permission Levels

- **Public**: Accessible to all users (viewing events, registering)
- **Admin**: Requires `manage_options` WordPress capability (event management, registration oversight)

## Base URL and Versioning

**Base URL**: `{your-wordpress-site}/wp-json/gtevents/v1/`

**Example**: `https://example.com/wp-json/gtevents/v1/`

All endpoints are prefixed with this base URL.

## Response Format

All API responses follow a consistent JSON structure:

### Successful Response
```json
{
    "data": {...},
    "status": 200
}
```

### Error Response
```json
{
    "code": "error_code",
    "message": "Human-readable error message",
    "data": {
        "status": 400
    }
}
```

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created successfully
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Common Error Codes

- `rest_forbidden` - Insufficient permissions
- `rest_invalid_param` - Invalid parameter value
- `rest_missing_callback_param` - Required parameter missing
- `internal_server_error` - Server-side error

## Events API

### List Events

Get a list of public events.

**Endpoint**: `GET /events/{limit}`

**Parameters**:
- `limit` (integer, optional): Maximum number of events to return

**Example Request**:
```bash
GET /wp-json/gtevents/v1/events/10
```

**Example Response**:
```json
{
    "items": [
        {
            "id": 1,
            "name": "Basic Combat Training",
            "short_description": "Introduction to gladiator combat techniques",
            "description": "Full description with rich text...",
            "time": 1672531200,
            "max_people": 20,
            "people": 5,
            "visible": 1,
            "registration_end": 1672444800,
            "image": "https://example.com/image.jpg",
            "bank_code": "0800",
            "prefix": "123",
            "swift": "GIBACZPX",
            "iban": "CZ6508000000192000145399",
            "account_number": "192000145399",
            "registrations": []
        }
    ]
}
```

### Get Single Event

Get details of a specific event.

**Endpoint**: `GET /events/{id}`

**Parameters**:
- `id` (integer, required): Event ID

**Permissions**: Public

### Create Event

Create a new event.

**Endpoint**: `POST /events`

**Permissions**: Admin only

**Request Body**:
```json
{
    "name": "Event Name",
    "short_description": "Brief description",
    "description": "Full event description",
    "time": 1672531200,
    "max_people": 30,
    "registration_end": 1672444800,
    "image": "https://example.com/image.jpg",
    "bank_code": "0800",
    "prefix": "123",
    "swift": "GIBACZPX",
    "iban": "CZ6508000000192000145399",
    "account_number": "192000145399"
}
```

### Update Event

Update an existing event.

**Endpoint**: `PUT /events/{id}`

**Parameters**:
- `id` (integer, required): Event ID

**Permissions**: Admin only

**Request Body**: Same as create event

### Delete Event

Delete an event.

**Endpoint**: `DELETE /events/{id}`

**Parameters**:
- `id` (integer, required): Event ID

**Permissions**: Admin only

## Registrations API

### Get Event Registrations

Get all registrations for a specific event.

**Endpoint**: `GET /registrations/{id}`

**Parameters**:
- `id` (integer, required): Event ID

**Permissions**: 
- Admin: Full registration details
- Public: Limited information

**Example Response**:
```json
{
    "items": [
        {
            "id": 1,
            "group_id": 1,
            "gdpr": 1,
            "is_leader": 1,
            "paid": 0,
            "price": 1500,
            "date_of_birth": 631152000,
            "name": "John Doe",
            "sex": "male",
            "registration_type_name": "Individual",
            "email": "john@example.com",
            "address": "123 Main St, City",
            "club": "Warriors Club"
        }
    ]
}
```

### Create Registration

Register for an event.

**Endpoint**: `POST /registrations`

**Permissions**: Public

**Request Body**:
```json
{
    "event_id": 1,
    "club": "Warriors Club",
    "registration_type_name": "Individual",
    "registrations": [
        {
            "address": "123 Main St, City, Country",
            "last_name": "Doe",
            "first_name": "John",
            "date_of_birth": 631152000,
            "sex": "male",
            "email": "john@example.com",
            "gdpr": true,
            "is_leader": true
        }
    ]
}
```

**Group Registration Example**:
```json
{
    "event_id": 1,
    "club": "Warriors Club",
    "registration_type_name": "Group",
    "registrations": [
        {
            "address": "123 Main St, City, Country",
            "last_name": "Doe",
            "first_name": "John",
            "date_of_birth": 631152000,
            "sex": "male",
            "email": "john@example.com",
            "gdpr": true,
            "is_leader": true
        },
        {
            "address": "456 Oak Ave, City, Country",
            "last_name": "Smith",
            "first_name": "Jane",
            "date_of_birth": 694224000,
            "sex": "female",
            "email": "jane@example.com",
            "gdpr": true,
            "is_leader": false
        }
    ]
}
```

### Update Registration Status

Update payment status or other registration details.

**Endpoint**: `PUT /registrations/{id}`

**Parameters**:
- `id` (integer, required): Registration group ID

**Permissions**: Admin only

**Request Body**:
```json
{
    "paid": 1
}
```

## User Management

### Get Current User

Get information about the currently authenticated user.

**Endpoint**: `GET /user/whoami`

**Permissions**: Public (returns different data based on auth status)

**Example Response**:
```json
{
    "role": "admin",
    "isLoggedIn": true,
    "capabilities": ["manage_options"],
    "user_id": 1
}
```

### Register User

Register a new WordPress user (if registration is enabled).

**Endpoint**: `POST /user/register`

**Permissions**: Public (if WordPress allows user registration)

**Request Body**:
```json
{
    "username": "newuser",
    "email": "user@example.com",
    "password": "secure_password"
}
```

## Administration APIs

### Error Management

#### Get Error Logs

**Endpoint**: `GET /errors`

**Permissions**: Admin only

**Example Response**:
```json
{
    "errors": [
        {
            "time": 1672531200,
            "msg": "Validation error: Invalid email format"
        }
    ]
}
```

### API Key Management

#### Get API Keys

**Endpoint**: `GET /keys`

**Permissions**: Admin only

#### Update API Key

**Endpoint**: `PUT /keys/{key_name}`

**Permissions**: Admin only

**Request Body**:
```json
{
    "value": "new_api_key_value"
}
```

### Mail Service

#### Send Email

**Endpoint**: `POST /mail`

**Permissions**: Admin only

**Request Body**:
```json
{
    "to": "recipient@example.com",
    "subject": "Event Confirmation",
    "message": "Thank you for registering...",
    "template_id": "registration_confirmation"
}
```

## Data Types and Validation

### Event Object

```typescript
interface Event {
    id: number;
    name: string;                    // Required, max 255 chars
    short_description: string;       // Required
    description: string;             // Required, supports rich text
    time: number;                   // Unix timestamp
    max_people: number;             // Min: 1
    people: number;                 // Current registrations
    visible: 0 | 1;                // Boolean as integer
    registration_end: number;       // Unix timestamp
    image?: string;                 // URL
    bank_code?: string;             // Numeric string
    prefix?: string;                // Account prefix
    swift?: string;                 // SWIFT code
    iban?: string;                  // IBAN
    account_number?: string;        // Account number
}
```

### Registration Object

```typescript
interface Registration {
    id: number;
    group_id: number;
    address: string;                // Required
    last_name: string;              // Required
    first_name: string;             // Required
    date_of_birth: number;          // Unix timestamp
    sex: 'male' | 'female';         // Required
    email: string;                  // Valid email format
    gdpr: boolean;                  // Must be true to register
    is_leader: boolean;             // Group leader flag
    registration_type_name: string; // Registration category
}
```

### Validation Rules

- **Strings**: Non-empty, trimmed, proper length limits
- **Emails**: Valid email format required
- **Dates**: Unix timestamps, future dates for events
- **Numbers**: Positive integers where applicable
- **GDPR**: Must be explicitly accepted (true)
- **Capacity**: Registrations cannot exceed event max_people

## Rate Limiting

The API inherits WordPress's built-in rate limiting. For high-volume applications, consider:

- Implementing caching strategies
- Using WordPress transients for temporary data storage
- Monitoring server resources during peak registration periods

## Examples

### Complete Registration Flow

1. **Get Available Events**:
```bash
curl -X GET "https://example.com/wp-json/gtevents/v1/events/10"
```

2. **Get Event Details**:
```bash
curl -X GET "https://example.com/wp-json/gtevents/v1/events/1"
```

3. **Register for Event**:
```bash
curl -X POST "https://example.com/wp-json/gtevents/v1/registrations" \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": 1,
    "club": "Warriors Club",
    "registration_type_name": "Individual",
    "registrations": [{
      "address": "123 Main St",
      "last_name": "Doe",
      "first_name": "John",
      "date_of_birth": 631152000,
      "sex": "male",
      "email": "john@example.com",
      "gdpr": true,
      "is_leader": true
    }]
  }'
```

### Admin Event Management

1. **Create Event** (requires authentication):
```bash
curl -X POST "https://example.com/wp-json/gtevents/v1/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Advanced Combat Training",
    "short_description": "Advanced techniques for experienced fighters",
    "description": "Detailed description...",
    "time": 1672531200,
    "max_people": 15,
    "registration_end": 1672444800,
    "bank_code": "0800",
    "account_number": "192000145399"
  }'
```

2. **Update Registration Status**:
```bash
curl -X PUT "https://example.com/wp-json/gtevents/v1/registrations/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"paid": 1}'
```

This API documentation provides a complete reference for integrating with the Gladiator Training Registrations plugin. For additional support or questions about specific endpoints, refer to the source code in the `/includes/` directory of the plugin.