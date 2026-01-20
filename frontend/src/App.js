import { useState, useEffect } from "react";
import axios from "axios";
import WeatherCard from "./components/WeatherCard";
import SearchBar from "./components/SearchBar";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // ← EN ÜSTE EKLE

function App() {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedCities();
  }, []);

  const loadSavedCities = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/saved-cities`); // ← DEĞİŞTİ
      const savedCities = res.data;
      
      if (savedCities.length === 0) {
        const defaultCities = ["London", "New York", "Tokyo"];
        for (const city of defaultCities) {
          await axios.post(`${API_URL}/api/saved-cities`, { city }); // ← DEĞİŞTİ
        }
        setCities(defaultCities);
        defaultCities.forEach(city => fetchWeather(city));
      } else {
        setCities(savedCities);
        savedCities.forEach(city => fetchWeather(city));
      }
      setLoading(false);
    } catch (err) {
      console.error("Kayıtlı şehirler yüklenemedi:", err);
      setLoading(false);
    }
  };

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(`${API_URL}/api/weather?city=${city}`); // ← DEĞİŞTİ
      setWeatherData(prev => {
        if (!prev.some(w => w.city === res.data.city)) {
          return [...prev, res.data];
        }
        return prev;
      });
    } catch (err) {
      console.error("Hava durumu getirilemedi:", err);
    }
  };

  const removeCity = async (cityName) => {
    try {
      await axios.delete(`${API_URL}/api/saved-cities/${cityName}`); // ← DEĞİŞTİ
      
      setWeatherData(prev => prev.filter(w => w.city !== cityName));
      setCities(prev => prev.filter(c => c !== cityName));
    } catch (err) {
      console.error("Şehir silinemedi:", err);
    }
  };

  const addCity = async (cityName) => {
    if (cities.includes(cityName)) {
      alert("Bu şehir zaten ekli!");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/saved-cities`, { city: cityName }); // ← DEĞİŞTİ
      
      setCities(prev => [...prev, cityName]);
      fetchWeather(cityName);
    } catch (err) {
      console.error("Şehir eklenemedi:", err);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <h1>Weather App</h1>
        <p style={{ color: 'white', textAlign: 'center' }}>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Weather App</h1>
      <SearchBar onSearch={addCity} />
      <div className="cards-container">
        {weatherData.map(w => (
          <WeatherCard key={w.city} weather={w} onRemove={removeCity} />
        ))}
      </div>
    </div>
  );
}

export default App;