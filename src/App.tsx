import { useState, useEffect } from 'react'
import './App.css'
import GameMap from './components/GameMap'
import FlagGame from './components/FlagGame'
import { Country, getRandomCountry } from './data/countries'
import Highscores from './components/Highscores'
import { GameType } from './types/game'
import { submitHighscore, Highscore } from './services/highscores'
import AllCountriesGame from './components/AllCountriesGame'

interface Guess {
  country: Country;
  distance: number;
}

interface WinningCountry {
  name: string;
  code: string;
  attempts?: number;
}

enum PageType {
  HOME = 'home',
  GAME = 'game',
  ABOUT = 'about'
}

function App() {
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.HOME);
  const [showModal, setShowModal] = useState(false);
  const [showHighscores, setShowHighscores] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [usedHint, setUsedHint] = useState(false);
  const [totalHints, setTotalHints] = useState(0);
  const [winningCountry, setWinningCountry] = useState<WinningCountry | undefined>(undefined);
  const [playerName, setPlayerName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [resetGlobe, setResetGlobe] = useState(false);
  // Estado para controlar si el juego de banderas ha completado todas las rondas
  const [flagGameCompleted, setFlagGameCompleted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [guessedCount, setGuessedCount] = useState(0); // Para ALL_COUNTRIES
  const [missingCount, setMissingCount] = useState(0); // Para ALL_COUNTRIES

  // Efecto para cambiar la clase del body según el estado del juego
  useEffect(() => {
    const bodyElement = document.body;
    
    if (currentPage === PageType.HOME || currentPage === PageType.ABOUT) {
      bodyElement.className = 'home-page';
    } else {
      bodyElement.className = 'game-page';
    }
    
    // Limpieza al desmontar
    return () => {
      bodyElement.className = '';
    };
  }, [currentPage]);

  useEffect(() => {
    if (gameStarted && !targetCountry && gameType === GameType.COUNTRY_DISTANCE) {
      setTargetCountry(getRandomCountry());
    }
  }, [gameStarted, targetCountry, gameType]);

  useEffect(() => {
    // Mostrar el modal cuando el juego termina
    if (gameOver && (gameType === GameType.COUNTRY_DISTANCE || flagGameCompleted)) {
      setShowModal(true);
    }
  }, [gameOver, gameType, flagGameCompleted]);

  const addGuess = (guess: Guess) => {
    setGuesses(prev => [...prev, guess]);
    
    // Actualizar los intentos y la distancia total
    setAttempts(prev => prev + 1);
    setTotalDistance(prev => prev + guess.distance);
    
    // Verificar si el usuario ha adivinado correctamente
    if (guess.distance === 0 && targetCountry) {
      // Guardar el país ganador
      setWinningCountry({
        name: targetCountry.name,
        code: targetCountry.code
      });
      setGameOver(true);
    }
  };

  const startNewGame = (type: GameType) => {
    if (type === GameType.COUNTRY_DISTANCE) {
      setTargetCountry(getRandomCountry());
      setGuesses([]);
      // Activar el reinicio del globo
      setResetGlobe(true);
      // Desactivar después de un breve tiempo para permitir futuros reinicios
      setTimeout(() => setResetGlobe(false), 100);
    }
    setGameOver(false);
    setGameStarted(true);
    setGameType(type);
    setCurrentPage(PageType.GAME);
    setShowModal(false);
    setAttempts(0);
    setTotalDistance(0);
    setUsedHint(false);
    setTotalHints(0);
    setWinningCountry(undefined);
    setPlayerName('');
    setScoreSubmitted(false);
    setFlagGameCompleted(false);
  };

  const handleCorrectFlagGuess = (attemptsCount: number, hintUsed: boolean, hintsCount: number, timeSpent: number, hardestCountry: { name: string; code: string; attempts: number }) => {
    setAttempts(attemptsCount);
    setUsedHint(hintUsed);
    setTotalHints(hintsCount);
    setGameTime(timeSpent);
    setWinningCountry({
      name: hardestCountry.name,
      code: hardestCountry.code,
      attempts: hardestCountry.attempts
    });
    setGameOver(true);
    setFlagGameCompleted(true);
  };

  const handleNewFlagGame = () => {
    setGameOver(false);
    setShowModal(false);
    setAttempts(0);
    setTotalDistance(0);
    setUsedHint(false);
    setTotalHints(0);
    setWinningCountry(undefined);
    setPlayerName('');
    setScoreSubmitted(false);
    setFlagGameCompleted(false);
  };

  const goToHomePage = () => {
    setGameStarted(false);
    setGameType(null);
    setCurrentPage(PageType.HOME);
    setShowModal(false);
    setScoreSubmitted(false);
    setFlagGameCompleted(false);
  };

  const goToAboutPage = () => {
    setCurrentPage(PageType.ABOUT);
  };

  // Función para reiniciar el juego actual
  const restartCurrentGame = () => {
    if (gameType === GameType.COUNTRY_DISTANCE) {
      startNewGame(GameType.COUNTRY_DISTANCE);
    } else {
      handleNewFlagGame();
    }
    setShowModal(false);
    setScoreSubmitted(false);
  };

  // Función para mostrar los highscores
  const toggleHighscores = () => {
    setShowHighscores(!showHighscores);
  };

  // Manejar el cambio en el nombre del jugador
  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  // Guardar la puntuación
  const handleSaveHighscore = async (playerName: string, score: number, attempts: number, hints: number, winningCountry?: WinningCountry) => {
    try {
      let highscore: Highscore;
      if (gameType === GameType.ALL_COUNTRIES) {
        highscore = {
          game: 'all_countries',
          player: playerName,
          score: totalDistance, // tiempo
          attempts: missingCount, // faltantes
          hints: totalHints,
          ...(winningCountry && {
            win_country_name: winningCountry.name,
            win_country_code: winningCountry.code,
            win_country_attempts: undefined
          })
        };
      } else if (gameType === GameType.COUNTRY_DISTANCE) {
        highscore = {
          game: 'country_distance',
          player: playerName,
          score: totalDistance,
          attempts,
          hints,
          ...(winningCountry && {
            win_country_name: winningCountry.name,
            win_country_code: winningCountry.code,
            win_country_attempts: winningCountry.attempts
          })
        };
      } else {
        highscore = {
          game: 'flag',
          player: playerName,
          score: gameTime,
          attempts,
          hints,
          ...(winningCountry && {
            win_country_name: winningCountry.name,
            win_country_code: winningCountry.code,
            win_country_attempts: winningCountry.attempts
          })
        };
      }
      await submitHighscore(highscore);
      setShowHighscores(true);
      setScoreSubmitted(true);
      setShowModal(false); // Cierra el modal después de guardar
    } catch (error) {
      console.error('Error saving highscore:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <h1>Marco Polo</h1>
          {currentPage !== PageType.HOME ? (
            <button className="back-button" onClick={goToHomePage}>
              Volver
            </button>
          ) : (
            <p className="header-subtitle">
              "Explorando el mundo, descubriendo maravillas y aventuras inimaginables en cada rincón del planeta."
            </p>
          )}
        </div>
      </header>

      <main className="main-content">
        {currentPage === PageType.HOME && (
          <div className="start-screen">
            <p>Elige uno de nuestros juegos geográficos:</p>
            
            <div className="game-selection">
              <div className="game-option">
                <h3>Adivina el País</h3>
                <p>Adivina un país aleatorio basado en su ubicación en el mapa.</p>
                <button className="start-button" onClick={() => startNewGame(GameType.COUNTRY_DISTANCE)}>
                  Jugar
                </button>
              </div>
              
              <div className="game-option">
                <h3>Adivina la Bandera</h3>
                <p>Identifica a qué país pertenece la bandera mostrada.</p>
                <button className="start-button" onClick={() => startNewGame(GameType.FLAG)}>
                  Jugar
                </button>
              </div>
              <div className="game-option">
                <h3>Todos los Países</h3>
                <p>Escribe todos los países que puedas lo más rápido posible.</p>
                <button className="start-button" onClick={() => startNewGame(GameType.ALL_COUNTRIES)}>
                  Jugar
                </button>
              </div>
            </div>

            <div className="about-section">
              <button className="about-button" onClick={goToAboutPage}>
                Saber más
              </button>
            </div>
          </div>
        )}

        {currentPage === PageType.ABOUT && (
          <div className="about-screen">
            <h2>Nuestra Historia</h2>
            <div className="about-content">
              <p>
                MarcoPolo nació de la pasión por los viajes, la geografía y los retos mentales. 
                Inspirados por el gran explorador Marco Polo, quien recorrió el mundo descubriendo 
                nuevas culturas y lugares, creamos estos juegos para compartir nuestra fascinación 
                por el mundo que nos rodea.
              </p>
              <p>
                El nombre "Marco Polo" fue elegido como homenaje a uno de los más grandes exploradores 
                de la historia, cuyo espíritu aventurero y curiosidad insaciable nos inspira cada día.
              </p>
              <p>
                Este proyecto fue inspirado por <strong>Alejandro Sánchez</strong> y construido con pasión por 
                <a href="https://ozkar.co" target="_blank" rel="noopener noreferrer"> Oz</a>. 
                Somos dos primos que compartimos el amor por los viajes, los puzzles y los retos geográficos.
              </p>
              <p>
                Esperamos que disfrutes de estos juegos tanto como nosotros disfrutamos creándolos. 
                ¡Que comience la aventura!
              </p>
            </div>
          </div>
        )}

        {currentPage === PageType.GAME && (
          <div className="game-container">
            {gameType === GameType.COUNTRY_DISTANCE && targetCountry && (
              <GameMap 
                targetCountry={targetCountry} 
                guesses={guesses} 
                addGuess={addGuess}
                resetGlobe={resetGlobe}
                gameOver={gameOver}
              />
            )}

            {gameType === GameType.FLAG && (
              <FlagGame 
                onCorrectGuess={handleCorrectFlagGuess}
                onNewGame={handleNewFlagGame}
                gameOver={gameOver}
                onGameOver={(isCorrect) => {
                  // Solo establecer gameOver a true si se han completado todas las rondas
                  if (isCorrect && flagGameCompleted) {
                    setGameOver(true);
                  }
                }}
              />
            )}

            {gameType === GameType.ALL_COUNTRIES && (
              <AllCountriesGame
                gameOver={gameOver}
                onGameOver={(score, attempts, winningCountry, guessedCountries, time) => {
                  if (!gameOver) {  // Solo actualizar si el juego no ha terminado
                    setGameOver(true);
                    setGuessedCount(guessedCountries.length);
                    setMissingCount(attempts);
                    setTotalDistance(score); // Aquí el score es el tiempo
                    setWinningCountry({
                      name: winningCountry.name,
                      code: winningCountry.code
                    });
                    setShowModal(true);
                  }
                }}
              />
            )}

            <div className="game-controls">
              <button className="highscores-button" onClick={toggleHighscores}>
                Ver Puntuaciones
              </button>
              
              {gameOver && (
                <button className="new-game-button" onClick={restartCurrentGame}>
                  Volver a jugar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Modal de victoria */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              <h2>¡Felicidades!</h2>
              
              {gameType === GameType.COUNTRY_DISTANCE ? (
                <>
                  <p>Has encontrado el país correcto.</p>
                  <p>Tu puntuación: {attempts} intentos (distancia total: {totalDistance.toFixed(0)} km)</p>
                </>
              ) : gameType === GameType.ALL_COUNTRIES ? (
                <>
                  <p>¡Juego terminado!</p>
                  <p>Países adivinados: {guessedCount} / {guessedCount + missingCount}</p>
                  {missingCount > 0 && <p>Países faltantes: {missingCount}</p>}
                  <p>Tiempo: {totalDistance} segundos</p>
                  {winningCountry && (
                    <p>Último país adivinado: {winningCountry.name}</p>
                  )}
                </>
              ) : (
                <>
                  <p>Has completado las 10 rondas del juego de banderas.</p>
                  <p>Tu puntuación: {attempts} intentos totales en {gameTime} segundos {totalHints > 0 ? `(${totalHints} pistas usadas)` : '(sin pistas)'}</p>
                  {winningCountry && (
                    <p>País más difícil: {winningCountry.name} ({winningCountry.attempts} intentos)</p>
                  )}
                </>
              )}
              
              <div className="player-name-input">
                <label htmlFor="playerName">Tu nombre:</label>
                <input 
                  type="text" 
                  id="playerName" 
                  value={playerName} 
                  onChange={handlePlayerNameChange} 
                  placeholder="Introduce tu nombre"
                />
              </div>
              
              <div className="modal-buttons">
                <button 
                  className="modal-button" 
                  onClick={() => handleSaveHighscore(playerName, totalDistance, guessedCount, totalHints, winningCountry)}
                  disabled={!playerName.trim() || scoreSubmitted}
                >
                  Guardar puntuación
                </button>
                <button 
                  className="modal-button" 
                  onClick={restartCurrentGame}
                >
                  Jugar de nuevo
                </button>
                <button className="modal-button" onClick={goToHomePage}>
                  Volver al menú
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de highscores */}
        {showHighscores && (
          <div className="highscores-modal">
            <div className="highscores-modal-content">
              <button className="highscores-modal-close" onClick={toggleHighscores}>×</button>
              <Highscores 
                gameType={gameType || GameType.COUNTRY_DISTANCE}
                attempts={attempts}
                totalDistance={totalDistance}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 