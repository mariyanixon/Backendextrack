const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


// Connect to MongoDB
mongoose.connect('mongodb+srv://mariyanixon:mariyanixon@cluster0.fcvdevs.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define the user schema
const userSchema = new mongoose.Schema({
  _id: String,
  name: String,
  place: String,
  age: Number,
  isBlocked : Boolean,
  email: String,
  education: String,
  contactDetails: String,
  phoneNumber: String,
  password: String,

});

const User = mongoose.model('User', userSchema);

// Define the expense schema
const expenseSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.String,
    ref: 'User'
  },
  income: Number,
  expense: Number
});

const Expense = mongoose.model('Expense', expenseSchema);

// Create the Express app
const app = express();
app.use(express.json());

// Define the POST route for user registration
app.post('/api/register', (req, res) => {
  console.log("inpost");
  const { name, place, age, email, education, contactDetails, phoneNumber, password } = req.body;

  // Create a new user object
  const user = new User({
    _id : name,
    name,
    place,
    age,
    email,
    education,
    contactDetails,
    phoneNumber,
    password
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


// Define the POST route for user login
app.post('/api/login', (req, res) => {
  console.log("IN LOGIN")
  const { name, password } = req.body;
  console.log(name, password)

  // Find the user in the database by email
  User.findOne({ name })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }


      console.log("pwddetails", password, user.password)
      if (password === user.password) {
        console.log("PASSWORD MATCHED")
        // Generate a JWT token
        const token = jwt.sign({ username: user.name }, 'your-secret-key');
        console.log("token", token)

        res.json({ token, isBlocked : user.isBlocked });
        // res.json({name})
      } else {
        res.status(401).json({ message: 'Invalid password' });
      }
    })
    .catch((error) => {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.post('/api/expenses', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

    // Verify the JWT token
    jwt.verify(token, 'your-secret-key', (err, decodedToken) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }

      const { username } = decodedToken;

      // Find the user in the database by username
      User.findOne({ name: username })
        .then((user) => {
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

          console.log("POST EXP REQ:", req)
          console.log("INC", req.body.income)
          console.log("EXP", req.body.expense)

          // Create a new expense
          const expense = new Expense({
            username: user._id, // Assign the ObjectId value
            income: req.body.income,
            expense: req.body.expense
          });

          // Save the expense to the database
          expense.save()
            .then(() => {
              console.log('Expense added:', expense);
              res.status(201).json({ success: true, expense });
            })
            .catch((error) => {
              console.error('Error adding expense:', error);
              res.status(500).json({ success: false, error: 'Error adding expense' });
            });
        })
        .catch((error) => {
          console.error('Error finding user:', error);
          res.status(500).json({ message: 'Internal server error' });
        });
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ success: false, error: 'Error adding expense' });
  }
});

// returns username of currently loggedin user
app.get('/api/user', (req, res) => {

  console.log("IN GET USER")
  const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

  // Verify the JWT token
  jwt.verify(token, 'your-secret-key', (err, decodedToken) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ message: 'Invalid token' });
    }

    const { username } = decodedToken;
    res.json({ username });
  });
});

// Define the GET route to retrieve all expenses
app.get('/api/expenses', async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header

    // Verify the JWT token
    jwt.verify(token, 'your-secret-key', async (err, decodedToken) => {
      if (err) {
        console.error('Error verifying token:', err);
        return res.status(401).json({ message: 'Invalid token' });
      }

      const { username } = decodedToken;

      const filter = username === "admin" ? undefined  : {username };

      const expenses = await Expense.find(filter);
      res.json(expenses);

    });
  } catch (error) {
    console.error('Error retrieving expenses:', error);
    res.status(500).json({ success: false, error: 'Error retrieving expenses' });
  }
});

// Define the DELETE route for deleting an expense
app.delete('/api/expenses/:id', async (req, res) => {
  try {
    const expenseId = req.params.id;

    // Find the expense by ID and remove it from the database
    await Expense.findByIdAndRemove(expenseId);

    res.status(200).json({ success: true, message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ success: false, error: 'Error deleting expense' });
  }
});

// Define the PUT route for updating an expense
app.put('/api/expenses/:id', async (req, res) => {
  console.log("PUT EXPENSE")
  try {
    const expenseId = req.params.id;
    const updatedExpenseData = req.body;

    // Update the expense in the database
    const updatedExpense = await Expense.findByIdAndUpdate(expenseId, updatedExpenseData, { new: true });

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get list of all users from db
app.get('/api/users', async (req, res) => {
  try {
    const userList = await User.find();
    res.json(userList);
  } catch (error) {
    console.error('Error getting users list :', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// get a particular user from db
app.get('/api/user/:id', async (req, res) => {

  try {
    const userId = req.params.id;

    const userInfo = await User.findById(userId);

    res.json(userInfo);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// update a user information
app.put('/api/user/:id', async (req, res) => {

  try {
    const userId = req.params.id;
    const updatedUser = req.body;
    const query = { _id: userId };
    const result = await User.replaceOne(query, updatedUser);

    res.json(result);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// block a user- admin operation
app.put('/api/user/:id/block', async (req, res) => {
  try {
    const userId = req.params.id;
    const filter = { _id: userId };

    const updateDef = {
      $set: {
        isBlocked: true
      },
    };
    const resp = await User.updateOne(filter, updateDef)
    res.json(resp);
  } catch (error) {
    console.error('Error while blocing user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// delete a user - admin
app.delete('/api/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;

    const resp = await User.findByIdAndDelete(userId)
    res.json(resp);
  } catch (error) {
    console.error('Error while deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

