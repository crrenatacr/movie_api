const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect("mongodb://localhost:27017/moviesapi", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const app = express();
const path = require("path");

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));

// Authentication
let auth = require("./auth")(app);

const cors = require("cors");
let allowedOrigins = ["http://localhost:8080", "http://imdb.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  })
);

const passport = require("passport");
require("./passport");

// GET route for /
app.get("/", (req, res) => {
  res.send("Welcome to our movie API!");
});

// GET route for /movies
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// GET route for /movies/:title
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const title = req.params.title;
    await Movies.findOne({ Title: title })
      .then((movie) => {
        if (!movie) {
          return res.status(404).send("Movie not found");
        }
        res.json(movie);
      })
      .catch(next);
  }
);

// POST route for user registration with validation
app.post(
  "/users/register",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail()
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Checks if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// GET route for listing all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    await Users.find()
      .then((users) => {
        res.json(users);
      })
      .catch(next);
  }
);

// PUT route for updating user info with validation
app.put(
  "/users/:Username",
  [
    passport.authenticate("jwt", { session: false }),
    check("Username", "Username is required").not().isEmpty(),
    check(
      "Username",
      "Username contains non-alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Email", "Email is required").isEmail()
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const username = req.params.Username;
    const updatedUserData = req.body;

    if (req.user.Username !== username) {
      return res.status(403).send("Permission denied");
    }

    if (updatedUserData.Password) {
      updatedUserData.Password = Users.hashPassword(updatedUserData.Password);
    }

    await Users.findOneAndUpdate({ Username: username }, updatedUserData, {
      new: true
    })
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found");
        }
        res.json(user);
      })
      .catch(next);
  }
);

// POST route for adding a movie to favorites
app.post(
  "/users/:userId/favorites",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const userId = req.params.userId;
    const movieId = req.body.movieId;

    Users.findById(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found");
        }
        user.FavoriteMovies.push(movieId);
        return user.save();
      })
      .then((user) => {
        res.send(`Movie added to favorites for user with ID ${userId}`);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
  }
);

// DELETE route for user deregistration
app.delete(
  "/users/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const userId = req.params.userId;

    await Users.findByIdAndDelete(userId)
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found");
        }
        res.send(`User with ID ${userId} deregistered successfully`);
      })
      .catch(next);
  }
);

// DELETE route for removing a movie from favorites
app.delete(
  "/users/:userId/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res, next) => {
    const userId = req.params.userId;
    const movieId = req.params.movieId;

    await Users.findByIdAndUpdate(
      userId,
      { $pull: { FavoriteMovies: movieId } },
      { new: true }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).send("User not found");
        }
        res.send(`Movie removed from favorites for user with ID ${userId}`);
      })
      .catch(next);
  }
);

// Error-handling middleware function to log application-level errors
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).send("Internal Server Error");
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app; // Export the app for testing
