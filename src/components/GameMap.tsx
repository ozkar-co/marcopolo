import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon, LatLngExpression } from 'leaflet';
import { Country, calculateDistance, countries } from '../data/countries';

// Solucionar problema de iconos en React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

interface Guess {
  country: Country;
  distance: number;
}

interface GameMapProps {
  targetCountry: Country;
  guesses: Guess[];
  addGuess: (guess: Guess) => void;
}

const GameMap = ({ targetCountry, guesses, addGuess }: GameMapProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (inputValue.length > 1) {
      const normalizedInput = normalizeText(inputValue);
      const filteredCountries = countries.filter(country => 
        normalizeText(country.name).includes(normalizedInput)
      );
      setSuggestions(filteredCountries);
    } else {
      setSuggestions([]);
    }
  }, [inputValue]);

  const handleGuess = (country: Country) => {
    // Verificar si ya se ha adivinado este país
    if (guesses.some(guess => normalizeText(guess.country.name) === normalizeText(country.name))) {
      setError('¡Ya has intentado con este país!');
      return;
    }

    const distance = calculateDistance(
      country.latitude, 
      country.longitude, 
      targetCountry.latitude, 
      targetCountry.longitude
    );

    addGuess({ country, distance });
    setInputValue('');
    setSuggestions([]);
    setError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setError('');
  };

  const getCircleColor = (distance: number) => {
    if (distance < 500) return 'green';
    if (distance < 1500) return 'yellow';
    if (distance < 3000) return 'orange';
    return 'red';
  };

  return (
    <div className="game-map-container">
      <div className="input-container">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Escribe el nombre de un país..."
          className="country-input"
        />
        {error && <p className="error-message">{error}</p>}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map(country => (
              <li 
                key={country.name} 
                onClick={() => handleGuess(country)}
                className="suggestion-item"
              >
                {country.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {guesses.map((guess, index) => {
          const position: LatLngExpression = [guess.country.latitude, guess.country.longitude];
          return (
            <div key={index}>
              <Marker position={position} icon={DefaultIcon}>
                <Popup>
                  {guess.country.name} <br />
                  Distancia: {guess.distance} km
                </Popup>
              </Marker>
              <Circle 
                center={position}
                radius={50000}
                pathOptions={{ color: getCircleColor(guess.distance), fillColor: getCircleColor(guess.distance) }}
              />
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default GameMap; 