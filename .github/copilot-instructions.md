# Gladiator Training Registrations WordPress Plugin

WordPress plugin for event registrations with a React/TypeScript frontend and PHP REST API backend.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites
- Node.js v20+ (current system has v20.19.5)
- Yarn v1.22+ (current system has v1.22.22) 
- PHP for WordPress environment
- MAIL_API_KEY environment variable for building releases

### Bootstrap and Build Process
- Navigate to frontend directory: `cd frontend`
- Install frontend dependencies: `yarn install` - takes 2-5 minutes. NEVER CANCEL. Set timeout to 10+ minutes.
  - **NOTE**: May fail due to network connectivity issues with Oracle container registry
  - **FALLBACK**: Use `npm install` if yarn fails - takes 5-15 minutes. NEVER CANCEL. Set timeout to 30+ minutes.
- Build for development: `yarn bundle` - takes 1-3 minutes
- Build for production: `yarn bundleProd` - takes 1-3 minutes
- **Full plugin build**: `MAIL_API_KEY='placeholder' ./build.sh` - takes 5-10 minutes total. NEVER CANCEL. Set timeout to 20+ minutes.

### Development Workflow
- Start development server: `cd frontend && yarn start` - starts React dev server on localhost:3000
- Run linting: `cd frontend && yarn lint` - validates code style and catches errors
- Fix linting issues: `cd frontend && yarn lint:fix` - automatically fixes fixable linting issues
- Run tests: `cd frontend && yarn test` - runs React test suite

### Build Validation
- ALWAYS run `cd frontend && yarn lint` before committing changes or CI will fail
- ALWAYS test the build process with `yarn bundleProd` after making frontend changes
- The build.sh script requires MAIL_API_KEY environment variable but will work with placeholder value for testing

## Project Structure

### Key Directories
- `/`: Root contains main plugin PHP file and build script
- `frontend/`: React/TypeScript application source and build configuration
- `includes/`: PHP REST API route classes and utilities
- `admin/`: WordPress admin interface PHP files  
- `public/`: Public-facing WordPress plugin assets
- `languages/`: Internationalization files

### Important Files
- `gladiatortraining-registrations.php`: Main WordPress plugin file with hooks and shortcode
- `build.sh`: Build script that increments version, builds frontend, and creates ZIP distribution
- `frontend/package.json`: React app dependencies and build scripts
- `frontend/src/`: React/TypeScript source code
- `includes/*.php`: PHP REST API route implementations

### Common File Locations
```
gladiatortraining-registrations/
├── gladiatortraining-registrations.php  # Main plugin file
├── build.sh                             # Build script
├── frontend/
│   ├── package.json                     # Frontend dependencies
│   ├── src/                             # React/TypeScript source
│   ├── public/                          # Static assets
│   └── build/                           # Built frontend assets
├── includes/                            # PHP REST API routes
├── admin/                               # WordPress admin interface
└── public/                              # Public plugin assets
```

## Validation Scenarios

### Manual Testing Requirements
After making changes to the plugin, ALWAYS test these scenarios:

**Frontend Development Testing:**
1. Start the development server: `cd frontend && yarn start`
2. Verify the React application loads without console errors
3. Test basic navigation and UI interactions

**WordPress Plugin Testing:**
1. Build the plugin: `MAIL_API_KEY='test' ./build.sh`
2. Verify the ZIP file is created: `ls -la gladiatortraining-registrations.zip`
3. Test that built frontend assets exist: `ls -la frontend/build/static/`

**Code Quality Testing:**
1. Run linting: `cd frontend && yarn lint` - must pass with no errors
2. Run tests: `cd frontend && yarn test` - verify all tests pass
3. Check TypeScript compilation: `cd frontend && npx tsc --noEmit`

### Known Limitations
- **Network Dependencies**: yarn/npm install may fail due to corporate firewall or network issues with Oracle container registry
- **WordPress Environment**: Cannot fully test WordPress integration without a local WordPress setup
- **Database Dependencies**: Plugin requires WordPress database for full functionality testing

## Troubleshooting

### Build Issues
- If `yarn install` fails with network errors, try `npm install` instead
- If build takes longer than expected, wait - network issues can cause delays
- Always use placeholder MAIL_API_KEY for testing: `MAIL_API_KEY='placeholder' ./build.sh`

### Development Issues  
- React dev server conflicts: Check if port 3000 is available
- TypeScript errors: Run `cd frontend && npx tsc --noEmit` to see full error details
- Linting failures: Use `yarn lint:fix` to automatically fix many issues

### Performance Notes
- Frontend dependency installation: 2-30 minutes depending on network
- Frontend builds: 1-3 minutes typically  
- Full plugin build: 5-10 minutes total
- Development server startup: 30-60 seconds

## Quick Reference Commands

### Repository Validation (Always Works)
```bash
# Verify project structure
ls -la gladiatortraining-registrations.php
ls -la frontend/package.json
ls -la build.sh

# Check TypeScript configuration
cd frontend && npx tsc --noEmit --showConfig

# View available frontend scripts
cd frontend && cat package.json | grep -A 10 '"scripts"'

# Check PHP files structure  
find . -name "*.php" | head -10
```

### Frontend Commands (Require Dependencies)
```bash
cd frontend

# Development
yarn start                    # Dev server on localhost:3000
yarn bundle                   # Development build
yarn bundleProd               # Production build  

# Quality Assurance
yarn lint                     # Check code style
yarn lint:fix                 # Fix linting issues
yarn test                     # Run test suite
npx tsc --noEmit             # TypeScript compilation check
```

### Build Commands
```bash
# Test build script structure (will fail at yarn install)
MAIL_API_KEY='placeholder' ./build.sh

# Full build (requires network access)  
MAIL_API_KEY='your-key' ./build.sh
```

## Common Tasks

The following are outputs from frequently run commands. Reference them instead of viewing, searching, or running bash commands to save time.

### Repository Root Structure
```
$ ls -la /
.git
.gitignore                              # Excludes node_modules, build artifacts
LICENSE.txt                             # GPL-2.0+ license
README.md                               # Basic setup instructions
admin/                                  # WordPress admin interface
build.sh                                # Build script - requires MAIL_API_KEY
frontend/                               # React/TypeScript application
gladiatortraining-registrations.php    # Main WordPress plugin file
includes/                               # PHP REST API routes
index.php                               # WordPress security file
languages/                              # Translation files
public/                                 # Public plugin assets
uninstall.php                          # Plugin cleanup on uninstall
```

### Frontend Directory Structure  
```
$ ls -la frontend/
.eslintrc.json                          # ESLint configuration
.prettierrc.json                        # Prettier code formatting
README.md                               # Empty frontend docs
build_fix.js                            # Post-build script for development
build_fix_prod.js                       # Post-build script for production  
craco.config.js                         # Create React App configuration override
custom.d.ts                             # TypeScript declarations
package.json                            # Dependencies and scripts
public/                                 # Static assets
src/                                    # React/TypeScript source code
tsconfig.json                          # TypeScript configuration
yarn.lock                              # Yarn dependency lock file
```

### Key Frontend Scripts (from package.json)
```json
{
  "scripts": {
    "start": "react-scripts start",
    "bundle": "craco build && node build_fix.js",
    "bundleProd": "craco build && node build_fix_prod.js", 
    "test": "react-scripts test",
    "lint": "eslint --cache \"{src,uitest,unittest}/**/*.{js,jsx,ts,tsx}\" --quiet",
    "lint:fix": "eslint --fix \"{src,uitest,unittest}/**/*.{js,jsx,ts,tsx}\"",
    "eject": "react-scripts eject"
  }
}
```

### PHP API Routes (includes/)
```
ApiKeysRoute.php                        # API key management endpoint
BaseRoute.php                           # Base class for all routes  
ErrorsRoute.php                         # Error logging endpoint
EventRoute.php                          # Single event CRUD operations
EventsRoute.php                         # Events listing endpoint
MailRoute.php                           # Email sending functionality
RegisteredUserRoute.php                 # User registration endpoint
RegistrationGroupRoute.php              # Group registration handling
RegistrationsRoute.php                  # Registration CRUD operations
UserRoute.php                           # User management endpoint
```

## Critical Reminders
- **NEVER CANCEL** long-running yarn/npm install commands - they may take 30+ minutes
- **ALWAYS** run linting before committing or CI will fail
- **ALWAYS** test the build process after frontend changes
- Set timeouts of 30+ minutes for dependency installation, 10+ minutes for builds
- Use `MAIL_API_KEY='placeholder'` for testing builds when API key not available
- **NETWORK ISSUES**: This environment has known connectivity issues with Oracle container registry
- Always validate commands in the "Repository Validation" section work before attempting builds