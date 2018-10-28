const express = require("express");
const router = express.Router();
const mongoose = require(`mongoose`);
const bcrypt = require("bcryptjs");
const passport = require("passport");

// Load User Model
require("../models/User");
const User = mongoose.model("users");

// Authentication - User Login Route
router.get("/login", (req, res) => {
  res.render("users/login");
});

// User Register Route
router.get("/register", (req, res) => {
  res.render("users/register");
});

// User Logout Route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_message", "You are logged out");
  res.redirect("/users/login");
});

// Login Form POST
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/reminders",
    failureRedirect: "/users/login",
    failureFlash: true
  })(req, res, next);
});

// Register Form POST
router.post("/register", (req, res) => {
  // console.log(req.body);
  // res.send("register");
  let errors = [];
  if (req.body.password != req.body.password2) {
    errors.push({ text: "Passwords do not match!" });
  }
  if (req.body.password.length < 4) {
    errors.push({ text: "Password must be at least 4 characters" });
  }

  // Check if there is any error in the error array
  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {
    User.findOne({ email: req.body.email }).then(user => {
      if (user) {
        req.flash("error_message", "This Email is already registered");
        res.redirect("/users/register");
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password
        });

        //Encrypt the password
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) {
              throw err;
            } else {
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    "success_message",
                    "Account registration is succeed"
                  );
                  res.redirect("/users/login");
                })
                .catch(err => {
                  console.log(err);
                  return;
                });
            }
          });
        });
      }
    });
  }
});

module.exports = router;
