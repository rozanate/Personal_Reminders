const express = require(`express`);
const exphbs = require(`express-handlebars`);
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require(`body-parser`);
const mongoose = require(`mongoose`);

const app = express();

// Map global promise
mongoose.Promise = global.Promise;
// Connect to mongoose
mongoose
  .connect(
    "mongodb://localhost/reminder-app",
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.log(err));

// Load Reminders Model
require("./models/Reminders");
const Reminder = mongoose.model("reminders");

// Handlebars Middleware
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Body Parser - parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse applicaiton/json
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride("_method"));

// Express-Session Middleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
  })
);

// Flash Middleware
app.use(flash());

// Global Variables
app.use(function(req, res, next) {
  res.locals.success_message = req.flash("success_message");
  res.locals.error_message = req.flash("error_message");
  res.locals.error = req.flash("error");

  // Call the next middleware
  next();
});

// Index Route
app.get("/", (req, res) => {
  const title = "Welcome Nigger";
  res.render("index", {
    title: title
  });
});

// About Route
app.get("/about", (req, res) => {
  res.render("about");
});

// Reminder Index Page
app.get("/reminders", (req, res) => {
  Reminder.find({})
    .sort({ createDate: "desc" })
    .then(reminders => {
      res.render("reminders/index", {
        reminders: reminders
      });
    });
});

// Add Reminder Form
app.get("/reminders/add", (req, res) => {
  res.render("reminders/add");
});

// Edit Reminder Form
app.get("/reminders/edit/:id", (req, res) => {
  Reminder.findOne({
    _id: req.params.id
  }).then(reminder => {
    res.render("reminders/edit", {
      reminder: reminder
    });
  });
});

// Process Reminders' Form
app.post("/reminders", (req, res) => {
  // console.log(req.body);
  // res.send("ok");
  let errors = [];

  if (!req.body.title) {
    errors.push({ text: "Please add a title" });
  }
  if (!req.body.date) {
    errors.push({ text: "Please add the event date" });
  }
  if (!req.body.details) {
    errors.push({ text: "Please add details" });
  }

  if (errors.length > 0) {
    res.render("/reminders/add", {
      errors: errors,
      title: req.body.title,
      date: req.body.date,
      details: req.body.details
    });
  } else {
    const newUser = {
      event_title: req.body.title,
      date: req.body.date,
      details: req.body.details
    };
    new Reminder(newUser).save().then(reminder => {
      req.flash("success_message", "Reminder is added");
      res.redirect("/reminders");
    });
  }
});

// Edit Reminders' Form
app.put("/reminders/:id", (req, res) => {
  Reminder.findOne({
    _id: req.params.id
  }).then(reminder => {
    // update new values
    reminder.event_title = req.body.title;
    reminder.date = req.body.date;
    reminder.details = req.body.details;
    // save the updated reminder
    reminder.save().then(() => {
      req.flash("success_message", "Reminder is updated");
      res.redirect("/reminders");
    });
  });
});

// Delete Reminder
app.delete("/reminders/:id", (req, res) => {
  //res.send("DELETE");
  Reminder.deleteOne({
    _id: req.params.id
  }).then(() => {
    req.flash("success_message", "Reminder is removed");
    res.redirect("/reminders");
  });
  // Also works
  /*
  Reminder.remove({
    _id: req.params.id
  }).then(() => res.redirect("/reminders"));
  */
});

// Setting port number to 5000
const port = 5000;

// Tell Server to listen to localhost:5000
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
