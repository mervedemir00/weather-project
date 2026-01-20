const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const City = require("./models/City");

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://weather-project-backend.onrender.com'
  ],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "City is required" });

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
        );
        const data = response.data;
        res.json({
            city: data.name,
            temp: data.main.temp,
            weather: data.weather[0].main,
            icon: data.weather[0].icon
        });
    } catch (error) {
        res.status(500).json({ error: "Unable to fetch weather data" });
    }
});

app.get("/api/cities", async (req, res) => {
    const query = req.query.q;
    if (!query) return res.json([]);

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios.get(
            `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`
        );
        const cities = response.data.map(city => ({
            name: city.name,
            country: city.country,
            state: city.state || ""
        }));
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: "Unable to fetch cities" });
    }
});

app.get("/api/saved-cities", async (req, res) => {
    try {
        const cities = await City.find().sort({ addedAt: -1 });
        res.json(cities.map(c => c.name));
    } catch (error) {
        res.status(500).json({ error: "Unable to fetch cities" });
    }
});

app.post("/api/saved-cities", async (req, res) => {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: "City is required" });

    try {
        const existingCity = await City.findOne({ name: city });
        if (existingCity) {
            return res.json({ message: "City already exists", city: existingCity.name });
        }

        const newCity = new City({ name: city });
        await newCity.save();
        res.json({ message: "City added", city: newCity.name });
    } catch (error) {
        res.status(500).json({ error: "Unable to add city" });
    }
});

app.delete("/api/saved-cities/:city", async (req, res) => {
    const { city } = req.params;
    
    try {
        await City.deleteOne({ name: city });
        res.json({ message: "City removed" });
    } catch (error) {
        res.status(500).json({ error: "Unable to remove city" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));