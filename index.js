const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect('mongodb://localhost:27017/moviesapi', { useNewUrlParser: true, useUnifiedTopology: true });
const express = require("express");
const morgan = require("morgan");
const app = express();
const path = require("path");

// "In-memory" array of movie objects
// This will be replaced with database queries

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(morgan("dev")); // Logging middleware
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// GET route for /
app.get("/", (req, res) => {
  res.send(
    "Welcome to our movie API! Visit /movies to get data about the top 10 most watched movies."
  );
});

// GET route for /movies
app.get("/movies", (req, res, next) => {
  Movies.find()
    .then(movies => {
      res.json(movies);
    })
    .catch(next);
});

// GET route for /movies/:title
app.get("/movies/:title", (req, res, next) => {
  const title = req.params.title;
  Movies.findOne({ title: title })
    .then(movie => {
      if (!movie) {
        return res.status(404).send("Movie not found");
      }
      res.json(movie);
    })
    .catch(next);
});

// POST route for user registration
app.post("/users/register", (req, res, next) => {
  const newUser = req.body;

  if (!newUser.name) {
    return res.status(400).send("Users need a name");
  }

  Users.create(newUser)
    .then(user => {
      res.status(201).json(user);
    })
    .catch(next);
});

// PUT route for updating user info
app.put("/users/:userId", (req, res, next) => {
  const userId = req.params.userId;
  const updatedUserData = req.body;

  Users.findByIdAndUpdate(userId, updatedUserData, { new: true })
    .then(user => {
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.json(user);
    })
    .catch(next);
});

// POST route for adding a movie to favorites
app.post("/users/:userId/favorites", (req, res) => {
  const userId = req.params.userId;
  const movieId = req.body.movieId;

  // Check if the user exists in the users array
  const user = users.find((user) => user.id === userId);
  if (!user) {
    return res.status(404).send("User not found");
  }

  // Add the movieId to the user's favorites array
  user.favorites.push(movieId);

  // Send a response confirming the addition of the movie to favorites
  res.send(`Movie added to favorites for user with ID ${userId}`);
});

// DELETE route for user deregistration
app.delete("/users/:userId", (req, res, next) => {
  const userId = req.params.userId;

  Users.findByIdAndDelete(userId)
    .then(user => {
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.send(`User with ID ${userId} deregistered successfully`);
    })
    .catch(next);
});

// DELETE route for removing a movie from favorites
app.delete("/users/:userId/favorites/:movieId", (req, res, next) => {
  const userId = req.params.userId;
  const movieId = req.params.movieId;

  Users.findByIdAndUpdate(
    userId,
    { $pull: { favorites: movieId } },
    { new: true }
  )
    .then(user => {
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.send(`Movie removed from favorites for user with ID ${userId}`);
    })
    .catch(next);
});

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
