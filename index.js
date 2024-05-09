const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');

// "In-memory" array of movie objects
let movies = [
    {
        title: "Avatar",
        description: "A paraplegic marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.",
        genre: "Action, Adventure, Fantasy",
        director: "James Cameron",
        imageURL: "https://www.example.com/avatar.jpg"
    },
    {
        title: "Titanic",
        description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
        genre: "Drama, Romance",
        director: "James Cameron",
        imageURL: "https://www.example.com/titanic.jpg"
    },
    // Add more movie objects as needed
];

// Use Morgan middleware to log all requests
app.use(morgan('dev'));

// Serve the documentation.html file from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// GET route for /
app.get('/', (req, res) => {
    res.send('Welcome to our movie API! Visit /movies to get data about the top 10 most watched movies.');
});

// GET route for /movies
app.get('/movies', (req, res) => {
    res.json(movies);
});

// GET route for /movies/:title
app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
    const movie = movies.find(movie => movie.title === title);
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('Movie not found');
    }
});

// GET route for /genres/:name
app.get('/genres/:name', (req, res) => {
    const name = req.params.name;
    res.send(`You requested data about the genre with name: ${name}`);
});

// GET route for /directors/:name
app.get('/directors/:name', (req, res) => {
    const name = req.params.name;
    res.send(`You requested data about the director with name: ${name}`);
});

// POST route for /users/register
app.post('/users/register', (req, res) => {
    res.send('User registration successful');
});

// PUT route for /users/:userId
app.put('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    res.send(`User with ID ${userId} updated successfully`);
});

// POST route for /users/:userId/favorites
app.post('/users/:userId/favorites', (req, res) => {
    const userId = req.params.userId;
    res.send(`Movie added to favorites for user with ID ${userId}`);
});

// DELETE route for /users/:userId/favorites/:movieId
app.delete('/users/:userId/favorites/:movieId', (req, res) => {
    const userId = req.params.userId;
    const movieId = req.params.movieId;
    res.send(`Movie removed from favorites for user with ID ${userId}`);
});

// DELETE route for /users/:userId
app.delete('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    res.send(`User with ID ${userId} deregistered successfully`);
});

// Error-handling middleware function to log application-level errors
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).send('Internal Server Error');
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// "In-memory" array of movie objects
function getAllMovies() {
    return movies;
}

// Return data about a single movie by title
function getMovieByTitle(title) {
    return movies.find(movie => movie.title === title);
}

// Example usage of the methods:
console.log("List of all movies:");
console.log(getAllMovies());

console.log("\nData of the movie 'Avatar':");
console.log(getMovieByTitle("Avatar"));
