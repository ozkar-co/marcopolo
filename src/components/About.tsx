import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about-screen">
      <h2>Nuestra Historia</h2>
      <div className="about-content">
        <p>
          MarcoPolo nació de la pasión por los viajes, la geografía y los retos mentales. 
          Inspirados por el gran explorador Marco Polo, quien recorrió el mundo descubriendo 
          nuevas culturas y lugares, creamos estos juegos para compartir nuestra fascinación 
          por el mundo que nos rodea.
        </p>
        <p>
          El nombre "Marco Polo" fue elegido como homenaje a uno de los más grandes exploradores 
          de la historia, cuyo espíritu aventurero y curiosidad insaciable nos inspira cada día.
        </p>
        <p>
          Este proyecto fue inspirado por <strong>Alejandro Sánchez</strong> y construido con pasión por 
          <a href="https://ozkar.co" target="_blank" rel="noopener noreferrer"> Oz</a>. 
          Somos dos primos que compartimos el amor por los viajes, los puzzles y los retos geográficos.
        </p>
        <p>
          Esperamos que disfrutes de estos juegos tanto como nosotros disfrutamos creándolos. 
          ¡Que comience la aventura!
        </p>
      </div>
    </div>
  );
};

export default About; 