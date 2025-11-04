# NIBOG Platform

NIBOG Platform is India's premier children's event platform designed for discovering, booking, and managing engaging games and events for children aged 5 months to 12 years across various cities in India. The platform connects parents seeking high-quality, age-appropriate activities with meticulously organized events managed directly by NIBOG administrators.

![NIBOG Platform](public/placeholder-logo.svg)

## 🌟 Features

### For Parents
- **Age-Appropriate Event Discovery**: Find events suitable for your child's age (5 months - 12 years)
- **City-Based Filtering**: Browse events in your city with intuitive city selection
- **Seamless Booking Process**: Easy registration and secure payment system
- **Child Profile Management**: Add and manage multiple children profiles
- **Booking Dashboard**: View upcoming and past bookings, download tickets
- **Review System**: Share your experience after attending events

### For Administrators
- **Comprehensive Event Management**: Create, update, and manage events across multiple cities
- **Flexible Scheduling**: Configure time slots, pricing, and capacity
- **Booking Management**: Track and manage participant bookings
- **Attendance Tracking**: Scan QR codes for event entry and add-on collection
- **Analytics Dashboard**: Monitor revenue, bookings, and attendance statistics
- **Certificate Generation**: Create and distribute certificates to participants

## 🚀 Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: Tailwind CSS, Shadcn UI, Radix UI, Framer Motion
- **State Management**: React Context API
- **Forms**: React Hook Form with Zod validation
- **Authentication**: NextAuth.js
- **API Integration**: RESTful API with fetch
- **Styling**: Tailwind CSS with custom configurations
- **Deployment**: Vercel (or your preferred hosting platform)

## 📁 Project Structure

```
nibog-platform/
├── app/                    # Next.js app directory
│   ├── (main)/             # Main user-facing routes
│   ├── admin/              # Admin panel routes
│   ├── dashboard/          # User dashboard routes
│   └── ...                 # Other app routes
├── components/             # Reusable React components
│   ├── admin/              # Admin-specific components
│   ├── ui/                 # UI components (buttons, forms, etc.)
│   └── ...                 # Other components
├── lib/                    # Utility functions and helpers
├── hooks/                  # Custom React hooks
├── public/                 # Static assets
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
├── schema/                 # Database schema and models
└── ...                     # Configuration files
```

## 🔧 Installation and Setup

### Prerequisites
- Node.js 18.0 or higher
- pnpm (recommended) or npm

### Installation Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/BollineniRohith123/nibog-platform.git
   cd nibog-platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # Base URL
   NEXT_PUBLIC_API_URL=your_api_url
   
   # Authentication
   NEXTAUTH_URL=http://localhost:3111
   NEXTAUTH_SECRET=your_secret_key
   
   # Database
   DATABASE_URL=your_database_url
   
   # Payment Gateway (if applicable)
   PAYMENT_GATEWAY_API_KEY=your_payment_gateway_key
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3111](http://localhost:3111) in your browser to see the application.

## 📖 Usage

### For Parents

1. **Select Your City**: Choose your city from the dropdown menu
2. **Browse Events**: Explore events filtered by your city
3. **Select Child's Age**: Filter events based on your child's age
4. **View Event Details**: Click on an event to see detailed information
5. **Book an Event**: Select a time slot and complete the booking process
6. **Manage Bookings**: Access your dashboard to view and manage bookings

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin` and log in with admin credentials
2. **Manage Cities and Venues**: Add and manage cities and venues
3. **Create Events**: Set up new events with games, slots, and pricing
4. **Monitor Bookings**: Track bookings and attendance
5. **Generate Reports**: Access analytics and export data
6. **Manage Users**: View and manage user accounts

## 📚 API Documentation

The NIBOG Platform provides comprehensive API documentation for both the user-facing application and the admin panel:

- [Application API Documentation](application-api-documentation.md): Endpoints for user authentication, event discovery, booking management, and more.
- [Admin Panel API Documentation](admin-panel-api-documentation.md): Endpoints for event management, bookings, analytics, and administrative functions.

## 🤝 Contributing

We welcome contributions to the NIBOG Platform! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Contact

For any questions or support, please contact us at support@nibog.com.

---

© 2025 NIBOG - India's Premier Children's Event Platform
