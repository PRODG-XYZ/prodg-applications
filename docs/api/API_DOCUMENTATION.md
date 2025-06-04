# Applicant Dashboard API Documentation

This document provides an overview of the Applicant Dashboard API endpoints and how to use them.

## API Documentation

A complete API documentation is available in the application using the Swagger/OpenAPI specification. You can access it in two ways:

1. **API Debug Sidebar**: In development mode, you can use the API Debug sidebar by pressing `Ctrl+Shift+A` to toggle it. This provides a quick reference to all available endpoints.

2. **Full Documentation Page**: Visit `/swagger` in the application to see the complete API documentation with all details.

## Authentication

The API uses magic link email-based authentication. All secured endpoints require a valid session cookie.

### Authentication Flow

1. Request a magic link via `/api/applicant/auth/request-access`
2. User receives email with magic link containing a token
3. When the user clicks the link, the token is verified via `/api/applicant/auth/verify`
4. Upon successful verification, a session cookie is set
5. The session is valid for 7 days or until logout

## Available Endpoints

### Authentication
- `POST /api/applicant/auth/request-access` - Request magic link
- `GET /api/applicant/auth/verify?token=<token>` - Verify magic link
- `POST /api/applicant/auth/logout` - Clear session

### Application Management
- `GET /api/applicant/application` - Get application data
- `PATCH /api/applicant/application` - Update application (pending status only)

### Communication
- `GET /api/applicant/communications` - Get messages
- `POST /api/applicant/communications` - Send message

## Response Format

All API endpoints return responses in JSON format. Successful responses typically include the requested data, while error responses include an `error` field with a description of the error.

### Success Response Example
```json
{
  "success": true,
  "message": "Magic link sent successfully"
}
```

### Error Response Example
```json
{
  "error": "Application not found"
}
```

## Security Considerations

- All API endpoints are protected against CSRF attacks
- Input validation is performed on all endpoints
- Rate limiting is applied to prevent abuse
- Authentication tokens are cryptographically secure

## Development

The API documentation is built using the OpenAPI 3.0 specification. The specification file is located at `/swagger.yaml` in the project root.

To view the documentation during development:
1. Start the development server with `pnpm dev`
2. Press `Ctrl+Shift+A` to open the API Debug sidebar
3. Or visit `http://localhost:3000/swagger` for the full documentation 