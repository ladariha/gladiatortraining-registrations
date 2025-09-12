# Architecture Documentation

This document provides a comprehensive technical overview of the Gladiator Training Registrations plugin architecture.

## Table of Contents

- [System Overview](#system-overview)
- [WordPress Plugin Structure](#wordpress-plugin-structure)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Database Schema](#database-schema)
- [API Design](#api-design)
- [Build System](#build-system)
- [Security Model](#security-model)

## System Overview

The plugin follows a modern full-stack architecture with clear separation of concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React SPA     │◄──►│  WordPress API  │◄──►│    Database     │
│   (Frontend)    │    │   (PHP Backend) │    │    (MySQL)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  User Browser   │    │  WordPress Core │    │  Email Service  │
│                 │    │    Hooks/API    │    │   Integration   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Components

- **Frontend**: React SPA with TypeScript, PrimeReact UI components
- **Backend**: PHP REST API built on WordPress REST API framework
- **Database**: Custom MySQL tables integrated with WordPress
- **Build System**: Automated versioning and packaging with Bash scripts

## WordPress Plugin Structure

### File Organization

```
gladiatortraining-registrations/
├── gladiatortraining-registrations.php  # Main plugin file
├── index.php                            # Security index
├── uninstall.php                        # Cleanup on uninstall
├── build.sh                            # Build and packaging script
├── admin/                               # WordPress admin interface
│   ├── class-...-admin.php             # Admin class
│   ├── css/                            # Admin styles
│   ├── js/                             # Admin scripts
│   └── partials/                       # Admin templates
├── public/                              # Public-facing interface
│   ├── class-...-public.php            # Public class
│   ├── css/                            # Public styles
│   ├── js/                             # Public scripts
│   └── partials/                       # Public templates
├── includes/                            # Core functionality
│   ├── class-*.php                     # WordPress integration classes
│   ├── *Route.php                      # REST API route handlers
│   ├── Persistance.php                 # Database operations
│   ├── MailService.php                 # Email functionality
│   └── Utils.php                       # Utility functions
├── languages/                           # Internationalization
├── frontend/                            # React application
│   ├── src/                            # Source code
│   ├── public/                         # Static assets
│   ├── build/                          # Compiled output
│   └── package.json                    # Dependencies
└── LICENSE.txt
```

### WordPress Integration

The plugin integrates with WordPress through:

1. **Plugin Header**: Standard WordPress plugin information
2. **Hooks System**: Actions and filters for WordPress events
3. **Shortcode**: `[gladiatortraining_registrations_app]` for page embedding
4. **REST API**: Extends WordPress REST API with custom endpoints
5. **Capabilities**: Uses WordPress user roles and capabilities
6. **Database**: WordPress database connection and table prefix

## Backend Architecture

### Core Classes

#### Main Plugin Class
```php
class Gladiatortraining_Registrations {
    protected $loader;      // Hook loader
    protected $plugin_name; // Plugin identifier
    protected $version;     // Plugin version
}
```

#### Database Persistence Layer
```php
class Persistance {
    // Database operations for:
    // - Events management
    // - User registrations
    // - Payment tracking
    // - Error logging
    // - API keys management
}
```

#### REST API Routes

All routes extend `BaseRoute` and inherit common functionality:

- **EventsRoute**: List and filter events
- **EventRoute**: CRUD operations for individual events
- **RegistrationsRoute**: Handle participant registrations
- **UserRoute**: User authentication and profile management
- **MailRoute**: Email sending functionality
- **ErrorsRoute**: Error logging and reporting

### Request Flow

1. **Authentication**: WordPress user authentication via cookies/tokens
2. **Authorization**: Role-based permission checking (`manage_options` for admin)
3. **Routing**: WordPress REST API routing to custom endpoints
4. **Validation**: Input validation and sanitization
5. **Business Logic**: Event and registration management
6. **Persistence**: Database operations through WordPress WPDB
7. **Response**: JSON responses with proper HTTP status codes

### Database Operations

The persistence layer provides:
- **Connection**: Uses WordPress `$wpdb` global
- **Table Management**: Creates and manages custom tables
- **Data Types**: Proper type conversion for API responses
- **Transactions**: Atomic operations for data integrity
- **Error Handling**: Comprehensive error logging

## Frontend Architecture

### Technology Stack

- **React 18**: Component-based UI framework
- **TypeScript**: Type safety and developer experience
- **React Router**: Client-side routing with hash router
- **PrimeReact**: Professional UI component library
- **EditorJS**: Rich text editing for event descriptions

### Component Structure

```
src/
├── App.tsx                    # Main application component
├── components/                # Reusable UI components
│   ├── Spinner.tsx           # Loading indicator
│   └── ...
├── routes/                    # Page-level route components
│   ├── EventsListRoute.tsx   # Events listing page
│   ├── EventRoute.tsx        # Event detail page
│   ├── NewEventRoute.tsx     # Create event form
│   └── EditEventRoute.tsx    # Edit event form
├── hooks/                     # Custom React hooks
│   ├── useWhoAmI.ts          # User authentication hook
│   └── ...
├── context/                   # React context providers
│   ├── UserContext.tsx       # User state management
│   └── ToastContext.tsx      # Notification system
├── types.ts                   # TypeScript type definitions
├── rest.ts                    # API client configuration
├── utils.ts                   # Utility functions
└── messages.ts                # Internationalization strings
```

### State Management

- **User Context**: Global user authentication state
- **Toast Context**: Application-wide notifications
- **Local State**: Component-level state with React hooks
- **API State**: RESTful data fetching with custom hooks

### Routing Strategy

Uses Hash Router for compatibility with WordPress:
- `#/` - Events list
- `#/event/:id` - Event details
- `#/event/:id/edit` - Edit event (admin)
- `#/new-event` - Create event (admin)

## Database Schema

### Tables

#### Events Table (`wp_gtevents_events`)
```sql
CREATE TABLE wp_gtevents_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_description TEXT,
    description LONGTEXT,
    time BIGINT,                    -- Unix timestamp
    max_people INT,
    people INT DEFAULT 0,           -- Current registrations
    visible TINYINT DEFAULT 1,
    registration_end BIGINT,        -- Registration deadline
    image TEXT,                     -- Image URL
    bank_code VARCHAR(50),
    prefix VARCHAR(20),
    swift VARCHAR(20),
    iban VARCHAR(50),
    account_number VARCHAR(50)
);
```

#### Registration Groups (`wp_gtevents_registration_group`)
```sql
CREATE TABLE wp_gtevents_registration_group (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT,
    reg_time BIGINT,                -- Registration timestamp
    people INT,                     -- Group size
    paid TINYINT DEFAULT 0,
    price INT,                      -- Total price in cents
    FOREIGN KEY (event_id) REFERENCES wp_gtevents_events(id)
);
```

#### Registrations (`wp_gtevents_registrations`)
```sql
CREATE TABLE wp_gtevents_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT,
    name VARCHAR(255),
    email VARCHAR(255),
    date_of_birth BIGINT,
    sex VARCHAR(10),
    address TEXT,
    club VARCHAR(255),
    gdpr TINYINT DEFAULT 0,
    is_leader TINYINT DEFAULT 0,
    registration_type_name VARCHAR(100),
    FOREIGN KEY (group_id) REFERENCES wp_gtevents_registration_group(id)
);
```

#### Error Logging (`wp_gtevents_errors`)
```sql
CREATE TABLE wp_gtevents_errors (
    time BIGINT,
    msg TEXT
);
```

#### API Keys (`wp_gtevents_keys`)
```sql
CREATE TABLE wp_gtevents_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    key_name VARCHAR(255),
    key_value TEXT
);
```

### Relationships

- One Event → Many Registration Groups
- One Registration Group → Many Individual Registrations
- Registration Groups track payment status collectively
- Individual registrations store personal data

## API Design

### Authentication

- **Cookie-based**: Leverages WordPress session cookies
- **Capability Check**: `manage_options` for admin operations
- **CSRF Protection**: WordPress nonces for state-changing operations

### Endpoints

Base namespace: `/wp-json/gtevents/v1/`

#### Public Endpoints
- `GET /events` - List public events
- `GET /events/{id}` - Get event details
- `POST /registrations` - Register for event

#### Admin Endpoints
- `POST /events` - Create event
- `PUT /events/{id}` - Update event
- `GET /registrations` - List all registrations
- `PUT /registrations/{id}` - Update registration status

### Response Format

All responses follow a consistent JSON structure:
```json
{
    "success": true|false,
    "data": {...},
    "message": "Optional message",
    "error": "Error details if failed"
}
```

### Error Handling

- **HTTP Status Codes**: Proper REST status codes
- **Error Logging**: All errors logged to custom table
- **User-Friendly Messages**: Translated error messages for UI
- **Developer Information**: Detailed error info in development mode

## Build System

### Build Process (`build.sh`)

1. **Version Management**: Auto-increment version numbers
2. **Dependency Installation**: `yarn install` for frontend dependencies
3. **Frontend Build**: Compile React app with `yarn bundleProd`
4. **Asset Processing**: Optimize and prepare static assets
5. **Plugin Packaging**: Create distributable ZIP file
6. **Cleanup**: Remove development artifacts

### Environment Configuration

- **MAIL_API_KEY**: Email service integration (injected at build time)
- **Plugin Version**: Synchronized across all files
- **Development vs Production**: Different build targets

### Deployment

The build system produces a `gladiatortraining-registrations.zip` file containing:
- All PHP files
- Compiled frontend assets
- WordPress plugin headers
- Required dependencies

## Security Model

### Input Validation

- **Sanitization**: All input sanitized using WordPress functions
- **Validation**: Type checking and format validation
- **Escaping**: Output properly escaped for display

### Authorization

- **Role-Based**: WordPress capability system (`manage_options`)
- **Endpoint Protection**: Admin endpoints require authentication
- **Data Access**: Users can only access their own registration data

### Data Protection

- **GDPR Compliance**: Consent tracking and data export capabilities
- **SQL Injection**: Prepared statements and WordPress WPDB
- **XSS Prevention**: Proper output escaping and Content Security Policy
- **CSRF Protection**: WordPress nonces for state changes

### Best Practices

- No direct database queries without sanitization
- Capability checks before sensitive operations
- Proper error handling without information disclosure
- Regular security updates through WordPress ecosystem