# Test API

A NestJS-based REST API for managing expenses with user authentication, expense tracking, and report generation capabilities.

## Features

- **User Authentication**: JWT-based authentication with register and login endpoints
- **Expense Management**: Create, read, update, and delete expenses with pagination and filtering
- **Report Generation**: Generate expense reports by category in JSON, PDF, and Excel formats
- **API Documentation**: Interactive Swagger/OpenAPI documentation
- **PostgreSQL Database**: Robust data persistence with TypeORM
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT with Passport
- **Validation**: class-validator and class-transformer
- **Documentation**: Swagger/OpenAPI
- **Report Generation**: PDFKit and ExcelJS
- **Testing**: Jest

## Prerequisites

- Node.js 20 or higher
- PostgreSQL 16 (or use Docker)
- npm or yarn

## Getting Started

### Option 1: Run with Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-api
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the values as needed (defaults work with Docker).

3. **Build and run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api

5. **View logs**
   ```bash
   docker-compose logs -f
   ```

6. **Stop the application**
   ```bash
   docker-compose down
   ```

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd test-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up PostgreSQL database**
   - Install PostgreSQL if not already installed
   - Create a database named `test_api` (or your preferred name)

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your local database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_DATABASE=test_api
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   PORT=3000
   ```

5. **Run the application**
   ```bash
   # Development mode with hot reload
   npm run start:dev

   # Production mode
   npm run build
   npm run start:prod
   ```

6. **Access the application**
   - API: http://localhost:3000
   - Swagger Documentation: http://localhost:3000/api

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register a new user | No |
| POST | `/auth/login` | Login with credentials | No |

### Expenses

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/expenses` | Get all expenses (paginated) | Yes |
| GET | `/expenses/:id` | Get expense by ID | Yes |
| POST | `/expenses` | Create a new expense | Yes |
| PATCH | `/expenses/:id` | Update an expense | Yes |
| DELETE | `/expenses/:id` | Delete an expense | Yes |

### Reports

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/expenses/reports/category` | Get category report (JSON) | Yes |
| GET | `/expenses/reports/category/pdf` | Download category report as PDF | Yes |
| GET | `/expenses/reports/category/excel` | Download category report as Excel | Yes |

**Report Query Parameters:**
- `startDate` (optional): Start date for report (YYYY-MM-DD)
- `endDate` (optional): End date for report (YYYY-MM-DD)

## Usage Example

### 1. Register a new user
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response includes an `access_token` for authenticated requests.

### 3. Create an expense
```bash
curl -X POST http://localhost:3000/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "description": "Office supplies",
    "amount": 150.00,
    "category": "Office",
    "date": "2025-11-14"
  }'
```

### 4. Get expenses with filters
```bash
curl -X GET "http://localhost:3000/expenses?page=1&limit=10&category=Office" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Download expense report
```bash
# PDF Report
curl -X GET "http://localhost:3000/expenses/reports/category/pdf?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output report.pdf

# Excel Report
curl -X GET "http://localhost:3000/expenses/reports/category/excel?startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output report.xlsx
```

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode

# Build
npm run build              # Build the project

# Production
npm run start:prod         # Run production build

# Testing
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Lint code
npm run format             # Format code with Prettier
```

### Project Structure

```
test-api/
├── src/
│   ├── authentication/    # Authentication module (JWT, guards, strategies)
│   ├── user/             # User module (user entity, service, controller)
│   ├── expense/          # Expense module (expense entity, service, controller)
│   ├── utils/            # Utility functions (pagination, etc.)
│   ├── app.module.ts     # Root application module
│   └── main.ts           # Application entry point
├── test/                 # E2E tests
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Docker image configuration
├── .env.example         # Environment variables template
└── package.json         # Project dependencies
```

## Docker Commands

```bash
# Build and start all services
docker-compose up -d

# Build without cache
docker-compose build --no-cache

# View logs
docker-compose logs -f app        # App logs only
docker-compose logs -f postgres   # Database logs only

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Stop and remove containers with volumes (deletes database data)
docker-compose down -v

# Rebuild and restart
docker-compose up -d --build
```

## Testing

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run end-to-end tests
npm run test:e2e
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | 3000 |
| `DB_HOST` | PostgreSQL host | localhost (postgres in Docker) |
| `DB_PORT` | PostgreSQL port | 5432 |
| `DB_USERNAME` | Database username | postgres |
| `DB_PASSWORD` | Database password | postgres |
| `DB_DATABASE` | Database name | test_api |
| `JWT_SECRET` | JWT secret key | (required) |
| `JWT_EXPIRES_IN` | JWT expiration time | 24h |

## API Documentation

Once the application is running, visit http://localhost:3000/api to access the interactive Swagger documentation. You can:
- View all available endpoints
- Test API requests directly from the browser
- See request/response schemas
- Authenticate using the "Authorize" button with your JWT token

## Troubleshooting

### Docker Issues

**Port already in use:**
```bash
# Change the port in .env file
PORT=3001
```

**Database connection failed:**
```bash
# Restart containers
docker-compose restart

# Check database logs
docker-compose logs postgres
```

### Local Development Issues

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `createdb test_api`

**Module not found errors:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## License

This project is [MIT licensed](LICENSE).

## Support

For questions and support, please open an issue in the repository.
