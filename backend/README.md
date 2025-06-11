# Safe Transfer Backend

A comprehensive backend API for the Safe Transfer Escrow Platform built with Node.js, Express, and MongoDB.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (User/Admin)
  - Account lockout protection
  - Password reset functionality

- **Deal Management**
  - Create and manage escrow deals
  - Multi-step workflow tracking
  - Real-time messaging between parties
  - Document upload and verification

- **KYC Verification**
  - Personal and business KYC
  - Document upload and verification
  - Admin review and approval system

- **Admin Dashboard**
  - Deal monitoring and flagging
  - KYC review and approval
  - User management
  - Analytics and reporting

- **Security Features**
  - Rate limiting
  - Input validation and sanitization
  - File upload security
  - CORS protection
  - Helmet security headers

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **SMS**: Twilio
- **Validation**: Joi & Express-validator
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 5000) |
| `NODE_ENV` | Environment | No (default: development) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |
| `EMAIL_USER` | Email service username | No |
| `EMAIL_PASSWORD` | Email service password | No |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | No |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | No |
| `TWILIO_PHONE_NUMBER` | Twilio phone number | No |

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/verify-phone` - Phone verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/refresh-token` - Token refresh

### Deals
- `GET /api/deals` - Get user deals
- `POST /api/deals` - Create new deal
- `GET /api/deals/:id` - Get deal details
- `POST /api/deals/:id/accept` - Accept deal
- `POST /api/deals/:id/messages` - Add message
- `POST /api/deals/:id/cancel` - Cancel deal

### KYC
- `GET /api/kyc/status` - Get KYC status
- `POST /api/kyc/upload` - Upload KYC document
- `PUT /api/kyc/personal-info` - Update personal info
- `PUT /api/kyc/business-info` - Update business info
- `POST /api/kyc/submit` - Submit KYC for review

### Admin
- `GET /api/admin/dashboard` - Admin dashboard data
- `GET /api/admin/flagged-deals` - Get flagged deals
- `GET /api/admin/kyc-reviews` - Get KYC reviews
- `POST /api/admin/kyc/:kycId/:action` - Review KYC
- `POST /api/admin/deals/:dealId/:action` - Review deal

## Database Schema

### User Model
- Personal and business user support
- KYC status tracking
- Bank account management
- Security features (login attempts, account locking)

### Deal Model
- Complete escrow workflow tracking
- Multi-party messaging
- Document management
- Dispute handling

### KYC Model
- Personal and business verification
- Document upload and verification
- Risk assessment
- Audit trail

## Security Features

1. **Authentication & Authorization**
   - JWT tokens with expiration
   - Role-based access control
   - Account lockout after failed attempts

2. **Input Validation**
   - Request validation using Joi and express-validator
   - File upload restrictions
   - SQL injection prevention

3. **Rate Limiting**
   - Global and endpoint-specific rate limits
   - Brute force protection

4. **Data Protection**
   - Password hashing with bcrypt
   - Sensitive data encryption
   - CORS configuration

## File Upload

- Supports PDF, JPG, PNG files
- Maximum file size: 10MB
- Files stored in `/uploads` directory
- Automatic file validation and security checks

## Error Handling

- Centralized error handling middleware
- Structured error responses
- Detailed logging for debugging
- User-friendly error messages

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Database Seeding
```bash
npm run seed
```

## Deployment

1. **Environment Setup**
   - Set `NODE_ENV=production`
   - Configure production database
   - Set up email and SMS services

2. **Security Checklist**
   - Change default JWT secret
   - Enable HTTPS
   - Configure firewall rules
   - Set up monitoring

3. **Performance**
   - Enable compression
   - Configure caching
   - Database indexing
   - CDN for file uploads

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.