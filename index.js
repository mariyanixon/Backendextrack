
const express = require('express');
const mongoose = require('mongoose');


// Connect to MongoDB
mongoose.connect('mongodb+srv://mariyanixon:mariyanixon@cluster0.fcvdevs.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  place: String,
  age: Number,
  email: String,
  education: String,
  contactDetails: String,
  phoneNumber: String,
  password:String,
  
});

const User = mongoose.model('User', userSchema);

// Create the Express app
const app = express();
app.use(express.json());

// Define the POST route for user registration
app.post('/api/register', (req, res) => {
  console.log("inpost");
  const { name, place, age, email, education, contactDetails, phoneNumber } = req.body;

  // Create a new user object
  const user = new User({
    name,
    place,
    age,
    email,
    education,
    contactDetails,
    phoneNumber,
  });

  // Save the user to the database
  user.save()
    .then(() => {
      console.log('User registered:', user);
      res.status(200).json({ message: 'User registered successfully' });
    })
    .catch((error) => {
      console.error('Error registering user:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
