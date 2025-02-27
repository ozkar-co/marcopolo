import { useState, useEffect } from 'react';
import { getTopHighscores, saveHighscore, Highscore, GameType } from '../firebase/highscores';

interface Score {
  attempts: number;
  totalDistance: number;
  usedHint?: boolean;
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
    
    // Para el juego de países: menor número de intentos es mejor, y menor distancia total para desempate
    if (gameType === GameType.COUNTRY) {
      // Invertir la puntuación para que menos intentos sea mejor
      // Usar 1000 como base y restar los intentos * 100
      // Luego restar la distancia total normalizada para desempates
      const baseScore = 1000 - (currentScore.attempts * 100);
      const distanceDeduction = Math.min(99, Math.floor(currentScore.totalDistance / 1000));
      return Math.max(1, baseScore - distanceDeduction);
    } 
    // Para el juego de banderas: menor número de intentos es mejor, y no usar pista es mejor
    else {
      // Invertir la puntuación para que menos intentos sea mejor
      // Usar 1000 como base y restar los intentos * 100
      // Restar 50 puntos adicionales si se usó pista
      const baseScore = 1000 - (currentScore.attempts * 100);
      const hintPenalty = currentScore.usedHint ? 50 : 0;
      return Math.max(1, baseScore - hintPenalty);
    }
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
        usedHint: currentScore.usedHint || false
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
  const formatScore = (score: number, attempts?: number, totalDistance?: number, usedHint?: boolean): string => {
    // Si tenemos los datos directos, usarlos
    if (attempts !== undefined) {
      if (gameType === GameType.COUNTRY && totalDistance !== undefined) {
        return `${attempts} intentos (${totalDistance.toFixed(0)} km)`;
      } else if (gameType === GameType.FLAG) {
        return `${attempts} intentos ${usedHint ? '(con pista)' : '(sin pista)'}`;
      }
    }
    
    // Fallback al cálculo inverso si no tenemos los datos directos
    if (gameType === GameType.COUNTRY) {
      const calculatedAttempts = Math.floor((1000 - score) / 100);
      const distanceDeduction = score % 100;
      return `${calculatedAttempts} intentos (${distanceDeduction} km)`;
    } else {
      const calculatedAttempts = Math.floor((1000 - score) / 100);
      const calculatedUsedHint = (score % 100) < 50;
      return `${calculatedAttempts} intentos ${calculatedUsedHint ? '(con pista)' : '(sin pista)'}`;
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
                `${currentScore.attempts} intentos ${currentScore.usedHint ? '(con pista)' : '(sin pista)'}`}
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
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {highscores.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No hay puntuaciones registradas</td>
                  </tr>
                ) : (
                  highscores.map((score, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{score.playerName}</td>
                      <td>{formatScore(score.score, score.attempts, score.totalDistance, score.usedHint)}</td>
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