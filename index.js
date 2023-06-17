
// const express = require('express');
// const mongoose = require('mongoose');


// // Connect to MongoDB
// mongoose.connect('mongodb+srv://mariyanixon:mariyanixon@cluster0.fcvdevs.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch((error) => console.error('Error connecting to MongoDB:', error));

// // Define the user schema
// const userSchema = new mongoose.Schema({
//   name: String,
//   place: String,
//   age: Number,
//   email: String,
//   education: String,
//   contactDetails: String,
//   phoneNumber: String,
//   password:String,
  
// });

// const User = mongoose.model('User', userSchema);

// // Create the Express app
// const app = express();
// app.use(express.json());

// // Define the POST route for user registration
// app.post('/api/register', (req, res) => {
//   console.log("inpost");
//   const { name, place, age, email, education, contactDetails, phoneNumber } = req.body;

//   // Create a new user object
//   const user = new User({
//     name,
//     place,
//     age,
//     email,
//     education,
//     contactDetails,
//     phoneNumber,
//   });

//   // Save the user to the database
//   user.save()
//     .then(() => {
//       console.log('User registered:', user);
//       res.status(200).json({ message: 'User registered successfully' });
//     })
//     .catch((error) => {
//       console.error('Error registering user:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     });
// });

// // Start the server
// const port = 8080;
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });




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
  name: String,
  place: String,
  age: Number,
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
    type: mongoose.Schema.Types.ObjectId,
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
  const { name, place, age, email, education, contactDetails, phoneNumber,password } = req.body;

  // Create a new user object
  const user = new User({
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
  console.log(name,password)

  // Find the user in the database by email
  User.findOne({ name })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }


      console.log("pwddetails",password,user.password)
      // Compare the provided password with the hashed password stored in the database
      // bcrypt.compare(password, user.password, (err, isMatch) => {
      //   if (err) {
      //     console.log("PWD COMPARISON ERR")
      //     console.error('Error comparing passwords:', err);
      //     return res.status(500).json({ message: 'Internal server error' });
      //   }

      //   if (!isMatch) {
      //     console.log("PWD MATCH ERROR")
      //     return res.status(401).json({ message: 'Invalid password' });
      //   }

      //   // Generate a JSON Web Token (JWT)
      //   // const token = jwt.sign({ userId: user._id }, 'your-secret-key');

      //   // console.log("token",token)

      //   res.json({ name });
      // });
      if(password===user.password){
        console.log("PASSWORD MATCHED")
         // Generate a JWT token
  const token = jwt.sign({ username: user.name }, 'your-secret-key');
  console.log("token",token)

  res.json({ token });
       // res.json({name})
      }else{
        res.status(401).json({ message: 'Invalid password' });
      }
    })
    .catch((error) => {
      console.error('Error finding user:', error);
      res.status(500).json({ message: 'Internal server error' });
    });
});

// Define the POST route to add an expense
// app.post('/api/expenses', (req, res) => {
//   console.log("IN ADD EXP POST")
//   const { username, income, expense } = req.body;
//   console.log("EXP POST USERNM:",username)
//   console.log("EXP POST INCOME:",income)
//   console.log("EXP POST EXP:",expense)

//   // Create a new expense object
//   const newExpense = new Expense({
//     username,
//     income,
//     expense
//   });
//    // Save the expense to the database
//    newExpense.save()
//    .then(() => {
//      console.log('Expense added:', newExpense);
//      res.status(200).json({ message: 'Expense added successfully' });
//    })
//    .catch((error) => {
//      console.error('Error adding expense:', error);
//      res.status(500).json({ message: 'Internal server error' });
//    });
// });
// app.post('/api/expenses', async (req, res) => {
//   try {
//     // Assuming you have the currently logged-in user's ObjectId
//     const userId = req.user._id;

//     // Create a new expense
//     const expense = new Expense({
//       // Other expense fields...
//       username: userId, // Assign the ObjectId value
//     });
    
//     // Save the expense to the database
//     await expense.save();

//     res.status(201).json({ success: true, expense });
//   } catch (error) {
//     console.error('Error adding expense:', error);
//     res.status(500).json({ success: false, error: 'Error adding expense' });
//   }
// });

// ...

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

          console.log("POST EXP REQ:",req)
          console.log("INC",req.body.income)
          console.log("EXP",req.body.expense)

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

// ...


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
    const expenses = await Expense.find();
    res.json(expenses);
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




// Start the server
const port = 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

