# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a WordPress plugin called "gladiatortraining-registrations" for event registration management. The project combines PHP backend (WordPress plugin architecture) with a React TypeScript frontend.

## Build and Development Commands

### Building the Plugin
```bash
MAIL_API_KEY='your_api_key' ./build.sh
```
- Increments version number automatically
- Installs frontend dependencies via `yarn install`
- Builds React frontend via `yarn bundleProd`
- Creates distributable ZIP file
- Requires MAIL_API_KEY environment variable

### Frontend Development
```bash
cd frontend
yarn install          # Install dependencies
yarn start            # Development server
yarn bundle           # Development build
yarn bundleProd       # Production build (used by build.sh)
yarn lint             # ESLint check
yarn lint:fix         # ESLint with auto-fix
yarn test             # Run tests
```

## Architecture

### WordPress Plugin Structure
- **Main file**: `gladiatortraining-registrations.php` - Plugin bootstrap and registration
- **includes/**: Core plugin classes and REST API routes
- **admin/**: WordPress admin interface components
- **public/**: Public-facing WordPress functionality
- **languages/**: Translation files

### REST API Routes (includes/)
The plugin exposes REST endpoints via various route classes:
- `UserRoute.php` - User management
- `EventsRoute.php` / `EventRoute.php` - Event management
- `RegistrationsRoute.php` - Registration handling
- `RegistrationGroupRoute.php` - Group registrations
- `MailRoute.php` - Email functionality
- `RegisteredUserRoute.php` - Registered user operations
- `ApiKeysRoute.php` - API key management
- `ErrorsRoute.php` - Error logging

### Frontend Architecture (frontend/)
React TypeScript application built with Create React App:
- **components/**: React components
- **routes/**: Route components for different pages
- **hooks/**: Custom React hooks
- **context/**: React context providers
- **types.ts**: TypeScript type definitions
- **rest.ts**: API communication layer
- Uses PrimeReact UI library
- Uses EditorJS for rich text editing

### Key Files
- `Persistance.php`: Database operations and data persistence
- `MailService.php`: Email handling functionality
- `Utils.php`: General utility functions
- `frontend/src/App.tsx`: Main React application component
- `frontend/src/rest.ts`: REST API client

## Installation
1. Upload plugin ZIP to WordPress
2. Create WordPress page with shortcode: `[gladiatortraining_registrations_app]`

## Version Management
- Version numbers are automatically managed by `build.sh`
- Current version stored in main PHP file
- Build script updates version in multiple locations