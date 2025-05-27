import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameMap from './GameMap';
import FlagGame from './FlagGame';
import AllCountriesGame from './AllCountriesGame';
import Highscores from './Highscores';
import { Country, getRandomCountry } from '../data/countries';
import { GameType } from '../types/game';
import { submitHighscore, Highscore } from '../services/highscores';

interface Guess {
  country: Country;
  distance: number;
}

interface WinningCountry {
  name: string;
  code: string;
  attempts?: number;
}

const Game: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  
  const [targetCountry, setTargetCountry] = useState<Country | null>(null);
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameType, setGameType] = useState<GameType | null>(null);
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
  const [flagGameCompleted, setFlagGameCompleted] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const [guessedCount, setGuessedCount] = useState(0);
  const [missingCount, setMissingCount] = useState(0);

  // Initialize game type based on URL parameter
  useEffect(() => {
    if (gameId) {
      const validGameTypes = Object.values(GameType);
      if (validGameTypes.includes(gameId as GameType)) {
        setGameType(gameId as GameType);
        setGameStarted(true);
      } else {
        // Invalid game type, redirect to home
        navigate('/');
      }
    }
  }, [gameId, navigate]);

  useEffect(() => {
    if (gameStarted && !targetCountry && gameType === GameType.COUNTRY_DISTANCE) {
      setTargetCountry(getRandomCountry());
    }
  }, [gameStarted, targetCountry, gameType]);

  useEffect(() => {
    if (gameOver && (gameType === GameType.COUNTRY_DISTANCE || flagGameCompleted)) {
      setShowModal(true);
    }
  }, [gameOver, gameType, flagGameCompleted]);

  const addGuess = (guess: Guess) => {
    setGuesses(prev => [...prev, guess]);
    setAttempts(prev => prev + 1);
    setTotalDistance(prev => prev + guess.distance);
    
    if (guess.distance === 0 && targetCountry) {
      setWinningCountry({
        name: targetCountry.name,
        code: targetCountry.code
      });
      setGameOver(true);
    }
  };

  const startNewGame = () => {
    if (gameType === GameType.COUNTRY_DISTANCE) {
      setTargetCountry(getRandomCountry());
      setGuesses([]);
      setResetGlobe(true);
      setTimeout(() => setResetGlobe(false), 100);
    }
    setGameOver(false);
    setGameStarted(true);
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
    navigate('/');
  };

  const restartCurrentGame = () => {
    if (gameType === GameType.COUNTRY_DISTANCE) {
      startNewGame();
    } else {
      handleNewFlagGame();
    }
    setShowModal(false);
    setScoreSubmitted(false);
  };

  const toggleHighscores = () => {
    setShowHighscores(!showHighscores);
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlayerName(e.target.value);
  };

  const handleSaveHighscore = async (playerName: string, score: number, attempts: number, hints: number, winningCountry?: WinningCountry) => {
    try {
      let highscore: Highscore;
      if (gameType === GameType.ALL_COUNTRIES) {
        highscore = {
          game: 'all_countries',
          player: playerName,
          score: totalDistance,
          attempts: missingCount,
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
      setShowModal(false);
    } catch (error) {
      console.error('Error saving highscore:', error);
    }
  };

  if (!gameType) {
    return <div>Loading...</div>;
  }

  return (
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
            if (!gameOver) {
              setGameOver(true);
              setGuessedCount(guessedCountries.length);
              setMissingCount(attempts);
              setTotalDistance(score);
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
                onClick={() => handleSaveHighscore(
                  playerName, 
                  totalDistance, 
                  gameType === GameType.ALL_COUNTRIES ? guessedCount : attempts, 
                  totalHints, 
                  winningCountry
                )}
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
    </div>
  );
};

export default Game; 