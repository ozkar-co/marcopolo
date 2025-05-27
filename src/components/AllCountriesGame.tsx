import { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import { Country, countries } from '../data/countries';

const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

const getFlagUrl = (countryCode: string, height: number = 16): string => {
  return height === 16
    ? `https://flagcdn.com/16x12/${countryCode.toLowerCase()}.png`
    : `https://flagcdn.com/h${height}/${countryCode.toLowerCase()}.png`;
};

interface AllCountriesGameProps {
  onGameOver: (score: number, attempts: number, winningCountry: Country, guessedCountries: Country[], time: number) => void;
  gameOver: boolean;
}

const AllCountriesGame = ({ onGameOver, gameOver }: AllCountriesGameProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [guessedCountries, setGuessedCountries] = useState<Country[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timer, setTimer] = useState(0);
  const [hint, setHint] = useState<string>('');
  const [showHintModal, setShowHintModal] = useState(false);
  const [hintCountry, setHintCountry] = useState<Country | null>(null);
  const [lastGuessed, setLastGuessed] = useState<Country | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [totalHints, setTotalHints] = useState(0);
  const globeRef = useRef<any>();
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const [globeWidth, setGlobeWidth] = useState(400);
  const [globeHeight, setGlobeHeight] = useState(400);

  useEffect(() => {
    if (!gameOver && !gameEnded) {
      const now = Date.now();
      setStartTime(now);
      setTimer(0);
      const interval = setInterval(() => {
        setTimer(Date.now() - now);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameOver, gameEnded]);

  useEffect(() => {
    if (inputValue.length > 1) {
      const normalizedInput = normalizeText(inputValue);
      const guessedNames = guessedCountries.map(g => normalizeText(g.name));
      const filtered = countries.filter(
        c => normalizeText(c.name).includes(normalizedInput) && !guessedNames.includes(normalizeText(c.name))
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, guessedCountries]);

  // Responsive globe
  useEffect(() => {
    const updateGlobeSize = () => {
      if (globeContainerRef.current) {
        const containerWidth = globeContainerRef.current.clientWidth;
        const size = Math.min(containerWidth, window.innerHeight * 0.5);
        setGlobeWidth(size);
        setGlobeHeight(size);
      }
    };
    updateGlobeSize();
    window.addEventListener('resize', updateGlobeSize);
    return () => window.removeEventListener('resize', updateGlobeSize);
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      // Desactivar animaciones y autoRotate
      globeRef.current.controls().autoRotate = false;
      globeRef.current.controls().enableZoom = true;
      globeRef.current.controls().enablePan = true;
      globeRef.current.controls().enableRotate = true;
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setHint('');
  };

  const handleCountrySelect = (country: Country) => {
    if (gameEnded) return;
    const alreadyGuessed = guessedCountries.some(
      g => normalizeText(g.name) === normalizeText(country.name)
    );
    if (!alreadyGuessed) {
      setGuessedCountries(prev => [...prev, country]);
      setLastGuessed(country);
      setInputValue('');
      setSuggestions([]);
      setHint('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleCountrySelect(suggestions[0]);
    }
  };

  const handleHint = () => {
    // Obtener la lista de países que faltan por adivinar
    const missingCountries = countries.filter(country => 
      !guessedCountries.some(guessed => guessed.name === country.name)
    );

    if (missingCountries.length > 0) {
      // Seleccionar un país aleatorio de los que faltan
      const randomIndex = Math.floor(Math.random() * missingCountries.length);
      const selectedCountry = missingCountries[randomIndex];
      
      // Crear el texto de la pista con la primera letra y asteriscos
      const hintText = selectedCountry.name.charAt(0) + '*'.repeat(selectedCountry.name.length - 1);
      
      setHintCountry(selectedCountry);
      setHint(hintText);
      setShowHintModal(true);
      setTotalHints(prev => prev + 1);
    }
  };

  const handleGiveUp = () => {
    setGameEnded(true);
    setShowMissing(true);
    const timeTaken = Math.floor((Date.now() - (startTime || Date.now())) / 1000);
    const last = lastGuessed || guessedCountries[guessedCountries.length - 1] || countries[0];
    onGameOver(timeTaken, countries.length - guessedCountries.length, last, guessedCountries, timeTaken);
    setHint('');
    setShowHintModal(false);
    setHintCountry(null);
  };

  const handleNewGame = () => {
    setGuessedCountries([]);
    setShowMissing(false);
    setHint('');
    setShowHintModal(false);
    setHintCountry(null);
    setTotalHints(0);
    setStartTime(Date.now());
  };

  // Marker data: all countries, guessed in green, others in gray
  const markerData = countries.map((country) => {
    const guessedIndex = guessedCountries.findIndex(
      g => normalizeText(g.name) === normalizeText(country.name)
    );
    return {
      lat: country.latitude,
      lng: country.longitude,
      color: guessedIndex !== -1 ? 'green' : 'red',
      name: guessedIndex !== -1 ? country.name : '???',
      guessNumber: guessedIndex !== -1 ? guessedIndex + 1 : undefined
    };
  });

  // Calcular el tiempo correctamente al finalizar
  const getTimeTaken = () => {
    if (startTime) {
      return Math.floor((Date.now() - startTime) / 1000);
    }
    return 0;
  };

  useEffect(() => {
    if (guessedCountries.length === countries.length && !gameEnded) {
      setGameEnded(true);
      const timeTaken = getTimeTaken();
      const last = guessedCountries[guessedCountries.length - 1] || countries[0];
      onGameOver(timeTaken, 0, last, guessedCountries, timeTaken);
    }
  }, [guessedCountries, gameEnded, onGameOver, startTime]);

  return (
    <div className="game-map-container">
      <div className="globe-and-input">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Escribe el nombre del país..."
            className="country-input"
            disabled={gameEnded}
          />
          <div className="top-bar">
            <span className="timer">Tiempo: {Math.floor(timer / 1000)}s</span>
          </div>
        </div>
        <div className="globe-container" ref={globeContainerRef}>
          <Globe
            ref={globeRef}
            globeImageUrl="/earth-sepia-division.jpg"
            backgroundColor="#00000000"
            pointsData={markerData}
            pointColor="color"
            pointAltitude={0.1}
            pointRadius={0.5}
            pointLabel={(d: any) => d.guessNumber ? `${d.name} (#${d.guessNumber})` : d.name}
            width={globeWidth}
            height={globeHeight}
            atmosphereColor="rgba(139, 69, 19, 0.2)"
            showAtmosphere={true}
            pointsTransitionDuration={0}
          />
        </div>
      </div>
      <div className="guesses-container">
        <h3>Países adivinados <span className="progress-indicator">({guessedCountries.length}/{countries.length})</span></h3>
        <ul className="guesses-list">
          {guessedCountries.map((country, idx) => (
            <li key={country.name} className="guess-item">
              <div className="guess-line">
                <div className="guess-country-info">
                  <img
                    src={getFlagUrl(country.code)}
                    alt={`Bandera de ${country.name}`}
                    className="country-flag"
                    onError={e => {
                      (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                    }}
                  />
                  <span className="country-name">{country.name}</span>
                </div>
                <span className="guess-number">#{idx + 1}</span>
              </div>
            </li>
          ))}
        </ul>
        
        <div className="game-controls">
          <button className="hint-button" onClick={handleHint} disabled={!!hint || gameEnded}>
            Pista
          </button>
          <button className="new-game-button" onClick={handleGiveUp} disabled={gameEnded}>
            Rendirse
          </button>
        </div>
        
        {showMissing && (
          <div className="missing-countries">
            <h3>Países faltantes <span className="progress-indicator">({countries.length - guessedCountries.length}/{countries.length})</span></h3>
            <ul className="guesses-list missing-list">
              {countries.filter(c => !guessedCountries.some(g => normalizeText(g.name) === normalizeText(c.name))).map(c => (
                <li key={c.name} className="guess-item">
                  <div className="guess-line">
                    <div className="guess-country-info">
                      <img
                        src={getFlagUrl(c.code)}
                        alt={`Bandera de ${c.name}`}
                        className="country-flag"
                        onError={e => {
                          (e.target as HTMLImageElement).src = 'https://flagcdn.com/16x12/xx.png';
                        }}
                      />
                      <span className="country-name">{c.name}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal de pista */}
      {showHintModal && hintCountry && (
        <div className="modal-overlay" onClick={() => setShowHintModal(false)}>
          <div className="modal-content hint-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowHintModal(false)}>×</button>
            <h2>Pista</h2>
            <div className="hint-content">
              <div className="hint-flag">
                <img src={getFlagUrl(hintCountry.code, 120)} alt="Bandera" className="country-flag-large" />
              </div>
              <div className="hint-info">
                <div className="hint-text">{hint}</div>
                <div className="hint-detail">Capital: {hintCountry.capital}</div>
                <div className="hint-detail">Continente: {hintCountry.continent}</div>
              </div>
            </div>
            <button className="modal-button" onClick={() => setShowHintModal(false)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllCountriesGame; 