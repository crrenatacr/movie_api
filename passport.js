const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  Models = require("./models.js"),
  passportJWT = require("passport-jwt");

// Importing User model from models.js
const Users = Models.User;

// Importing required modules for JWT authentication
const JWTStrategy = passportJWT.Strategy,
  ExtractJWT = passportJWT.ExtractJwt;

/**
 * LocalStrategy configuration for username and password authentication.
 * @function
 * @param {string} username - The username provided by the user.
 * @param {string} password - The password provided by the user.
 * @param {function} callback - The callback function to return the result.
 * @returns {void}
 */
passport.use(
  new LocalStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password',
    },
    async (username, password, callback) => {
      console.log(`${username} ${password}`);
      try {
        // Finding user by username
        const user = await Users.findOne({ Username: username });
        if (!user) {
          // If user not found, return error message
          console.log('incorrect username');
          return callback(null, false, { message: 'Incorrect username or password.' });
        }
        if (!user.validatePassword(password)) {
          // If password is incorrect, return error message
          console.log('incorrect password');
          return callback(null, false, { message: 'Incorrect password.' });
        }
        // If username and password are correct, return user
        console.log('finished');
        return callback(null, user);
      } catch (error) {
        // If an error occurs, handle it
        console.error(error);
        return callback(error);
      }
    }
  )
);

/**
 * JWTStrategy configuration for token authentication.
 * @function
 * @param {Object} jwtPayload - The decoded JWT payload.
 * @param {function} callback - The callback function to return the result.
 * @returns {void}
 */
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET // Using JWT_SECRET from environment variable
    },
    async (jwtPayload, callback) => {
      try {
        // Finding user by ID extracted from JWT payload
        const user = await Users.findById(jwtPayload._id);
        if (!user) {
          // If user not found, return false
          return callback(null, false);
        }
        // If user found, return user
        return callback(null, user);
      } catch (error) {
        // If an error occurs, handle it
        return callback(error);
      }
    }
  )
);

// Exporting passport for use in other files
module.exports = passport;
