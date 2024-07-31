const express = require('express');
const mongoose = require('mongoose');
const Movie = require('./Movie');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27017/MovieStore', {


});

app.use(express.json());

app.get('/movies', async (req, res) => {
    try {
        const { title, rating, q, sortBy, page, limit } = req.query;

        // Build the filter object based on query parameters
        let filter = {};
        if (title) filter.title = { $regex: new RegExp(title, 'i') }; // Filter by title (case-insensitive)
        if (rating) filter.rating = rating; // Filter by rating
        if (q) filter.title = { $regex: new RegExp(q, 'i') }; // Search by title (case-insensitive)

        // Determine the sorting order
        const sortOrder = sortBy ? { [sortBy]: 1 } : { title: 1 };

        // Set default values for pagination
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;

        // Fetch movies from the database with the specified filters, sorting, and pagination
        const movies = await Movie.find(filter)
            .sort(sortOrder)
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        // Return the movies as a JSON response
        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// POST a new movie
app.post('/movies', async (req, res) => {
    console.log('Received POST request to /movies');
    console.log('Request body:', req.body);
    try {
        const { title, rating, genre, releaseYear, director, cast } = req.body;
        const movie = new Movie({ title, rating, genre, releaseYear, director, cast });
        await movie.save();
        console.log('Movie saved:', movie);
        res.status(201).json(movie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});


// PUT update a movie by ID
app.put('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, rating } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(id, { title, rating }, { new: true });
        res.json(updatedMovie);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE a movie by ID
app.delete('/movies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Movie.findByIdAndDelete(id);
        res.json({ message: 'Movie deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
