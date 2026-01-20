const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const City = require("./models/City");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB bağlantısı
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı!'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

// Hava durumu endpoint
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

// City autocomplete endpoint
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

// YENİ: Kayıtlı şehirleri getir
app.get("/api/saved-cities", async (req, res) => {
    try {
        const cities = await City.find().sort({ addedAt: -1 });
        res.json(cities.map(c => c.name));
    } catch (error) {
        res.status(500).json({ error: "Şehirler getirilemedi" });
    }
});

// YENİ: Şehir ekle
app.post("/api/saved-cities", async (req, res) => {
    const { city } = req.body;
    if (!city) return res.status(400).json({ error: "City is required" });

    try {
        // Önce şehir var mı kontrol et
        const existingCity = await City.findOne({ name: city });
        if (existingCity) {
            return res.json({ message: "City already exists", city: existingCity.name });
        }

        // Yeni şehir ekle
        const newCity = new City({ name: city });
        await newCity.save();
        res.json({ message: "City added", city: newCity.name });
    } catch (error) {
        res.status(500).json({ error: "Şehir eklenemedi" });
    }
});

// YENİ: Şehir sil
app.delete("/api/saved-cities/:city", async (req, res) => {
    const { city } = req.params;
    
    try {
        await City.deleteOne({ name: city });
        res.json({ message: "City removed" });
    } catch (error) {
        res.status(500).json({ error: "Şehir silinemedi" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));