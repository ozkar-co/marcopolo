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

function App() {
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);

  useEffect(() => {
    if (gameStarted && !targetCountry && gameType === GameType.COUNTRY) {
      setTargetCountry(getRandomCountry());
    }
  }, [gameStarted, targetCountry, gameType]);

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
  };

  const handleCorrectFlagGuess = () => {
    setGameOver(true);
  };

  const handleNewFlagGame = () => {
    setGameOver(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MarcoPolo - Juegos Geográficos</h1>
        {!gameStarted ? (
          <div className="start-screen">
            <h2>¡Bienvenido a MarcoPolo!</h2>
            <p>Elige uno de nuestros juegos geográficos:</p>
            
            <div className="game-selection">
              <div className="game-option" onClick={() => startNewGame(GameType.COUNTRY)}>
                <h3>Adivina el País</h3>
                <p>Adivina un país aleatorio basado en su ubicación en el mapa.</p>
                <button className="start-button">
                  Jugar
                </button>
              </div>
              
              <div className="game-option" onClick={() => startNewGame(GameType.FLAG)}>
                <h3>Adivina la Bandera</h3>
                <p>Identifica a qué país pertenece la bandera mostrada.</p>
                <button className="start-button">
                  Jugar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {gameType === GameType.COUNTRY && targetCountry && (
              <div className="game-container">
                <div className="game-info">
                  <p>
                    {gameOver 
                      ? `¡Felicidades! Has encontrado el país: ${targetCountry.name}` 
                      : 'Adivina el país escribiendo nombres de países en el campo de texto.'}
                  </p>
                  {gameOver && (
                    <button className="new-game-button" onClick={() => startNewGame(GameType.COUNTRY)}>
                      Jugar de nuevo
                    </button>
                  )}
                  <button className="back-button" onClick={() => {
                    setGameStarted(false);
                    setGameType(null);
                  }}>
                    Volver al menú
                  </button>
                </div>
                
                <GameMap 
                  targetCountry={targetCountry} 
                  guesses={guesses} 
                  addGuess={addGuess} 
                />
              </div>
            )}

            {gameType === GameType.FLAG && (
              <div className="game-container">
                <div className="game-info">
                  <p>
                    {gameOver 
                      ? '¡Felicidades! Has adivinado correctamente la bandera.' 
                      : 'Adivina a qué país pertenece esta bandera.'}
                  </p>
                  <button className="back-button" onClick={() => {
                    setGameStarted(false);
                    setGameType(null);
                  }}>
                    Volver al menú
                  </button>
                </div>
                
                <FlagGame 
                  onCorrectGuess={handleCorrectFlagGuess}
                  onNewGame={handleNewFlagGame}
                  gameOver={gameOver}
                />
              </div>
            )}
          </>
        )}
      </header>
    </div>
  )
}

export default App 