const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true })); // to handle form submissions
app.use(express.static('public')); // for static files (e.g., CSS, images, JS)
app.use(express.static(path.join(__dirname, 'images'))); // serve images from the 'images' directory

// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/doctorAppointmentSystem';

// Create MongoDB connection
mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to Database"));

// User Schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Define User model
const User = mongoose.model('User', userSchema);
app.use(express.static(path.join(__dirname, 'views')));


// Appointment Schema definition
const appointmentSchema = new mongoose.Schema({
    patientName: { type: String, required: true },
    email: { type: String, required: true },
    doctor: { type: String, required: true },
    appointmentDate: { type: Date, required: true },
    notes: { type: String, default: '' } // Optional: Default value for notes
});

// Create the Appointment model
const Appointment = mongoose.model('Appointment', appointmentSchema);

app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'views', 'login.html'); // Define the filePath variable here
    console.log(`Serving file from: ${filePath}`); // Log the file path
    res.sendFile(filePath); // Use the filePath variable here
});



// User signup
app.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        console.log("User registered successfully");
        res.redirect('/inde');
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).send("Error registering user: " + err.message);
    }
});

// User login
app.post("/signin", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).send("Invalid login credentials");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            res.redirect('/inde');
        } else {
            res.status(401).send("Invalid login credentials");
        }
    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).send("Error logging in: " + err.message);
    }
});

// Handle appointment bookings
app.post('/bookappointment', async (req, res) => {
    const { patientName, email, doctor, appointmentDate, notes } = req.body;

    try {
        const newAppointment = new Appointment({
            patientName,
            email,
            doctor,
            appointmentDate,
            notes
        });

        // Save the appointment to the database
        await newAppointment.save()
        console.log('Appointment booked successfully');

        // Redirect or send a success response
        res.status(200).send('Appointment booked successfully!');
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).send('Error booking appointment: ' + error.message);
    }
});

// Other routes
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});
app.get('/department', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'department.html'));
});
app.get('/appointment', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'appointment.html'));
});
app.get('/docters', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'docters.html'));
});
app.get('/inde', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'inde.html'));
});
app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

// Set up server port
const PORT = process.env.PORT || 3009;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
