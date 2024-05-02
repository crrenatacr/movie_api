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
    // Return a default textual response
    res.send('Welcome to our movie API! Visit /movies to get data about the top 10 most watched movies.');
});

// GET route for /movies
app.get('/movies', (req, res) => {
    // Return the top 10 most watched movies as JSON
    res.json(moviesData);
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
