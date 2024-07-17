const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

const app = express();
const cors = require("cors");

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

// Connect to MongoDB Atlas database with environment variable
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// CORS policy setup
const allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234', 'https://myflixmovieverse.netlify.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      let message = 'The CORS policy for this application does not allow access from origin ' + origin;
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

// Function to generate JWT token
const generateJWTToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256"
  });
};

// POST route for user login
app.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (error, user, info) => {
    if (error || !user) {
      return res.status(400).json({
        message: "Something is not right",
        user: user
      });
    }
    req.login(user, { session: false }, (error) => {
      if (error) {
        res.send(error);
      }
      const token = generateJWTToken(user.toJSON());
      return res.json({ user, token });
    });
  })(req, res);
});

// GET route for /
app.get("/", (req, res) => {
  res.send("Welcome to our movie API!");
});

// GET route for /movies
app.get("/movies", async (req, res) => {
  try {
    const movies = await Movies.find();
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// GET route for /movies/:title
app.get("/movies/:title", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const title = req.params.title;
  try {
    const movie = await Movies.findOne({ Title: title });
    if (!movie) {
      return res.status(404).send("Movie not found");
    }
    res.json(movie);
  } catch (error) {
    next(error);
  }
});

// GET route for /movies/directors/:director
app.get("/movies/directors/:director", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const director = req.params.director;
  const regex = new RegExp(director, "i");
  try {
    const movies = await Movies.find({ "Director.Name": regex });
    if (!movies || movies.length === 0) {
      return res.status(404).send("Movies not found");
    }
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

// GET route for /movies/genres/:genre
app.get("/movies/genres/:genre", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const genre = req.params.genre;
  try {
    const movies = await Movies.aggregate([{ $match: { "Genre.Name": genre } }]);
    if (!movies || movies.length === 0) {
      return res.status(404).send("Movies not found");
    }
    res.json(movies);
  } catch (error) {
    next(error);
  }
});

// GET route for /users
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST route for user registration with validation
app.post("/users/register", [
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').matches(/^[a-zA-Z0-9 ]*$/),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const hashedPassword = Users.hashPassword(req.body.Password);
  try {
    const user = await Users.findOne({ Username: req.body.Username });
    if (user) {
      return res.status(400).send(req.body.Username + ' already exists');
    } else {
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// PUT route for updating user info with validation
app.put("/users/:userId", [
  passport.authenticate("jwt", { session: false }),
  check('Username', 'Username is required').isLength({ min: 5 }),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').matches(/^[a-zA-Z0-9 ]*$/),
  check('Email', 'Email is required').isEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const userId = req.params.userId;
  const updatedUserData = req.body;

  if (updatedUserData.Password) {
    updatedUserData.Password = Users.hashPassword(updatedUserData.Password);
  }

  try {
    const user = await Users.findOneAndUpdate({ _id: userId }, updatedUserData, { new: true });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error);
  }
});

// POST route for adding a movie to favorites
app.post("/users/:userId/favorites", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const userId = req.params.userId;
  const movieId = req.body.movieId;

  try {
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    user.FavoriteMovies.push(movieId);
    await user.save();
    res.send(`Movie added to favorites for user with ID ${userId}`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// DELETE route for user deregistration
app.delete("/users/:userId", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await Users.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(`User with ID ${userId} deregistered successfully`);
  } catch (error) {
    next(error);
  }
});

// DELETE route for removing a movie from favorites
app.delete("/users/:userId/favorites/:movieId", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const userId = req.params.userId;
  const movieId = req.params.movieId;

  try {
    const user = await Users.findByIdAndUpdate(
      userId,
      { $pull: { FavoriteMovies: movieId } },
      { new: true }
    );
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.send(`Movie removed from favorites for user with ID ${userId}`);
  } catch (error) {
    next(error);
  }
});

// GET route for retrieving user by username
app.get("/users/:Username", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  const username = req.params.Username;
  try {
    const user = await Users.findOne({ Username: username });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
