import { useState, useEffect } from 'react';
import { Country, countries } from '../data/countries';

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Función para obtener la URL de la bandera con altura fija o tamaño específico
const getFlagUrl = (countryCode: string, height: number = 120): string => {
  // Para miniaturas (16px de altura), usar el formato 16x12
  if (height === 16) {
    return `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`;
  }
  // Para otros tamaños, usar el formato h{height}
  return `https://flagcdn.com/h${height}/${countryCode.toLowerCase()}.png`;
};

interface FlagGameProps {
  onCorrectGuess: (attempts: number, usedHint: boolean, totalHints: number) => void;
  onNewGame: () => void;
  gameOver: boolean;
  onGameOver: (isCorrect: boolean) => void;
}

// Interfaz para una ronda de juego
interface Round {
  country: Country;
  attempts: number;
  usedHint: boolean;
  completed: boolean;
}

const FlagGame: React.FC<FlagGameProps> = ({ onCorrectGuess, onNewGame, gameOver, onGameOver }) => {
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [attempts, setAttempts] = useState<Country[]>([]);
  const [message, setMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [gameOverState, setGameOverState] = useState(gameOver);
  
  // Estado para el sistema de rondas
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalHints, setTotalHints] = useState(0);
  const TOTAL_ROUNDS = 10;

  // Inicializar el juego
  useEffect(() => {
    startNewGame();
  }, []);

  // Reiniciar el juego cuando cambia gameOver de false a true
  useEffect(() => {
    if (gameOver === false && gameOverState === true) {
      startNewGame();
    }
    setGameOverState(gameOver);
  }, [gameOver]);

  // Filtrar sugerencias basadas en el input y excluir países ya intentados
  useEffect(() => {
    if (inputValue.length > 1) {
      const normalizedInput = normalizeText(inputValue);
      // Filtrar países que coinciden con la entrada y que no han sido intentados
      const attemptedCountryNames = attempts.map(a => normalizeText(a.name));
      const filteredCountries = countries.filter(country => 
        normalizeText(country.name).includes(normalizedInput) && 
        !attemptedCountryNames.includes(normalizeText(country.name))
      );
      setSuggestions(filteredCountries);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, attempts]);

  // Generar un país aleatorio que no esté en las rondas actuales
  const getRandomCountryForRound = (): Country => {
    const usedCountries = rounds.map(round => round.country.code);
    let availableCountries = countries.filter(country => !usedCountries.includes(country.code));
    
    // Si no hay suficientes países disponibles, usar todos los países
    if (availableCountries.length === 0) {
      availableCountries = countries;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    return availableCountries[randomIndex];
  };

  // Iniciar una nueva ronda
  const startNewRound = () => {
    if (currentRound < TOTAL_ROUNDS) {
      const newCountry = getRandomCountryForRound();
      setTargetCountry(newCountry);
      setInputValue('');
      setSuggestions([]);
      setAttempts([]);
      setMessage('');
      setShowHint(false);
      
      // Actualizar el estado de la ronda actual
      const updatedRounds = [...rounds];
      if (!updatedRounds[currentRound]) {
        updatedRounds[currentRound] = {
          country: newCountry,
          attempts: 0,
          usedHint: false,
          completed: false
        };
        setRounds(updatedRounds);
      }
    } else {
      // Todas las rondas completadas, finalizar el juego
      finishGame();
    }
  };

  // Iniciar un nuevo juego completo
  const startNewGame = () => {
    setRounds([]);
    setCurrentRound(0);
    setTotalAttempts(0);
    setTotalHints(0);
    setGameOverState(false);
    
    // Iniciar la primera ronda
    setTimeout(() => {
      startNewRound();
    }, 0);
  };

  // Finalizar el juego y enviar la puntuación
  const finishGame = () => {
    // Solo cuando se completan todas las rondas, notificar al componente padre
    onCorrectGuess(totalAttempts, totalHints > 0, totalHints);
    onGameOver(true);
    setGameOverState(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      // Seleccionar la primera sugerencia al presionar Enter
      const selectedCountry = suggestions[0];
      setInputValue(selectedCountry.name);
      handleGuessWithCountry(selectedCountry);
    }
  };

  const handleGuessWithCountry = (country: Country) => {
    // Verificar si ya se ha intentado con este país
    const normalizedName = normalizeText(country.name);
    if (attempts.some(attempt => normalizeText(attempt.name) === normalizedName)) {
      setMessage('Ya has intentado con este país.');
      return;
    }
    
    // Asegurarse de que rounds[currentRound] existe antes de incrementar los intentos
    if (!rounds[currentRound]) {
      // Si no existe, inicializarlo
      const newRounds = [...rounds];
      newRounds[currentRound] = {
        country: targetCountry!,
        attempts: 0,
        usedHint: showHint,
        completed: false
      };
      setRounds(newRounds);
    }
    
    // Incrementar el número de intentos para la ronda actual
    const updatedRounds = [...rounds];
    updatedRounds[currentRound].attempts += 1;
    setRounds(updatedRounds);
    setTotalAttempts(prev => prev + 1);
    
    // Verificar si es el país correcto
    if (targetCountry && normalizeText(country.name) === normalizeText(targetCountry.name)) {
      // Actualizar el estado de la ronda actual como completada
      updatedRounds[currentRound].completed = true;
      updatedRounds[currentRound].usedHint = showHint;
      setRounds(updatedRounds);
      
      // Actualizar el contador de pistas si se usó una
      if (showHint) {
        setTotalHints(prev => prev + 1);
      }
      
      // Mostrar mensaje de éxito
      setMessage(`¡Correcto! Has adivinado el país. Ronda ${currentRound + 1}/${TOTAL_ROUNDS} completada.`);
      
      // Pasar a la siguiente ronda después de un breve retraso
      setTimeout(() => {
        if (currentRound + 1 < TOTAL_ROUNDS) {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        } else {
          // Todas las rondas completadas
          finishGame();
        }
      }, 1500);
    } else {
      setMessage('Incorrecto. Intenta de nuevo.');
      setAttempts([...attempts, country]);
      setInputValue('');
      setSuggestions([]);
    }
  };

  const handleGuess = () => {
    if (inputValue.trim() === '') return;
    
    // Buscar el país que coincide con la entrada del usuario
    const normalizedInput = normalizeText(inputValue);
    const guessedCountry = countries.find(country => 
      normalizeText(country.name) === normalizedInput
    );
    
    // Verificar si el país existe
    if (!guessedCountry) {
      setMessage('País no encontrado. Intenta con otro nombre.');
      return;
    }
    
    handleGuessWithCountry(guessedCountry);
  };

  const showHintHandler = () => {
    setShowHint(true);
    
    // Marcar que se usó una pista en esta ronda
    const updatedRounds = [...rounds];
    updatedRounds[currentRound].usedHint = true;
    setRounds(updatedRounds);
  };

  // Función para generar una pista más vaga sobre el continente
  const getVagueHint = (country: Country): string => {
    const continent = getContinent(country);
    const vagueContinent = `${continent} o sus alrededores`;
    
    return `Podría estar en ${vagueContinent}, pero estoy seguro que su capital es ${country.capital}.`;
  };

  return (
    <div className="flag-game-container">
      {targetCountry && (
        <div className="flag-container">
          <div className="round-indicator">
            <h3>Ronda {currentRound + 1} de {TOTAL_ROUNDS}</h3>
            <p>Intentos totales: {totalAttempts} | Pistas usadas: {totalHints}</p>
          </div>
          
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
              onKeyDown={handleKeyDown}
              placeholder="Escribe el nombre del país..."
              className="country-input"
              disabled={gameOverState}
            />
            
            {message && <p className={message.includes('Correcto') ? 'success-message' : 'error-message'}>{message}</p>}
            
            {suggestions.length > 0 && !gameOverState && (
              <ul className="suggestions-list">
                {suggestions.map(country => (
                  <li 
                    key={country.name} 
                    onClick={() => {
                      setInputValue(country.name);
                      handleGuessWithCountry(country);
                    }}
                    className="suggestion-item"
                  >
                    <span className="country-name">{country.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flag-game-controls">
            {!gameOverState && attempts.length >= 3 && !showHint && (
              <button className="hint-button" onClick={showHintHandler}>
                Mostrar pista
              </button>
            )}
            
            {showHint && (
              <div className="hint-container">
                <p>{getVagueHint(targetCountry)}</p>
              </div>
            )}
            
            {gameOverState && (
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
              <h4>Intentos en esta ronda ({attempts.length}):</h4>
              <ul className="attempts-list">
                {attempts.map((attempt, index) => (
                  <li key={index} className="attempt-item">
                    <img 
                      src={getFlagUrl(attempt.code, 16)} 
                      alt={`Bandera de ${attempt.name}`}
                      className="country-flag"
                      onError={(e) => {
                        // Si la imagen falla, usar una imagen de respaldo que coincida con el tamaño
                        (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                      }}
                    />
                    {attempt.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {rounds.filter(round => round.completed).length > 0 && (
            <div className="completed-rounds">
              <h4>Rondas completadas:</h4>
              <ul className="rounds-list">
                {rounds.filter(round => round.completed).map((round, index) => (
                  <li key={index} className="round-item">
                    <span>Ronda {index + 1}: </span>
                    <img 
                      src={getFlagUrl(round.country.code, 16)} 
                      alt={`Bandera de ${round.country.name}`}
                      className="country-flag"
                    />
                    <span>{round.country.name}</span>
                    <span> - {round.attempts} intentos</span>
                    {round.usedHint && <span> (con pista)</span>}
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