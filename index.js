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
/**
 * Connect to MongoDB using the provided connection URI from the environment variables.
 * If the connection is successful, it logs a success message.
 * If the connection fails, it logs an error message.
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Database connected successfully'))
  .catch(err => console.error('Database connection error:', err));

// CORS policy setup
/**
 * Set up CORS to allow requests from specific origins.
 * If the origin is not allowed, it returns an error message.
 */
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
/**
 * Generates a JWT token for the user.
 * 
 * @param {Object} user - The user object containing user details.
 * @returns {string} - The generated JWT token.
 */
const generateJWTToken = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, {
    subject: user.Username,
    expiresIn: "7d",
    algorithm: "HS256"
  });
};

// POST route for user login
/**
 * Route to handle user login.
 * Authenticates the user using passport and generates a JWT token on successful login.
 * 
 * @param {Object} req - The request object containing user credentials.
 * @param {Object} res - The response object to send the response.
 */
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
/**
 * Welcome route for the API.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the response.
 */
app.get("/", (req, res) => {
  res.send("Welcome to our movie API!");
});

// GET route for /movies
/**
 * Route to get all movies from the database.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the response.
 */
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
/**
 * Route to get a specific movie by title.
 * Requires JWT authentication.
 * 
 * @param {Object} req - The request object containing the movie title.
 * @param {Object} res - The response object to send the response.
 * @param {Function} next - The next middleware function.
 */
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
/**
 * Route to get movies by a specific director.
 * Requires JWT authentication.
 * 
 * @param {Object} req - The request object containing the director's name.
 * @param {Object} res - The response object to send the response.
 * @param {Function} next - The next middleware function.
 */
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
/**
 * Route to get movies by genre.
 * Requires JWT authentication.
 * 
 * @param {Object} req - The request object containing the genre name.
 * @param {Object} res - The response object to send the response.
 * @param {Function} next - The next middleware function.
 */
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
/**
 * Route to get all users from the database.
 * Requires JWT authentication.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object to send the response.
 * @param {Function} next - The next middleware function.
 */
app.get("/users", passport.authenticate("jwt", { session: false }), async (req, res, next) => {
  try {
    const users = await Users.find();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// POST route for user registration with validation
/**
 * Route for user registration with validation.
 * 
 * @param {Object} req - The request object containing user registration details.
 * @param {Object} res - The response object to send the response.
 */
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
/**
 * Route to update user information.
 * 
 * @param {Object} req - The request object containing user update data.
 * @param {Object} res - The response object to send the response.
 */
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
    const user = await Users.findByIdAndUpdate(userId, updatedUserData, { new: true });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Delete route for removing a user
/**
 * Route to delete a user by ID.
 * 
 * @param {Object} req - The request object containing the user ID.
 * @param {Object} res - The response object to send the response.
 */
app.delete("/users/:userId", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const userId = req.params.userId;
  try {
    const user = await Users.findByIdAndRemove(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).send("User deleted");
  } catch (error) {
    console.error(error);
    res.status(500).send('Error: ' + error);
  }
});

// Error handling middleware
/**
 * Error handling middleware.
 * Catches any errors that occur during the execution of the API routes.
 * 
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
