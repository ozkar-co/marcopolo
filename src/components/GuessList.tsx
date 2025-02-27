import React from 'react';
import { Country } from '../data/countries';

interface Guess {
  country: Country;
  distance: number;
}

interface GuessListProps {
  guesses: Guess[];
  targetCountry: Country;
}

const GuessList: React.FC<GuessListProps> = ({ guesses, targetCountry }) => {
  // Ordenar los intentos por distancia (más cercanos primero)
  const sortedGuesses = [...guesses].sort((a, b) => a.distance - b.distance);

  const getDistanceText = (distance: number) => {
    if (distance === 0) return '¡Correcto!';
    if (distance < 100) return '¡Muy caliente!';
    if (distance < 500) return 'Caliente';
    if (distance < 1000) return 'Templado';
    if (distance < 2000) return 'Frío';
    return 'Muy frío';
  };

  const getDistanceColor = (distance: number) => {
    if (distance === 0) return '#4CAF50';
    if (distance < 100) return '#FF5722';
    if (distance < 500) return '#FF9800';
    if (distance < 1000) return '#FFC107';
    if (distance < 2000) return '#2196F3';
    return '#3F51B5';
  };

  return (
    <div className="guess-list-container">
      <h2>Tus intentos</h2>
      {guesses.length === 0 ? (
        <p>Aún no has hecho ningún intento. ¡Comienza a adivinar!</p>
      ) : (
        <table className="guess-table">
          <thead>
            <tr>
              <th>Intento</th>
              <th>País</th>
              <th>Distancia (km)</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {sortedGuesses.map((guess, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{guess.country.name}</td>
                <td>{guess.distance}</td>
                <td style={{ color: getDistanceColor(guess.distance) }}>
                  {getDistanceText(guess.distance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      
      {guesses.some(guess => guess.distance === 0) && (
        <div className="winner-message">
          <h3>¡Felicidades! Has encontrado el país correcto: {targetCountry.name}</h3>
          <p>Lo has logrado en {guesses.length} intentos.</p>
        </div>
      )}
    </div>
  );
};

export default GuessList; 