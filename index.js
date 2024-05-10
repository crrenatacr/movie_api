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
        imageURL: "https://www.imdb.com/title/tt0499549/"
    },
    {
        title: "Titanic",
        description: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
        genre: "Drama, Romance",
        director: "James Cameron",
        imageURL: "https://www.imdb.com/title/tt0120338/"
    },
    {
        title: "Star Wars: Episode VII - The Force Awakens",
        description: "Three decades after the Empire's defeat, a new threat arises in the militant First Order. Defected stormtrooper Finn and the scavenger Rey are caught up in the Resistance's search for the missing Luke Skywalker.",
        genre: "Action, Adventure, Fantasy",
        director: "J.J. Abrams",
        imageURL: "https://www.imdb.com/title/tt2488496/"
    },
    {
        title: "Avengers: Endgame",
        description: "After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
        genre: "Action, Adventure, Drama",
        director: "Anthony Russo, Joe Russo",
        imageURL: "https://www.imdb.com/title/tt4154796/"
    },
    {
        title: "Avengers: Infinity War",
        description: "The Avengers and their allies must be willing to sacrifice all in an attempt to defeat the powerful Thanos before his blitz of devastation and ruin puts an end to the universe.",
        genre: "Action, Adventure, Sci-Fi",
        director: "Anthony Russo, Joe Russo",
        imageURL: "https://www.imdb.com/title/tt4154756/"
    },
    {
        title: "The Lion King",
        description: "A lion cub prince is tricked by a treacherous uncle into thinking he caused his father's death and flees into exile in despair, only to learn in adulthood his identity and his responsibilities.",
        genre: "Animation, Adventure, Drama",
        director: "Roger Allers, Rob Minkoff",
        imageURL: "https://www.imdb.com/title/tt0110357/"
    },
    {
        title: "Jurassic Park",
        description: "During a preview tour, a theme park suffers a major power breakdown that allows its cloned dinosaur exhibits to run amok.",
        genre: "Action, Adventure, Sci-Fi",
        director: "Steven Spielberg",
        imageURL: "https://www.imdb.com/title/tt0107290/"
    },
    {
        title: "The Avengers",
        description: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.",
        genre: "Action, Adventure, Sci-Fi",
        director: "Joss Whedon",
        imageURL: "https://www.imdb.com/title/tt0848228/"
    },
    {
        title: "The Sound of Music",
        description: "A woman leaves an Austrian convent to become a governess to the children of a Naval officer widower.",
        genre: "Biography, Drama, Family",
        director: "Robert Wise",
        imageURL: "https://www.imdb.com/title/tt0059742/"
    },
    {
        title: "Frozen",
        description: "When the newly-crowned Queen Elsa accidentally uses her power to turn things into ice to curse her home in infinite winter, her sister Anna teams up with a mountain man, his playful reindeer, and a snowman to change the weather condition.",
        genre: "Animation, Adventure, Comedy",
        director: "Chris Buck, Jennifer Lee",
        imageURL: "https://www.imdb.com/title/tt2294629/"
    }
];

// Array to store user data
let users = [];

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

// POST route for user registration
app.post('/users/register', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = generateUserId();
        newUser.favorites = [];
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.status(400).send('Users need a name');
    }
});

// PUT route for updating user info
app.put('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    res.send(`User with ID ${userId} updated successfully`);
});

// POST route for adding a movie to favorites
app.post('/users/:userId/favorites', (req, res) => {
    const userId = req.params.userId;
    const movieId = req.body.movieId;
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users[userIndex].favorites.push(movieId);
        res.send(`Movie added to favorites for user with ID ${userId}`);
    } else {
        res.status(404).send('User not found');
    }
});

// DELETE route for removing a movie from favorites
app.delete('/users/:userId/favorites/:movieId', (req, res) => {
    const userId = req.params.userId;
    const movieId = req.params.movieId;
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        const favoritesIndex = users[userIndex].favorites.findIndex(favorite => favorite === movieId);
        if (favoritesIndex !== -1) {
            users[userIndex].favorites.splice(favoritesIndex, 1);
            res.send(`Movie removed from favorites for user with ID ${userId}`);
        } else {
            res.status(404).send('Movie not found in favorites');
        }
    } else {
        res.status(404).send('User not found');
    }
});

// DELETE route for user deregistration
app.delete('/users/:userId', (req, res) => {
    const userId = req.params.userId;
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex !== -1) {
        users.splice(userIndex, 1);
        res.send(`User with ID ${userId} deregistered successfully`);
    } else {
        res.status(404).send('User not found');
    }
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

// Function to generate unique user IDs
function generateUserId() {
    return Math.random().toString(36).substr(2, 9);
}
