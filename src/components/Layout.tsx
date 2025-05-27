import React, { useEffect } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isAboutPage = location.pathname === '/info';

  // Efecto para cambiar la clase del body según la página
  useEffect(() => {
    const bodyElement = document.body;
    
    if (isHomePage || isAboutPage) {
      bodyElement.className = 'home-page';
    } else {
      bodyElement.className = 'game-page';
    }
    
    // Limpieza al desmontar
    return () => {
      bodyElement.className = '';
    };
  }, [isHomePage, isAboutPage]);

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="header-content">
          <h1>Marco Polo</h1>
          {!isHomePage ? (
            <Link to="/" className="back-button">
              Volver
            </Link>
          ) : (
            <p className="header-subtitle">
              "Explorando el mundo, descubriendo maravillas y aventuras inimaginables en cada rincón del planeta."
            </p>
          )}
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout; 