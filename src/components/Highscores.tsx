import { useState, useEffect } from 'react';
import { getHighscores, Highscore } from '../services/highscores';
import { GameType } from '../types/game';

interface HighscoresProps {
  gameType: GameType;
  attempts?: number;
  totalDistance?: number;
}

const Highscores = ({ gameType, attempts, totalDistance }: HighscoresProps) => {
  const [highscores, setHighscores] = useState<Highscore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighscores = async () => {
      try {
        const data = await getHighscores(gameType);
        // Sort highscores by attempts (ascending) and score (descending)
        const sortedData = [...data].sort((a, b) => {
          if (a.attempts !== b.attempts) {
            return a.attempts - b.attempts;
          }
          return b.score - a.score;
        });
        setHighscores(sortedData);
        setLoading(false);
      } catch (err) {
        setError('Failed to load highscores');
        setLoading(false);
      }
    };

    fetchHighscores();
  }, [gameType]);

  if (loading) return <div>Loading highscores...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="highscores-container">
      <h2>Top Scores</h2>
      <div className="highscores-table-container">
        <table className="highscores-table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Score</th>
              <th>Attempts</th>
              <th>Hints</th>
              {gameType === GameType.COUNTRY_DISTANCE && <th>Distance</th>}
            </tr>
          </thead>
          <tbody>
            {highscores.map((score, index) => (
              <tr key={index}>
                <td>{score.player}</td>
                <td>{score.score}</td>
                <td>{score.attempts}</td>
                <td>{score.hints}</td>
                {gameType === GameType.COUNTRY_DISTANCE && <td>{score.score} km</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Highscores; 