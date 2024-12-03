const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Schema for Movie
 * @typedef {Object} Movie
 * @property {string} Title - The title of the movie.
 * @property {Object} Genre - The genre details of the movie.
 * @property {string} Genre.Name - The name of the genre.
 * @property {string} Genre.Description - A description of the genre.
 * @property {Object} Director - The director's details.
 * @property {string} Director.Name - The name of the director.
 * @property {string} Director.Bio - The biography of the director.
 * @property {string} ImagePath - The URL of the movie's image.
 * @property {boolean} Featured - A flag indicating whether the movie is featured.
 */
let movieSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  ImagePath: String,
  Featured: Boolean
});

/**
 * Schema for User
 * @typedef {Object} User
 * @property {string} Username - The username of the user.
 * @property {string} Password - The password of the user.
 * @property {string} Email - The email address of the user.
 * @property {Date} Birthday - The user's birthday.
 * @property {Array<ObjectId>} FavoriteMovies - An array of ObjectIds referring to the user's favorite movies.
 */
let userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    Birthday: Date,
    FavoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }]
  });
  
/**
 * Hashes a password using bcrypt
 * @function
 * @param {string} password - The plain text password to be hashed.
 * @returns {string} The hashed password.
 */
userSchema.statics.hashPassword = (password) => {
    return bcrypt.hashSync(password, 10);
};

/**
 * Validates the given password against the stored hashed password
 * @function
 * @param {string} password - The plain text password to be validated.
 * @returns {boolean} True if the password matches, false otherwise.
 */
userSchema.methods.validatePassword = function(password) {
    return bcrypt.compareSync(password, this.Password);
};

let Movie = mongoose.model("Movie", movieSchema);
let User = mongoose.model("User", userSchema);

module.exports = { Movie, User };
