const jwtSecret = "your_jwt_secret"; // Same key used in the JWTStrategy
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("./passport"); // My local passport file

/**
 * Generates a JWT token for the user.
 *
 * @param {Object} user - The user object, which will be used to generate the token.
 * @returns {string} The generated JWT token.
 */
let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, // This is the username encoded in the JWT
    expiresIn: "7d", // This specifies that the token will expire in 7 days
    algorithm: "HS256", // This is the algorithm used to “sign” or encode the values of the JWT
  });
};

module.exports = (router) => {
  /**
   * POST request handler for user login. Authenticates the user with passport's local strategy and generates a JWT token.
   *
   * @param {Object} req - The request object containing the user credentials.
   * @param {Object} res - The response object used to send the JSON response containing user data and token.
   * @returns {Object} JSON response with the user and JWT token, or an error message.
   */
  router.post("/login", (req, res) => {
    passport.authenticate("local", { session: false }, (error, user, info) => {
      if (error || !user) {
        return res.status(400).json({
          message: "Something is not right",
          user: user,
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
};
