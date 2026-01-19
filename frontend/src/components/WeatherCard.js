function WeatherCard({ weather, onRemove }) {
  return (
    <div className="weather-card">
      <h2>{weather.city}</h2>
      <p>{weather.temp} °C</p>
      <p>{weather.weather}</p>
      <img src={`http://openweathermap.org/img/wn/${weather.icon}@2x.png`} alt={weather.weather} />
      <button onClick={() => onRemove(weather.city)}>Remove</button>
    </div>
  );
}

export default WeatherCard;
