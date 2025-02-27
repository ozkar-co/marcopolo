import { useState, useEffect } from 'react'
import './App.css'
import GameMap from './components/GameMap'
import FlagGame from './components/FlagGame'
import { Country, getRandomCountry } from './data/countries'

interface Guess {
  country: Country;
  distance: number;
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
    if (gameOver) {
      setShowModal(true);
    }
  }, [gameOver]);

  const addGuess = (guess: Guess) => {
    setGuesses(prev => [...prev, guess]);
    
    // Verificar si el usuario ha adivinado correctamente
    if (guess.distance === 0) {
      setGameOver(true);
    }
  };

  const startNewGame = (type: GameType) => {
    if (type === GameType.COUNTRY) {
      setTargetCountry(getRandomCountry());
      setGuesses([]);
    }
    setGameOver(false);
    setGameStarted(true);
    setGameType(type);
    setCurrentPage(PageType.GAME);
    setShowModal(false);
  };

  const handleCorrectFlagGuess = () => {
    setGameOver(true);
  };

  const handleNewFlagGame = () => {
    setGameOver(false);
    setShowModal(false);
  };

  const goToHomePage = () => {
    setGameStarted(false);
    setGameType(null);
    setCurrentPage(PageType.HOME);
    setShowModal(false);
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
              />
            )}

            {gameType === GameType.FLAG && (
              <FlagGame 
                onCorrectGuess={handleCorrectFlagGuess}
                onNewGame={handleNewFlagGame}
                gameOver={gameOver}
                onGameOver={setGameOver}
              />
            )}
          </div>
        )}

        {/* Modal de victoria */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
              <h2>¡Felicidades!</h2>
              <p>Has ganado el juego.</p>
              <div className="modal-buttons">
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
      </main>
    </div>
  )
}

export default App 