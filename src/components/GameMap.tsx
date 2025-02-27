import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { Country, calculateDistance, countries } from '../data/countries';

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Función para obtener la URL de la bandera
const getFlagUrl = (countryCode: string): string => {
  return `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
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
  const globeRef = useRef<any>();
  const [globeWidth, setGlobeWidth] = useState(window.innerWidth * 0.6);

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

  // Efecto para inicializar el globo
  useEffect(() => {
    if (globeRef.current) {
      // Configurar la rotación automática
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      
      // Configurar la cámara para una mejor visualización
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
    }
  }, []);

  // Efecto para ajustar el tamaño del globo cuando cambia el tamaño de la ventana
  useEffect(() => {
    const handleResize = () => {
      setGlobeWidth(window.innerWidth > 1200 ? window.innerWidth * 0.6 : window.innerWidth * 0.9);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Ajustar tamaño inicial

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const getDistanceColor = (distance: number) => {
    if (distance < 500) return 'green';
    if (distance < 1500) return 'yellow';
    if (distance < 3000) return 'orange';
    return 'red';
  };

  // Preparar los marcadores para el globo
  const markerData = guesses.map(guess => ({
    lat: guess.country.latitude,
    lng: guess.country.longitude,
    color: getDistanceColor(guess.distance),
    name: guess.country.name,
    distance: guess.distance
  }));

  return (
    <div className="game-map-container">
      <div className="globe-and-input">
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
                  <img 
                    src={getFlagUrl(country.code)} 
                    alt={`Bandera de ${country.name}`}
                    className="country-flag"
                    onError={(e) => {
                      // Si la imagen falla, usar una imagen de respaldo
                      (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                    }}
                  />
                  <span className="country-name">{country.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div style={{ height: '500px', width: '100%' }}>
          <Globe
            ref={globeRef}
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
            backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
            pointsData={markerData}
            pointColor="color"
            pointAltitude={0.1}
            pointRadius={0.5}
            pointLabel={(d: any) => `${d.name}: ${d.distance} km`}
            width={globeWidth}
            height={500}
            atmosphereColor="rgba(200, 220, 255, 0.4)"
            showAtmosphere={true}
          />
        </div>
      </div>
      
      <div className="guesses-container">
        <h3>Intentos</h3>
        {guesses.length === 0 ? (
          <p>Aún no has realizado ningún intento.</p>
        ) : (
          <ul className="guesses-list">
            {guesses.map((guess, index) => (
              <li 
                key={index} 
                className="guess-item"
                style={{ borderLeft: `4px solid ${getDistanceColor(guess.distance)}` }}
              >
                <div className="guess-header">
                  <img 
                    src={getFlagUrl(guess.country.code)} 
                    alt={`Bandera de ${guess.country.name}`}
                    className="country-flag"
                    onError={(e) => {
                      // Si la imagen falla, usar una imagen de respaldo
                      (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                    }}
                  />
                  <span style={{ fontWeight: 'bold' }}>{guess.country.name}</span>
                </div>
                <div>Capital: {guess.country.capital}</div>
                <div style={{ 
                  marginTop: '5px', 
                  color: getDistanceColor(guess.distance) === 'green' ? 'green' : 
                         getDistanceColor(guess.distance) === 'yellow' ? '#b0b000' : 
                         getDistanceColor(guess.distance) === 'orange' ? 'orange' : 'red',
                  fontWeight: 'bold'
                }}>
                  Distancia: {guess.distance} km
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default GameMap; 