import React from 'react';
import { Link } from 'react-router-dom';
import { GameType } from '../types/game';

const Home: React.FC = () => {
  return (
    <div className="start-screen">
      <p>Elige uno de nuestros juegos geográficos:</p>
      
      <div className="game-selection">
        <div className="game-option">
          <h3>Adivina el País</h3>
          <p>Adivina un país aleatorio basado en su ubicación en el mapa.</p>
          <Link to="/country_distance" className="start-button">
            Jugar
          </Link>
        </div>
        
        <div className="game-option">
          <h3>Adivina la Bandera</h3>
          <p>Identifica a qué país pertenece la bandera mostrada.</p>
          <Link to="/flag" className="start-button">
            Jugar
          </Link>
        </div>
        
        <div className="game-option">
          <h3>Todos los Países</h3>
          <p>Escribe todos los países que puedas lo más rápido posible.</p>
          <Link to="/all_countries" className="start-button">
            Jugar
          </Link>
        </div>
      </div>

      <div className="about-section">
        <Link to="/info" className="about-button">
          Saber más
        </Link>
      </div>
    </div>
  );
};

export default Home; 