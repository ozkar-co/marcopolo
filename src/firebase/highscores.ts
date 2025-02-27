import { collection, addDoc, getDocs, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from './config';

// Tipos de juego
export enum GameType {
  COUNTRY = 'country',
  FLAG = 'flag'
}

// Interfaz para el país ganador (versión simplificada de Country)
export interface WinningCountry {
  name: string;
  code: string;
}

// Interfaz para los highscores
export interface Highscore {
  playerName: string;
  score: number;
  gameType: GameType;
  date: Date;
  attempts: number;
  totalDistance?: number;
  usedHint?: boolean;
  winningCountry?: WinningCountry; // País con el que se ganó
}

// Colección de highscores
const highscoresCollection = collection(db, 'highscores');

// Función para guardar un nuevo highscore
export const saveHighscore = async (highscore: Omit<Highscore, 'date'>): Promise<void> => {
  try {
    // Asegurarse de que todos los campos necesarios estén presentes
    const highscoreToSave = {
      ...highscore,
      date: new Date(),
      // Asegurarse de que estos campos existan
      attempts: highscore.attempts || 0,
      totalDistance: highscore.totalDistance || 0,
      usedHint: highscore.usedHint || false,
      // El país ganador es opcional
      winningCountry: highscore.winningCountry || null
    };
    
    console.log('Guardando highscore:', highscoreToSave);
    await addDoc(highscoresCollection, highscoreToSave);
    console.log('Highscore guardado correctamente');
  } catch (error) {
    console.error('Error al guardar el highscore:', error);
    throw error;
  }
};

// Función para obtener los mejores highscores por tipo de juego
export const getTopHighscores = async (gameType: GameType, limit_count: number = 10): Promise<Highscore[]> => {
  try {
    // Crear la consulta base con el filtro por tipo de juego
    let q = query(
      highscoresCollection,
      where("gameType", "==", gameType),
      orderBy('attempts', 'asc'), // Ordenar por intentos ascendente (menos es mejor)
      limit(limit_count)
    );
    
    const querySnapshot = await getDocs(q);
    const highscores: Highscore[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      highscores.push({
        playerName: data.playerName,
        score: data.score,
        gameType: data.gameType,
        date: data.date.toDate(),
        attempts: data.attempts || 0,
        totalDistance: data.totalDistance || 0,
        usedHint: data.usedHint || false,
        winningCountry: data.winningCountry || undefined
      });
    });
    
    // Para el juego de países, ordenamos adicionalmente por distancia total para desempatar
    if (gameType === GameType.COUNTRY) {
      highscores.sort((a, b) => {
        // Primero ordenar por intentos
        if (a.attempts !== b.attempts) {
          return a.attempts - b.attempts;
        }
        // Si hay empate en intentos, ordenar por distancia total
        return (a.totalDistance || 0) - (b.totalDistance || 0);
      });
    }
    
    return highscores;
  } catch (error) {
    console.error('Error al obtener los highscores:', error);
    throw error;
  }
}; 