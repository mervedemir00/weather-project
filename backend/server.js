const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Example: GET /api/weather?city=London
app.get("/api/weather", async (req, res) => {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "City is required" });

    try {
        const apiKey = process.env.OPENWEATHER_API_KEY; // .env içinde sakla
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
