# DiagnoTech - AI-Powered Medical Diagnosis System

A comprehensive MERN stack project that combines medical expertise with artificial intelligence to provide accurate medical diagnoses and healthcare management. This project is designed to revolutionize healthcare by offering AI-powered diagnosis, appointment management, and intelligent medical assistance.

## Features

- AI-powered medical diagnosis system
- User registration, login, and profile management
- Doctor registration, profile management, and time slot setup
- Admin dashboard for managing users, doctors, and diagnoses
- Intelligent ChatBot for medical assistance and queries
- JWT-based authentication and role-based access control
- Appointment booking with real-time availability checking
- Review and rating system for doctors
- Swagger documentation for the API
- Secure password hashing and email-based password reset

## Project Structure

```
backend/
├── models/
│   ├── User.js
│   ├── Doctor.js
│   ├── Appointment.js
│   ├── Diagnosis.js
│   └── Review.js
├── routes/
│   ├── userRoutes.js
│   ├── doctorRoutes.js
│   ├── diagnosisRoutes.js
│   ├── doctorProfileRoutes.js
│   └── adminRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
├── controllers/
│   ├── userController.js
│   ├── doctorController.js
│   ├── diagnosisController.js
│   ├── appointmentController.js
│   └── adminController.js
├── utils/
│   ├── email.js
│   └── aiDiagnosis.js
└── app.js

frontend/
├── components/
│   ├── UserProfile.js
│   ├── DoctorProfile.js
│   ├── DiagnosisForm.js
│   ├── AppointmentForm.js
│   └── AdminDashboard.js
├── pages/
│   ├── Home.js
│   ├── Login.js
│   ├── Register.js
│   ├── Diagnosis.js
│   ├── DoctorDashboard.js
│   └── AdminDashboard.js
└── App.js
```

## Technologies Used

- Node.js & Express.js (Backend)
- React.js (Frontend)
- MongoDB & Mongoose (Database)
- Flask (AI Model Integration)
- TensorFlow/PyTorch (AI/ML Models)
- JWT for authentication
- Swagger for API documentation
- OpenAI API (ChatBot Integration)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/MahmoudMosTafa717/DiagnoTech.git
cd DiagnoTech
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

## Environment Variables

Create a `.env` file in the `backend` directory and add the following:

```
PORT=5000
MONGO_URI=your-mongodb-uri
JWT_SECRET=your-jwt-secret
EMAIL_HOST=your-email-host
EMAIL_PORT=your-email-port
EMAIL_USER=your-email-user
EMAIL_PASS=your-email-password
OPENAI_API_KEY=your-openai-api-key
```

## Running the Application

1. Start the backend server:

```bash
cd backend
npm start
```

2. Start the frontend development server:

```bash
cd frontend
npm start
```

## API Documentation

Access the Swagger documentation at:

```
http://localhost:5000/api-docs
```

## Contributing

We welcome contributions to DiagnoTech! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License.
