# XcySound Music Streaming Platform

A full-featured music streaming platform with preview functionality and e-commerce integration.

## Features

- **User Management**: Secure registration, login, and profile management
- **Dual-Mode Music Player**: Preview mode for all users, full streaming for purchasers
- **E-commerce Integration**: Stripe payment processing with shopping cart
- **Admin Dashboard**: Content management, analytics, and user administration
- **Search & Discovery**: Advanced search by title, artist, genre
- **Responsive Design**: Optimized for desktop, tablet, and mobile

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Stripe Payment Processing
- Multer for file uploads
- bcryptjs for password hashing

### Frontend
- React.js
- React Router for navigation
- Axios for API calls
- Stripe.js for payments
- React Context for state management

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm run install-all
   ```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update with your database and Stripe credentials

4. Create upload directories:
   ```bash
   mkdir -p server/uploads/audio server/uploads/previews server/uploads/artwork
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `CLIENT_URL`: Frontend URL (for CORS)

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Music
- `GET /api/music` - Get all tracks (public)
- `GET /api/music/:id` - Get track details
- `GET /api/music/:id/preview` - Stream preview
- `GET /api/music/:id/stream` - Stream full track (requires purchase)
- `GET /api/music/search/:query` - Search tracks

### Payments
- `POST /api/payments/cart/add` - Add track to cart
- `GET /api/payments/cart` - Get cart contents
- `POST /api/payments/create-payment-intent` - Create Stripe payment
- `POST /api/payments/confirm-payment` - Confirm purchase

### Admin
- `GET /api/admin/dashboard/stats` - Dashboard analytics
- `POST /api/admin/tracks` - Upload new track
- `PUT /api/admin/tracks/:id` - Update track
- `DELETE /api/admin/tracks/:id` - Delete track

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update profile
- `GET /api/user/library` - Get purchased tracks

## File Structure

```
├── client/                 # React frontend
├── server/
│   ├── index.js           # Main server file
│   ├── middleware/        # Authentication middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   └── uploads/          # File storage
└── package.json          # Dependencies and scripts
```

## Admin Access

To create an admin user, manually update the user's role in the database:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## License

MIT License
