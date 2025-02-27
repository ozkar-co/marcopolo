import { useState, useEffect } from 'react';
import { getTopHighscores, saveHighscore, Highscore, GameType, WinningCountry } from '../firebase/highscores';
import { getFlagUrl } from './GameMap';

interface Score {
  attempts: number;
  totalDistance: number;
  usedHint?: boolean;
  totalHints?: number;
  winningCountry?: WinningCountry;
}

interface HighscoresProps {
  gameType: GameType;
  currentScore?: Score;
  isGameOver: boolean;
  onClose: () => void;
  playerName?: string;
  scoreSubmitted?: boolean;
}

const Highscores: React.FC<HighscoresProps> = ({ 
  gameType, 
  currentScore, 
  isGameOver, 
  onClose, 
  playerName: initialPlayerName,
  scoreSubmitted: initialScoreSubmitted = false
}) => {
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [playerName, setPlayerName] = useState(initialPlayerName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(initialScoreSubmitted);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Actualizar isSubmitted cuando cambia initialScoreSubmitted
  useEffect(() => {
    setIsSubmitted(initialScoreSubmitted);
  }, [initialScoreSubmitted]);

  // Cargar los highscores al montar el componente
  useEffect(() => {
    const loadHighscores = async () => {
      try {
        setLoading(true);
        const scores = await getTopHighscores(gameType);
        setHighscores(scores);
      } catch (err) {
        setError('Error al cargar los highscores');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadHighscores();
  }, [gameType]);

  // Actualizar el nombre del jugador cuando cambia en las props
  useEffect(() => {
    if (initialPlayerName) {
      setPlayerName(initialPlayerName);
    }
  }, [initialPlayerName]);

  // Convertir la puntuación al formato numérico para Firestore
  const getNumericScore = (): number => {
    if (!currentScore) return 0;
    
    // Para el juego de banderas, el score es el número de intentos
    // y se usa el número de pistas como desempate (menos pistas es mejor)
    if (gameType === GameType.FLAG) {
      // Multiplicamos por 1000 para dar prioridad a los intentos
      // y sumamos el número de pistas para desempatar
      const hintsUsed = currentScore.totalHints || 0;
      return currentScore.attempts * 1000 + hintsUsed;
    }
    
    // Para el juego de países, mantenemos la lógica actual
    return currentScore.attempts;
  };

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Por favor, introduce tu nombre');
      return;
    }

    if (!currentScore) {
      setError('No hay puntuación para guardar');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Crear el objeto de puntuación con todos los campos necesarios
      const scoreToSave = {
        playerName: playerName.trim(),
        score: getNumericScore(),
        gameType,
        attempts: currentScore.attempts,
        totalDistance: currentScore.totalDistance || 0,
        usedHint: currentScore.usedHint || false,
        totalHints: currentScore.totalHints || 0,
        winningCountry: currentScore.winningCountry
      };
      
      console.log('Guardando puntuación:', scoreToSave);
      await saveHighscore(scoreToSave);
      
      // Recargar los highscores
      const scores = await getTopHighscores(gameType);
      setHighscores(scores);
      
      setIsSubmitted(true);
      setError('');
    } catch (err) {
      setError('Error al guardar la puntuación');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatear la fecha
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  // Formatear la puntuación para mostrarla
  const formatScore = (
    score: number, 
    attempts: number, 
    totalDistance?: number, 
    usedHint?: boolean,
    totalHints?: number
  ): string => {
    if (gameType === GameType.COUNTRY) {
      return `${attempts} intentos (${totalDistance?.toFixed(0) || 0} km)`;
    } else {
      // Para el juego de banderas, mostrar el número de intentos y pistas
      return `${attempts} intentos${totalHints && totalHints > 0 ? ` (${totalHints} pistas)` : ' (sin pistas)'}`;
    }
  };

  return (
    <div className="highscores-container">
      <h2>Mejores Puntuaciones - {gameType === GameType.COUNTRY ? 'Adivina el País' : 'Adivina la Bandera'}</h2>
      
      {loading ? (
        <p>Cargando puntuaciones...</p>
      ) : error && !isSubmitted ? (
        <p className="error-message">{error}</p>
      ) : (
        <>
          {isGameOver && currentScore && !isSubmitted && (
            <div className="submit-score">
              <h3>Tu puntuación: {gameType === GameType.COUNTRY ? 
                `${currentScore.attempts} intentos (distancia total: ${currentScore.totalDistance.toFixed(0)} km)` : 
                `${currentScore.attempts} intentos ${currentScore.totalHints && currentScore.totalHints > 0 ? `(${currentScore.totalHints} pistas)` : '(sin pistas)'}`}
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="Tu nombre"
                  disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting || !playerName.trim()}>
                  {isSubmitting ? 'Guardando...' : 'Guardar puntuación'}
                </button>
              </form>
            </div>
          )}

          {isSubmitted && (
            <p className="success-message">¡Puntuación guardada correctamente!</p>
          )}

          <div className="highscores-list">
            <table>
              <thead>
                <tr>
                  <th>Posición</th>
                  <th>Jugador</th>
                  <th>Puntuación</th>
                  {gameType === GameType.COUNTRY && <th>País</th>}
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {highscores.length === 0 ? (
                  <tr>
                    <td colSpan={gameType === GameType.COUNTRY ? 5 : 4}>No hay puntuaciones registradas</td>
                  </tr>
                ) : (
                  highscores.map((score, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{score.playerName}</td>
                      <td>{formatScore(score.score, score.attempts, score.totalDistance, score.usedHint, score.totalHints)}</td>
                      {gameType === GameType.COUNTRY && (
                        <td className="winning-country">
                          {score.winningCountry ? (
                            <div className="country-flag-name">
                              <img 
                                src={getFlagUrl(score.winningCountry.code)} 
                                alt={`Bandera de ${score.winningCountry.name}`}
                                className="country-flag"
                                onError={(e) => {
                                  // Si la imagen falla, usar una imagen de respaldo
                                  (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                                }}
                              />
                              <span>{score.winningCountry.name}</span>
                            </div>
                          ) : (
                            <span>-</span>
                          )}
                        </td>
                      )}
                      <td>{formatDate(score.date)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button className="close-button" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
};

export default Highscores; 