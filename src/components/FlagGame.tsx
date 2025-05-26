import { useState, useEffect, useCallback } from 'react';
import { Country, countries } from '../data/countries';

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};

// Función para obtener la URL de la bandera
const getFlagUrl = (countryCode: string, height: number = 120): string => {
  return height === 16
    ? `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`
    : `https://flagcdn.com/h${height}/${countryCode.toLowerCase()}.png`;
};

interface FlagGameProps {
  onCorrectGuess: (attempts: number, usedHint: boolean, totalHints: number, timeSpent: number, hardestCountry: { name: string; code: string; attempts: number }) => void;
  onNewGame: () => void;
  gameOver: boolean;
  onGameOver: (isCorrect: boolean) => void;
}

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
  const [isProcessingSelection, setIsProcessingSelection] = useState(false);
  
  // Estado para el sistema de rondas
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [totalHints, setTotalHints] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [hardestCountry, setHardestCountry] = useState<{ name: string; code: string; attempts: number } | null>(null);
  
  const TOTAL_ROUNDS = 10;

  // Timer effect
  useEffect(() => {
    let timer: number;
    if (!gameOverState && startTime > 0) {
      timer = window.setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameOverState, startTime]);

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

  // Filtrar sugerencias basadas en el input
  useEffect(() => {
    if (inputValue.length > 1) {
      const normalizedInput = normalizeText(inputValue);
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
  const getRandomCountryForRound = useCallback((): Country => {
    const usedCountries = rounds.map(round => round.country.code);
    let availableCountries = countries.filter(country => !usedCountries.includes(country.code));
    
    if (availableCountries.length === 0) {
      availableCountries = countries;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCountries.length);
    return availableCountries[randomIndex];
  }, [rounds]);

  // Iniciar una nueva ronda
  const startNewRound = useCallback(() => {
    if (currentRound < TOTAL_ROUNDS) {
      const newCountry = getRandomCountryForRound();
      setTargetCountry(newCountry);
      setInputValue('');
      setSuggestions([]);
      setAttempts([]);
      setMessage('');
      setShowHint(false);
      
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
      finishGame();
    }
  }, [currentRound, getRandomCountryForRound, rounds]);

  // Iniciar un nuevo juego completo
  const startNewGame = useCallback(() => {
    setRounds([]);
    setCurrentRound(0);
    setTotalAttempts(0);
    setTotalHints(0);
    setGameOverState(false);
    setStartTime(Date.now());
    setElapsedTime(0);
    setHardestCountry(null);
    
    // Iniciar la primera ronda
    setTimeout(() => {
      startNewRound();
    }, 0);
  }, [startNewRound]);

  // Finalizar el juego y enviar la puntuación
  const finishGame = useCallback(() => {
    // Encontrar el país con más intentos
    const hardestRound = rounds.reduce((max, round) => 
      round.attempts > max.attempts ? round : max
    , rounds[0]);

    const hardestCountryData = {
      name: hardestRound.country.name,
      code: hardestRound.country.code,
      attempts: hardestRound.attempts
    };

    onCorrectGuess(totalAttempts, totalHints > 0, totalHints, elapsedTime, hardestCountryData);
    onGameOver(true);
    setGameOverState(true);
  }, [rounds, totalAttempts, totalHints, elapsedTime, onCorrectGuess, onGameOver]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0 && !isProcessingSelection) {
      e.preventDefault();
      setIsProcessingSelection(true);
      const selectedCountry = suggestions[0];
      setInputValue('');
      setSuggestions([]);
      handleGuessWithCountry(selectedCountry);
      setTimeout(() => {
        setIsProcessingSelection(false);
      }, 100);
    }
  };

  const handleGuessWithCountry = useCallback((country: Country) => {
    if (isProcessingSelection) return;
    setIsProcessingSelection(true);
    
    const normalizedName = normalizeText(country.name);
    if (attempts.some(attempt => normalizeText(attempt.name) === normalizedName)) {
      setMessage('Ya has intentado con este país.');
      setIsProcessingSelection(false);
      return;
    }
    
    // Create a new rounds array with the current round initialized if needed
    const updatedRounds = [...rounds];
    if (!updatedRounds[currentRound]) {
      updatedRounds[currentRound] = {
        country: targetCountry!,
        attempts: 0,
        usedHint: showHint,
        completed: false
      };
    }
    
    // Update the round's attempts
    updatedRounds[currentRound] = {
      ...updatedRounds[currentRound],
      attempts: (updatedRounds[currentRound].attempts || 0) + 1
    };
    
    // Update state
    setRounds(updatedRounds);
    setTotalAttempts(prev => prev + 1);
    
    if (targetCountry && normalizeText(country.name) === normalizeText(targetCountry.name)) {
      // Update the round as completed
      updatedRounds[currentRound] = {
        ...updatedRounds[currentRound],
        completed: true,
        usedHint: showHint
      };
      setRounds(updatedRounds);
      
      if (showHint) {
        setTotalHints(prev => prev + 1);
      }
      
      setMessage(`¡Correcto! Has adivinado el país. Ronda ${currentRound + 1}/${TOTAL_ROUNDS} completada.`);
      
      setTimeout(() => {
        if (currentRound + 1 < TOTAL_ROUNDS) {
          setCurrentRound(prev => prev + 1);
          startNewRound();
        } else {
          finishGame();
        }
      }, 1500);
    } else {
      setMessage('Incorrecto. Intenta de nuevo.');
      setAttempts([...attempts, country]);
      setInputValue('');
      setSuggestions([]);
    }
    
    setTimeout(() => {
      setIsProcessingSelection(false);
    }, 100);
  }, [attempts, currentRound, finishGame, isProcessingSelection, rounds, showHint, startNewRound, targetCountry]);

  const showHintHandler = () => {
    setShowHint(true);
    const updatedRounds = [...rounds];
    updatedRounds[currentRound].usedHint = true;
    setRounds(updatedRounds);
  };

  const getVagueHint = (country: Country): string => {
    const continent = getContinent(country);
    return `Podría estar en ${continent} o sus alrededores, pero estoy seguro que su capital es ${country.capital}.`;
  };

  return (
    <div className="flag-game-container">
      {targetCountry && (
        <div className="flag-container">
          <div className="round-indicator">
            <h3>Ronda {currentRound + 1} de {TOTAL_ROUNDS}</h3>
            <p>Intentos totales: {totalAttempts} | Pistas usadas: {totalHints} | Tiempo: {elapsedTime}s</p>
          </div>
          
          <img 
            src={getFlagUrl(targetCountry.code, 120)} 
            alt="Bandera para adivinar" 
            className="flag-image"
            onError={(e) => {
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
              autoComplete="off"
            />
            
            {message && <p className={message.includes('Correcto') ? 'success-message' : 'error-message'}>{message}</p>}
            
            {suggestions.length > 0 && !gameOverState && (
              <ul className="suggestions-list">
                {suggestions.map(country => (
                  <li 
                    key={country.name} 
                    onClick={() => {
                      if (!isProcessingSelection) {
                        setIsProcessingSelection(true);
                        setInputValue('');
                        setSuggestions([]);
                        handleGuessWithCountry(country);
                        setTimeout(() => {
                          setIsProcessingSelection(false);
                        }, 100);
                      }
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
  
  if (latitude > 30 && longitude > -30 && longitude < 60) return "Europa";
  if (latitude > 0 && longitude > 60) return "Asia";
  if (latitude < 0 && longitude > 100) return "Oceanía";
  if (latitude < 0 && longitude < 50) return "África";
  if (latitude > 0 && latitude < 40 && longitude < -30) return "América";
  
  return "desconocido";
};

export default FlagGame;