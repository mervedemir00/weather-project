import { useState, useEffect } from "react";
import axios from "axios";
import WeatherCard from "./components/WeatherCard";
import SearchBar from "./components/SearchBar";

function App() {
  const defaultCities = ["London", "New York", "Tokyo"];
  const [cities, setCities] = useState(defaultCities);
  const [weatherData, setWeatherData] = useState([]);

  // İlk yüklemede default şehirleri getir
  useEffect(() => {
    defaultCities.forEach(city => fetchWeather(city));
  }, []); // Boş dependency array - sadece ilk render'da çalışır

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/weather?city=${city}`);
      setWeatherData(prev => {
        // Aynı şehir tekrar eklenmesin
        if (!prev.some(w => w.city === res.data.city)) {
          return [...prev, res.data];
        }
        return prev;
      });
    } catch (err) {
      console.error("Hava durumu getirilemedi:", err);
    }
  };

  const removeCity = (cityName) => {
    setWeatherData(prev => prev.filter(w => w.city !== cityName));
    setCities(prev => prev.filter(c => c !== cityName));
  };

  const addCity = (cityName) => {
    if (!cities.includes(cityName)) {
      setCities(prev => [...prev, cityName]);
      fetchWeather(cityName); // Yeni şehir eklenince hemen fetch et
    }
  };

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