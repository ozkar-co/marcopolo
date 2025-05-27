import { GameType } from '../types/game';

const API_URL = import.meta.env.VITE_API_URL || 'https://forja-api.onrender.com/marcopolo';
const API_KEY = import.meta.env.VITE_API_KEY;

export interface Highscore {
  game: 'country_distance' | 'flag' | 'all_countries';
  player: string;
  score: number;
  attempts: number;
  hints: number;
  win_country_name?: string;
  win_country_code?: string;
}

export async function getHighscores(gameType: GameType): Promise<Highscore[]> {
  let game: 'country_distance' | 'flag' | 'all_countries';
  switch (gameType) {
    case GameType.COUNTRY_DISTANCE:
      game = 'country_distance';
      break;
    case GameType.FLAG:
      game = 'flag';
      break;
    case GameType.ALL_COUNTRIES:
      game = 'all_countries';
      break;
    default:
      game = 'country_distance';
  }
  
  const response = await fetch(`${API_URL}/highscores/${game}`, {
    headers: {
      'X-API-Key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch highscores');
  }

  return response.json();
}

export async function submitHighscore(highscore: Highscore): Promise<void> {
  const response = await fetch(`${API_URL}/highscores`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(highscore),
  });

  if (!response.ok) {
    throw new Error('Failed to submit highscore');
  }
} 