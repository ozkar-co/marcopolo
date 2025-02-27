import { useState, useEffect } from 'react';
import { getTopHighscores, saveHighscore, Highscore, GameType, WinningCountry } from '../firebase/highscores';
import { getFlagUrl } from './GameMap';

interface HighscoresProps {
  gameType: GameType;
  attempts?: number;
  totalDistance?: number;
  usedHint?: boolean;
  totalHints?: number;
  winningCountry?: WinningCountry;
  isGameOver: boolean;
  onClose: () => void;
  playerName?: string;
  scoreSubmitted?: boolean;
}

const Highscores: React.FC<HighscoresProps> = ({ 
  gameType, 
  attempts, 
  totalDistance, 
  usedHint,
  totalHints,
  winningCountry,
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

  // Manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!playerName.trim()) {
      setError('Por favor, introduce tu nombre');
      return;
    }

    if (!attempts) {
      setError('No hay puntuación para guardar');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Crear el objeto de puntuación con todos los campos necesarios
      const scoreToSave = {
        playerName: playerName.trim(),
        score: attempts, // Usamos directamente el número de intentos como score
        gameType,
        attempts: attempts,
        totalDistance: totalDistance || 0,
        usedHint: usedHint || false,
        totalHints: totalHints || 0,
        winningCountry: winningCountry
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
          {isGameOver && attempts && !isSubmitted && (
            <div className="submit-score">
              <h3>Tu puntuación: {gameType === GameType.COUNTRY ? 
                `${attempts} intentos (distancia total: ${totalDistance?.toFixed(0) || 0} km)` : 
                `${attempts} intentos ${totalHints && totalHints > 0 ? `(${totalHints} pistas)` : '(sin pistas)'}`}
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
                      <td>{formatScore(score.attempts, score.totalDistance, score.usedHint, score.totalHints)}</td>
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