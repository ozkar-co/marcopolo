import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const API_KEY = 'yWESvVpyyDDPaj4EKdrblNjehaUHy9ADKoVEt4hCR43B0Cf2paleH0Qcog96QO1d';
const API_URL = 'https://forja-api.onrender.com/marcopolo/highscores';

async function migrateHighscores() {
  try {
    // Get all highscores from Firebase
    const highscoresCollection = collection(db, 'highscores');
    const querySnapshot = await getDocs(highscoresCollection);
    
    console.log(`Found ${querySnapshot.size} highscores to migrate`);
    
    // Process each highscore
    for (const doc of querySnapshot.docs) {
      const data = doc.data();
      
      // Transform the data according to the new structure
      const newHighscore = {
        game: data.gameType === 'COUNTRY' ? 'country_distance' : 'flag',
        player: data.playerName,
        score: data.gameType === 'COUNTRY' ? (data.totalDistance || 0) : data.score,
        attempts: data.attempts,
        hints: data.totalHints || 0,
      };

      // Add winning country data if it exists
      if (data.winningCountry) {
        newHighscore.win_country_name = data.winningCountry.name;
        newHighscore.win_country_code = data.winningCountry.code;
      }

      // Send to new API
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'X-API-Key': API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHighscore),
      });

      if (!response.ok) {
        console.error(`Failed to migrate highscore for player ${data.playerName}:`, await response.text());
        continue;
      }

      console.log(`Successfully migrated highscore for player ${data.playerName}`);
    }

    console.log('Migration completed!');
  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Run the migration
migrateHighscores(); 