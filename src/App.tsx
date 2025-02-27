import { useState, useEffect } from 'react'
import './App.css'
import GameMap from './components/GameMap'
import FlagGame from './components/FlagGame'
import { Country, getRandomCountry } from './data/countries'
import Highscores from './components/Highscores'
import { GameType as FirebaseGameType, saveHighscore, WinningCountry } from './firebase/highscores'

interface Guess {
  country: Country;
  distance: number;
}

// Interfaz para el sistema de puntuación
interface Score {
  attempts: number;
  totalDistance: number;
  usedHint?: boolean;
  totalHints?: number; // Nuevo campo para el total de pistas usadas
  winningCountry?: WinningCountry;
}

enum GameType {
  COUNTRY = 'country',
  FLAG = 'flag'
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
  const [score, setScore] = useState<Score>({ attempts: 0, totalDistance: 0 });
  const [playerName, setPlayerName] = useState('');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  const [resetGlobe, setResetGlobe] = useState(false);
  // Estado para controlar si el juego de banderas ha completado todas las rondas
  const [flagGameCompleted, setFlagGameCompleted] = useState(false);

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
    if (gameStarted && !targetCountry && gameType === GameType.COUNTRY) {
      setTargetCountry(getRandomCountry());
    }
  }, [gameStarted, targetCountry, gameType]);

  useEffect(() => {
    // Mostrar el modal cuando el juego termina
    if (gameOver && (gameType === GameType.COUNTRY || flagGameCompleted)) {
      setShowModal(true);
    }
  }, [gameOver, gameType, flagGameCompleted]);

  const addGuess = (guess: Guess) => {
    setGuesses(prev => [...prev, guess]);
    
    // Actualizar la puntuación con el nuevo intento y distancia
    setScore(prevScore => ({
      ...prevScore,
      attempts: prevScore.attempts + 1,
      totalDistance: prevScore.totalDistance + guess.distance
    }));
    
    // Verificar si el usuario ha adivinado correctamente
    if (guess.distance === 0 && targetCountry) {
      // Guardar el país ganador
      setScore(prevScore => ({
        ...prevScore,
        winningCountry: {
          name: targetCountry.name,
          code: targetCountry.code
        }
      }));
      setGameOver(true);
    }
  };

  const startNewGame = (type: GameType) => {
    if (type === GameType.COUNTRY) {
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
    setScore({ attempts: 0, totalDistance: 0 });
    setPlayerName('');
    setScoreSubmitted(false);
    setFlagGameCompleted(false); // Reiniciar el estado de juego de banderas completado
  };

  const handleCorrectFlagGuess = (attempts: number, usedHint: boolean) => {
    // Esta función ahora solo se llama cuando se completan todas las rondas
    setScore({
      attempts,
      totalDistance: 0,
      usedHint,
      totalHints: usedHint ? 1 : 0
    });
    setGameOver(true);
    setFlagGameCompleted(true); // Marcar que se han completado todas las rondas
  };

  const handleNewFlagGame = () => {
    setGameOver(false);
    setShowModal(false);
    setScore({ attempts: 0, totalDistance: 0 });
    setPlayerName('');
    setScoreSubmitted(false);
    setFlagGameCompleted(false); // Reiniciar el estado de juego de banderas completado
  };

  const goToHomePage = () => {
    setGameStarted(false);
    setGameType(null);
    setCurrentPage(PageType.HOME);
    setShowModal(false);
    setScoreSubmitted(false);
    setFlagGameCompleted(false); // Reiniciar el estado de juego de banderas completado
  };

  const goToAboutPage = () => {
    setCurrentPage(PageType.ABOUT);
  };

  // Función para reiniciar el juego actual
  const restartCurrentGame = () => {
    if (gameType === GameType.COUNTRY) {
      startNewGame(GameType.COUNTRY);
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
  const saveScore = async () => {
    if (playerName.trim() && !scoreSubmitted) {
      try {
        // Ya no calculamos puntos numéricos, usamos directamente el número de intentos
        
        // Guardar la puntuación directamente
        await saveHighscore({
          playerName: playerName.trim(),
          score: score.attempts, // Usamos directamente el número de intentos
          gameType: gameType === GameType.COUNTRY ? FirebaseGameType.COUNTRY : FirebaseGameType.FLAG,
          attempts: score.attempts,
          totalDistance: score.totalDistance || 0,
          usedHint: score.usedHint || false,
          totalHints: score.totalHints || 0,
          winningCountry: score.winningCountry
        });
        
        // Marcar como enviada
        setScoreSubmitted(true);
        
        // Cerrar el modal de victoria y mostrar las puntuaciones
        setShowModal(false);
        setShowHighscores(true);
      } catch (error) {
        console.error('Error al guardar la puntuación:', error);
      }
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
                <button className="start-button" onClick={() => startNewGame(GameType.COUNTRY)}>
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
                <a href="https://ozcodx.github.io" target="_blank" rel="noopener noreferrer"> Oz</a>. 
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
            {gameType === GameType.COUNTRY && targetCountry && (
              <GameMap 
                targetCountry={targetCountry} 
                guesses={guesses} 
                addGuess={addGuess}
                resetGlobe={resetGlobe}
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
              
              {gameType === GameType.COUNTRY ? (
                <>
                  <p>Has encontrado el país correcto.</p>
                  <p>Tu puntuación: {score.attempts} intentos (distancia total: {score.totalDistance.toFixed(0)} km)</p>
                </>
              ) : (
                <>
                  <p>Has completado las 10 rondas del juego de banderas.</p>
                  <p>Tu puntuación: {score.attempts} intentos totales {score.totalHints && score.totalHints > 0 ? `(${score.totalHints} pistas usadas)` : '(sin pistas)'}</p>
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
                  onClick={saveScore}
                  disabled={!playerName.trim()}
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
                gameType={gameType === GameType.COUNTRY ? FirebaseGameType.COUNTRY : FirebaseGameType.FLAG}
                currentScore={gameOver ? score : undefined}
                isGameOver={gameOver}
                onClose={toggleHighscores}
                playerName={playerName}
                scoreSubmitted={scoreSubmitted}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App 