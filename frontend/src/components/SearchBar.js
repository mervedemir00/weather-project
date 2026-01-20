import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // ← EN ÜSTE EKLE

function SearchBar({ onSearch }) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (input.trim().length > 0) {
      const timer = setTimeout(() => {
        fetchCities(input);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [input]);

  const fetchCities = async (query) => {
    try {
      const res = await axios.get(`${API_URL}/api/cities?q=${query}`); // ← DEĞİŞTİ
      setSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error("Şehir arama hatası:", err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() !== "") {
      onSearch(input.trim());
      setInput("");
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (cityName) => {
    onSearch(cityName);
    setInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter city name"
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        />
        <button type="submit">Add City</button>
      </form>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions">
          {suggestions.map((city, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(city.name)}
            >
              <strong>{city.name}</strong>
              {city.state && `, ${city.state}`}
              <span className="country"> ({city.country})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;