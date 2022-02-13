const express = require("express");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const mongoose = require('mongoose');
const app = express();
const UserModel = require("./models/user");
const isAuth = require("./middleware/is-auth");
const MONGODB_URI = 'mongodb+srv://omabney:Fi6L05VQ67BizcxN@cluster0.ic8g6.mongodb.net/authentication?retryWrites=true&w=majority';
const appController = require("./controller/appController");
const { check, body } = require('express-validator/check');
mongoose
  .connect(
    MONGODB_URI
  )
  .then(result => {
    console.log("Mongodb Connected")
  });

  const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
  });

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: 'Team activity Authentication',
        resave: false,
        saveUninitialized: false,
        store: store
    })
);

app.get("/", appController.home_page);

// Login Page
app.get("/login", appController.login_get);
app.post("/login", 
[
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
],
appController.login_post);

// Register Page
app.get("/register", appController.register_get);
app.post("/register",
[
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom((value, { req }) => {
        console.log("Hi")
        return UserModel.findOne({ email: value }).then(userDoc => {
          console.log(userDoc)
          if (userDoc) {
            return Promise.reject(
              'E-Mail exists already, please pick a different one.'
            );
          }
        });
      })
      .normalizeEmail()
  ],
   appController.register_post);

// Dashboard Page
app.get("/dashboard", isAuth,appController.dashboard_get);

app.post("/logout", appController.logout_post);

app.listen(5000);