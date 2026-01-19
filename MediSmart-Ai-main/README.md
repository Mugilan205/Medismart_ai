# MediSmart AI - Intelligent Medicine Delivery Platform

## 📋 Project Overview

MediSmart AI is a comprehensive full-stack web application that revolutionizes the pharmaceutical delivery experience. It combines **AI-powered features**, **prescription management**, and **real-time delivery tracking** to create a seamless platform for customers to order medicines and pharmacies to manage their operations.

The platform serves three main user types:

- **Customers**: Browse medicines, upload prescriptions, place orders, and track deliveries
- **Pharmacies**: Manage inventory, process orders, and handle fulfillment
- **Delivery Agents**: Track and manage deliveries in real-time

---

## 🚀 Key Features

### 👥 User Features

- **User Authentication**: Secure registration and login system
- **Medicine Catalog**: Browse and search medicines with detailed information
- **Prescription Upload**: AI-powered prescription image recognition using OCR
- **Order Management**: Place and track medicine orders in real-time
- **AI Chat Support**: Interactive chatbot for medicine inquiries and support
- **Delivery Tracking**: Real-time dashboard to track medicine deliveries
- **User Profile**: Manage personal information and order history

### 💊 Pharmacy Features

- **Pharmacy Dashboard**: Complete control center for pharmacy operations
- **Inventory Management**: Add, update, and manage medicine stock
- **Order Processing**: View and process customer orders
- **Delivery Management**: Assign and track deliveries
- **Analytics**: View sales, orders, and performance metrics
- **Pharmacy Registration**: Secure registration for pharmacy businesses

### 📦 Delivery Features

- **Delivery Dashboard**: Real-time view of assigned deliveries
- **Route Optimization**: Efficient delivery management
- **Status Updates**: Live delivery status tracking
- **Customer Location**: Integration with location services

---

## 🛠️ Technology Stack

### Frontend

- **React.js**: Component-based UI framework
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Socket.IO Client**: Real-time communication
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing
- **Context API**: State management for authentication

### Backend

- **Node.js & Express.js**: Server runtime and web framework
- **MongoDB**: NoSQL database for data persistence
- **Socket.IO**: Real-time bidirectional communication
- **JWT (JSON Web Tokens)**: Secure authentication mechanism
- **Tesseract OCR**: Prescription image text recognition
- **Python Integration**: Script processing for OCR tasks

### Key Libraries & Tools

- **Multer**: File upload handling
- **bcryptjs**: Password hashing
- **dotenv**: Environment variable management
- **Mongoose**: MongoDB object modeling
- **Cors**: Cross-Origin Resource Sharing

---

## 📁 Project Structure

```
MediSmart-Ai/
├── client/                          # React Frontend
│   ├── public/
│   │   ├── index.html              # HTML entry point
│   │   └── manifest.json           # PWA manifest
│   ├── src/
│   │   ├── api.js                  # API client configuration
│   │   ├── socket.js               # Socket.IO client setup
│   │   ├── App.js                  # Main app component
│   │   ├── index.js                # React entry point
│   │   ├── index.css               # Global styles
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Layout.js           # Main layout wrapper
│   │   │   ├── ProtectedRoute.js   # Auth route protection
│   │   │   ├── Header.js           # Navigation header
│   │   │   ├── Footer.js           # Footer component
│   │   │   ├── AuthLayout.js       # Auth page layout
│   │   │   ├── common/
│   │   │   │   └── Spinner.js      # Loading spinner
│   │   │   ├── medicines/
│   │   │   │   └── MedicineCard.js # Medicine display card
│   │   │   └── pharmacy/           # Pharmacy-specific components
│   │   │       ├── Analytics.js
│   │   │       ├── MedicineManagement.js
│   │   │       └── OrderManagement.js
│   │   ├── context/
│   │   │   └── AuthProvider.js     # Authentication context
│   │   └── pages/                  # Route pages
│   │       ├── HomePage.js         # Landing page
│   │       ├── LoginPage.js        # User login
│   │       ├── RegisterPage.js     # User registration
│   │       ├── MedicinesPage.js    # Medicine listing
│   │       ├── MedicineDetailPage.js
│   │       ├── OrderNowPage.jsx    # Order placement
│   │       ├── OrdersPage.js       # User's orders
│   │       ├── OrderDetailPage.js
│   │       ├── ProfilePage.js      # User profile
│   │       ├── ChatPage.js         # AI chat support
│   │       ├── UploadPrescriptionPage.js
│   │       ├── MyDeliveriesPage.js
│   │       ├── PharmacyLoginPage.js
│   │       ├── PharmacyRegisterPage.js
│   │       └── dashboard/
│   │           ├── PharmacyDashboardPage.js
│   │           └── DeliveryDashboardPage.js
│   └── package.json                # Frontend dependencies
│
├── server/                         # Express Backend
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   ├── models/                     # Database schemas
│   │   ├── User.js                 # Customer schema
│   │   ├── Pharmacy.js (implied)   # Pharmacy schema
│   │   ├── Medicine.js             # Medicine schema
│   │   ├── Order.js                # Order schema
│   │   ├── Prescription.js         # Prescription schema
│   │   └── Chat.js                 # Chat message schema
│   ├── routes/                     # API endpoints
│   │   ├── auth.js                 # Authentication routes
│   │   ├── users.js                # User management routes
│   │   ├── medicines.js            # Medicine routes
│   │   ├── orders.js               # Order routes
│   │   ├── delivery.js             # Delivery routes
│   │   ├── pharmacy.js             # Pharmacy routes
│   │   ├── chat.js                 # Chat routes
│   │   ├── prescriptions.js        # Prescription routes
│   │   ├── ai.js                   # AI features routes
│   │   └── test.js                 # Testing routes
│   ├── middleware/
│   │   └── auth.js                 # Authentication middleware
│   ├── utils/
│   │   └── aiServices.js           # AI service utilities
│   ├── scripts/
│   │   └── process_prescription.py # OCR processing script
│   ├── uploads/                    # File storage directory
│   ├── server.js                   # Main server file
│   ├── debug_routes.js             # Debugging utilities
│   ├── eng.traineddata             # Tesseract language data
│   └── package.json                # Backend dependencies

└── README.md                       # This file
```

---

## 📖 Core Components Explanation

### Authentication System (`AuthProvider.js`)

Manages user login state and authentication across the application using React Context API. Stores JWT tokens and user information in localStorage.

### Real-time Features (Socket.IO)

- **Bi-directional Communication**: Chat messages, order updates, delivery tracking
- **socket.js**: Client configuration for WebSocket connections
- Enables instant notifications for order status changes and new messages

### Prescription Processing

- **Image Upload**: Users upload prescription images (JPG, PNG)
- **OCR Recognition**: Tesseract OCR (`eng.traineddata`) extracts text from images
- **Python Integration**: `process_prescription.py` runs the OCR processing
- **Database Storage**: Processed prescriptions stored in MongoDB

### Payment & Order Flow

1. User uploads prescription or searches medicines
2. Adds medicines to cart and places order
3. Order stored in database with pending status
4. Pharmacy receives and processes order
5. Delivery agent assigned and tracking begins
6. Real-time updates sent via Socket.IO

### AI Chat Support (`ChatPage.js`)

- Conversational chatbot for medicine inquiries
- Powered by AI services (`aiServices.js`)
- Real-time message exchange using Socket.IO
- Chat history persisted in database

---

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Protected Routes**: `ProtectedRoute.js` restricts unauthorized access
- **CORS Configuration**: Prevents unauthorized cross-origin requests
- **Role-Based Access**: Different dashboards for users, pharmacies, and delivery agents
- **File Upload Validation**: Prescription file size and type validation

---

## 📊 Database Models

### User

```
- userId (ObjectId)
- email (String, unique)
- password (String, hashed)
- name (String)
- phone (String)
- address (Object)
- createdAt (Date)
- orders (Array of Order IDs)
```

### Medicine

```
- medicineId (ObjectId)
- name (String)
- description (String)
- price (Number)
- manufacturer (String)
- dosage (String)
- stock (Number)
- pharmacy (Reference to Pharmacy)
```

### Order

```
- orderId (ObjectId)
- userId (Reference to User)
- medicines (Array of medicines)
- totalPrice (Number)
- status (String: pending, confirmed, shipped, delivered)
- shippingAddress (Object)
- prescriptionId (Reference to Prescription)
- createdAt (Date)
```

### Prescription

```
- prescriptionId (ObjectId)
- userId (Reference to User)
- imageUrl (String)
- extractedText (String)
- status (String: processing, completed, failed)
- uploadedAt (Date)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas connection)
- npm or yarn
- Python 3.x (for OCR processing)

### Installation

#### Backend Setup

```bash
cd server
npm install
# Configure environment variables in .env
npm start
```

#### Frontend Setup

```bash
cd client
npm install
npm start
```

### Environment Variables (.env in server/)

```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
SOCKET_PORT=5001
NODE_ENV=development
```

---

## 🔄 API Endpoints Overview

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/pharmacy-register` - Pharmacy registration
- `POST /api/auth/pharmacy-login` - Pharmacy login

### Medicines

- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get medicine details
- `POST /api/medicines` - Add new medicine (pharmacy)
- `PUT /api/medicines/:id` - Update medicine (pharmacy)
- `DELETE /api/medicines/:id` - Delete medicine (pharmacy)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Prescriptions

- `POST /api/prescriptions/upload` - Upload prescription
- `GET /api/prescriptions` - Get user's prescriptions
- `POST /api/prescriptions/process` - Process prescription image

### Chat

- `POST /api/chat/message` - Send chat message
- `GET /api/chat/history` - Get chat history

### Delivery

- `GET /api/delivery/active` - Get active deliveries
- `PUT /api/delivery/:id/status` - Update delivery status

---

## 💡 Workflow Examples

### Customer Journey

1. **Registration**: Create account via `LoginPage.js`
2. **Browse**: Explore medicines on `MedicinesPage.js`
3. **Upload Prescription**: Use `UploadPrescriptionPage.js`
4. **Place Order**: Click order on `OrderNowPage.jsx`
5. **Track**: Monitor delivery on `MyDeliveriesPage.js`
6. **Support**: Chat with AI via `ChatPage.js`

### Pharmacy Journey

1. **Registration**: Register via `PharmacyRegisterPage.js`
2. **Manage Inventory**: Use `MedicineManagement.js`
3. **Dashboard**: Monitor operations on `PharmacyDashboardPage.js`
4. **Process Orders**: Manage orders in `OrderManagement.js`
5. **Analytics**: View metrics in `Analytics.js`

---

## 🧪 Testing

Run tests using:

```bash
npm test
```

Debug mode available via:

```bash
node server/debug_routes.js
```

---

## 🐛 Troubleshooting

### Common Issues

- **MongoDB Connection Error**: Verify MongoDB is running and URI is correct
- **OCR Not Working**: Ensure Python 3.x and Tesseract are installed
- **Socket Connection Failed**: Check if Socket.IO server is running on correct port
- **CORS Issues**: Verify CORS middleware configuration in server.js

---

## 📝 Contributing

1. Create feature branches from `main`
2. Follow existing code structure and naming conventions
3. Test thoroughly before submitting pull requests
4. Document new features in this README

---

## 📄 License

This project is proprietary software. Unauthorized copying is prohibited.

---

## 👥 Team

MediSmart AI Development Team - 2024-2026

---

## 📞 Support

For issues and support:

- Check existing GitHub issues
- Contact development team
- Review documentation

---

## 🎯 Future Enhancements

- [ ] Payment gateway integration (Stripe/Razorpay)
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Machine learning recommendations
- [ ] Telemedicine integration
- [ ] Inventory prediction using AI
- [ ] Multi-language support
- [ ] Advanced delivery route optimization

---

**Last Updated**: January 19, 2026
