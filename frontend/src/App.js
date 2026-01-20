import { useState, useEffect } from "react";
import axios from "axios";
import WeatherCard from "./components/WeatherCard";
import SearchBar from "./components/SearchBar";
import "./App.css";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function App() {
  const [cities, setCities] = useState([]);
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");

  const loadSavedCities = async () => {
    try {
      setLoadingMessage("Connecting to server...");
      
      const res = await axios.get(`${API_URL}/api/saved-cities`, {
        timeout: 60000
      });
      
      setLoadingMessage("Loading cities...");
      const savedCities = res.data;
      
      if (savedCities.length === 0) {
        const defaultCities = ["London", "New York", "Tokyo"];
        for (const city of defaultCities) {
          await axios.post(`${API_URL}/api/saved-cities`, { city });
        }
        setCities(defaultCities);
        setLoadingMessage("Fetching weather data...");
        defaultCities.forEach(city => fetchWeather(city));
      } else {
        setCities(savedCities);
        setLoadingMessage("Fetching weather data...");
        savedCities.forEach(city => fetchWeather(city));
      }
      
      setTimeout(() => {
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Unable to load saved cities:", err);
      setLoadingMessage("Server is waking up, please wait...");
      
      setTimeout(() => {
        loadSavedCities();
      }, 3000);
    }
  };

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(`${API_URL}/api/weather?city=${city}`);
      setWeatherData(prev => {
        if (!prev.some(w => w.city === res.data.city)) {
          return [...prev, res.data];
        }
        return prev;
      });
    } catch (err) {
      console.error("Unable to fetch weather:", err);
    }
  };

  useEffect(() => {
    loadSavedCities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const removeCity = async (cityName) => {
    try {
      await axios.delete(`${API_URL}/api/saved-cities/${cityName}`);
      
      setWeatherData(prev => prev.filter(w => w.city !== cityName));
      setCities(prev => prev.filter(c => c !== cityName));
    } catch (err) {
      console.error("Unable to remove city:", err);
    }
  };

  const addCity = async (cityName) => {
    if (cities.includes(cityName)) {
      alert("This city is already added!");
      return;
    }

    try {
      await axios.post(`${API_URL}/api/saved-cities`, { city: cityName });
      
      setCities(prev => [...prev, cityName]);
      fetchWeather(cityName);
    } catch (err) {
      console.error("Unable to add city:", err);
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <div className="spinner"></div>
          <h2>{loadingMessage}</h2>
          <p>The server may take up to 60 seconds to wake up...</p>
        </div>
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