# Movie API

This project is a Movie API that provides access to information about different movies, directors, and genres. Users can sign up, update their personal information, and list their favorite movies. The API is built with Node.js and uses MongoDB for data storage.

## Features

- **User Authentication**: Users can sign up and update their personal information.
- **Movie Information**: Access detailed information about movies, directors, and genres.
- **Favorite Movies**: Users can add movies to their list of favorites.
- **JWT Authentication**: The API uses JSON Web Tokens (JWT) for secure authentication.
- **Express.js**: Built with Express for handling API requests.
- **Mongoose**: Used for interacting with MongoDB.

## Technologies Used

- Node.js
- Express.js
- MongoDB (via Mongoose)
- JWT (JSON Web Token) for authentication
- Passport.js for handling authentication strategies
- bcrypt for password hashing
- dotenv for managing environment variables
- body-parser for parsing incoming request bodies
- cors for handling cross-origin requests
- morgan for logging HTTP requests
- express-validator for validating input data

## Installation

1. **Clone the repository**:
   - Clone this project to your local machine by running the following command in PowerShell:
     ```powershell
     git clone https://github.com/crrenatacr/movie_api.git
     ```

2. **Install dependencies**:
   - Navigate to the project folder and install the dependencies using PowerShell:
     ```powershell
     cd movie_api
     npm install
     ```

3. **Set up environment variables**:
   - Create a `.env` file in the root of the project and define the necessary environment variables, such as database connection details and JWT secrets. For example:
     ```
     DB_URI=mongodb://localhost:27017/movie_api
     JWT_SECRET=your_jwt_secret
     ```

4. **Start the application**:
   - To run the app locally, use the following command in PowerShell:
     ```powershell
     npm start
     ```
   - The API will be available at `http://localhost:3000`.

## API Endpoints

- **POST /signup**: Create a new user account.
- **POST /login**: Authenticate a user and return a JWT token.
- **GET /movies**: Get a list of all movies.
- **GET /movies/:id**: Get details of a specific movie.
- **GET /directors**: Get a list of all directors.
- **GET /genres**: Get a list of all genres.
- **GET /favorites**: Get the user's list of favorite movies.
- **POST /favorites**: Add a movie to the user's favorites.

## Running Tests

Currently, there are no tests specified in the project. You can add tests in the future by modifying the `test` script in `package.json`.

To run the existing `test` script (which will return an error message):
```powershell
npm test

## License

This project is licensed under the ISC License - see the LICENSE file for details.
Bugs and Issues

If you encounter any issues, please report them in the issues section.

## Author

Renata Hoffmann

