import { useState, useEffect } from 'react'
import './App.css'
import GameMap from './components/GameMap'
import { Country, getRandomCountry } from './data/countries'

interface Guess {
  country: Country;
  distance: number;
}

function App() {
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (gameStarted && !targetCountry) {
      setTargetCountry(getRandomCountry());
    }
  }, [gameStarted, targetCountry]);

  const addGuess = (guess: Guess) => {
    setGuesses(prev => [...prev, guess]);
    
    // Verificar si el usuario ha adivinado correctamente
    if (guess.distance === 0) {
      setGameOver(true);
    }
  };

  const startNewGame = () => {
    setTargetCountry(getRandomCountry());
    setGuesses([]);
    setGameOver(false);
    setGameStarted(true);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>MarcoPolo - Adivina el País</h1>
        {!gameStarted ? (
          <div className="start-screen">
            <h2>¡Bienvenido a MarcoPolo!</h2>
            <p>Un juego donde debes adivinar un país aleatorio.</p>
            <p>Escribe nombres de países y te diré qué tan cerca estás.</p>
            <button className="start-button" onClick={startNewGame}>
              Comenzar Juego
            </button>
          </div>
        ) : (
          <>
            {targetCountry && (
              <div className="game-container">
                <div className="game-info">
                  <p>
                    {gameOver 
                      ? `¡Felicidades! Has encontrado el país: ${targetCountry.name}` 
                      : 'Adivina el país escribiendo nombres de países en el campo de texto.'}
                  </p>
                  {gameOver && (
                    <button className="new-game-button" onClick={startNewGame}>
                      Jugar de nuevo
                    </button>
                  )}
                </div>
                
                <GameMap 
                  targetCountry={targetCountry} 
                  guesses={guesses} 
                  addGuess={addGuess} 
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