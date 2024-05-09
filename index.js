const express = require('express');
const morgan = require('morgan');
const app = express();
const path = require('path');

// Sample dataset of the ten most watched movies of all times
const moviesData = [
    { title: 'Avatar', viewership: 'Highest grossing film of all time' },
    { title: 'Titanic', viewership: 'Second highest grossing film of all time' },
    { title: 'Star Wars: Episode VII - The Force Awakens', viewership: 'Box office success' },
    { title: 'Avengers: Endgame', viewership: 'Highest grossing film of all time' },
    { title: 'Avengers: Infinity War', viewership: 'Box office success' },
    { title: 'The Lion King', viewership: 'Box office success (animated)' },
    { title: 'Jurassic Park', viewership: 'Box office success' },
    { title: 'The Avengers', viewership: 'Box office success' },
    { title: 'The Sound of Music', viewership: 'Cultural impact' },
    { title: 'Frozen', viewership: 'Box office success (animated)' }
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
    res.json(moviesData);
});

// GET route for /movies/:title
app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
    res.send(`You requested data about the movie with title: ${title}`);
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
