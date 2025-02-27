import { useState, useEffect } from 'react';
import { Country, countries } from '../data/countries';

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Función para obtener la URL de la bandera con altura fija
const getFlagUrl = (countryCode: string, height: number = 120): string => {
  return `https://flagcdn.com/h${height}/${countryCode.toLowerCase()}.png`;
};

interface FlagGameProps {
  onCorrectGuess: () => void;
  onNewGame: () => void;
  gameOver: boolean;
}

const FlagGame: React.FC<FlagGameProps> = ({ onCorrectGuess, onNewGame, gameOver }) => {
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [attempts, setAttempts] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);

  // Inicializar el juego
  useEffect(() => {
    startNewGame();
  }, []);

  // Filtrar sugerencias basadas en el input
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

  const startNewGame = () => {
    const randomIndex = Math.floor(Math.random() * countries.length);
    setTargetCountry(countries[randomIndex]);
    setInputValue('');
    setSuggestions([]);
    setAttempts([]);
    setMessage('');
    setShowHint(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setMessage('');
  };

  const handleGuess = (country: Country) => {
    if (gameOver) return;

    // Verificar si ya se ha intentado con este país
    if (attempts.includes(country.name)) {
      setMessage('¡Ya has intentado con este país!');
      return;
    }

    // Añadir a la lista de intentos
    setAttempts(prev => [...prev, country.name]);
    
    // Verificar si es correcto
    if (targetCountry && normalizeText(country.name) === normalizeText(targetCountry.name)) {
      setMessage(`¡Correcto! La bandera pertenece a ${targetCountry.name}`);
      onCorrectGuess();
    } else {
      setMessage(`Incorrecto. Sigue intentando.`);
    }

    setInputValue('');
    setSuggestions([]);
  };

  const showHintHandler = () => {
    setShowHint(true);
  };

  return (
    <div className="flag-game-container">
      {targetCountry && (
        <div className="flag-container">
          <img 
            src={getFlagUrl(targetCountry.code, 120)} 
            alt="Bandera para adivinar" 
            className="flag-image"
            onError={(e) => {
              // Si la imagen falla, usar una imagen de respaldo
              (e.target as HTMLImageElement).src = 'https://flagcdn.com/h120/xx.png';
            }}
          />
          
          <div className="flag-input-container">
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Escribe el nombre del país..."
              className="country-input"
              disabled={gameOver}
            />
            
            {message && <p className={message.includes('Correcto') ? 'success-message' : 'error-message'}>{message}</p>}
            
            {suggestions.length > 0 && !gameOver && (
              <ul className="suggestions-list">
                {suggestions.map(country => (
                  <li 
                    key={country.name} 
                    onClick={() => handleGuess(country)}
                    className="suggestion-item"
                  >
                    <span className="country-name">{country.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flag-game-controls">
            {!gameOver && attempts.length >= 3 && !showHint && (
              <button className="hint-button" onClick={showHintHandler}>
                Mostrar pista
              </button>
            )}
            
            {showHint && (
              <div className="hint-container">
                <p>Pista: El país está en {getContinent(targetCountry)} y su capital es {targetCountry.capital}.</p>
              </div>
            )}
            
            {gameOver && (
              <button className="new-game-button" onClick={() => {
                startNewGame();
                onNewGame();
              }}>
                Nuevo juego
              </button>
            )}
          </div>
          
          {attempts.length > 0 && (
            <div className="attempts-container">
              <h4>Intentos ({attempts.length}):</h4>
              <ul className="attempts-list">
                {attempts.map((attempt, index) => (
                  <li key={index} className="attempt-item">
                    {attempt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Función para determinar el continente de un país (simplificada)
const getContinent = (country: Country): string => {
  const { latitude, longitude } = country;
  
  // Clasificación simplificada por coordenadas
  if (latitude > 30 && longitude > -30 && longitude < 60) return "Europa";
  if (latitude > 0 && longitude > 60) return "Asia";
  if (latitude < 0 && longitude > 100) return "Oceanía";
  if (latitude < 0 && longitude < 50) return "África";
  if (latitude > 0 && latitude < 40 && longitude < -30) return "América";
  
  return "desconocido";
};

export default FlagGame; 