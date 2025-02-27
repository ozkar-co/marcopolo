export interface Country {
  name: string;
  capital: string;
  latitude: number;
  longitude: number;
}

export const countries: Country[] = [
  { name: "España", capital: "Madrid", latitude: 40.4168, longitude: -3.7038 },
  { name: "México", capital: "Ciudad de México", latitude: 19.4326, longitude: -99.1332 },
  { name: "Argentina", capital: "Buenos Aires", latitude: -34.6037, longitude: -58.3816 },
  { name: "Colombia", capital: "Bogotá", latitude: 4.7110, longitude: -74.0721 },
  { name: "Perú", capital: "Lima", latitude: -12.0464, longitude: -77.0428 },
  { name: "Chile", capital: "Santiago", latitude: -33.4489, longitude: -70.6693 },
  { name: "Ecuador", capital: "Quito", latitude: -0.1807, longitude: -78.4678 },
  { name: "Bolivia", capital: "La Paz", latitude: -16.4897, longitude: -68.1193 },
  { name: "Paraguay", capital: "Asunción", latitude: -25.2637, longitude: -57.5759 },
  { name: "Uruguay", capital: "Montevideo", latitude: -34.9011, longitude: -56.1645 },
  { name: "Venezuela", capital: "Caracas", latitude: 10.4806, longitude: -66.9036 },
  { name: "Cuba", capital: "La Habana", latitude: 23.1136, longitude: -82.3666 },
  { name: "República Dominicana", capital: "Santo Domingo", latitude: 18.4861, longitude: -69.9312 },
  { name: "Guatemala", capital: "Ciudad de Guatemala", latitude: 14.6349, longitude: -90.5069 },
  { name: "Honduras", capital: "Tegucigalpa", latitude: 14.0723, longitude: -87.1921 },
  { name: "El Salvador", capital: "San Salvador", latitude: 13.6929, longitude: -89.2182 },
  { name: "Nicaragua", capital: "Managua", latitude: 12.1364, longitude: -86.2514 },
  { name: "Costa Rica", capital: "San José", latitude: 9.9281, longitude: -84.0907 },
  { name: "Panamá", capital: "Ciudad de Panamá", latitude: 8.9936, longitude: -79.5197 },
  { name: "Francia", capital: "París", latitude: 48.8566, longitude: 2.3522 },
  { name: "Italia", capital: "Roma", latitude: 41.9028, longitude: 12.4964 },
  { name: "Alemania", capital: "Berlín", latitude: 52.5200, longitude: 13.4050 },
  { name: "Reino Unido", capital: "Londres", latitude: 51.5074, longitude: -0.1278 },
  { name: "Portugal", capital: "Lisboa", latitude: 38.7223, longitude: -9.1393 },
  { name: "Grecia", capital: "Atenas", latitude: 37.9838, longitude: 23.7275 },
  { name: "Rusia", capital: "Moscú", latitude: 55.7558, longitude: 37.6173 },
  { name: "China", capital: "Pekín", latitude: 39.9042, longitude: 116.4074 },
  { name: "Japón", capital: "Tokio", latitude: 35.6762, longitude: 139.6503 },
  { name: "India", capital: "Nueva Delhi", latitude: 28.6139, longitude: 77.2090 },
  { name: "Australia", capital: "Canberra", latitude: -35.2809, longitude: 149.1300 },
  { name: "Brasil", capital: "Brasilia", latitude: -15.7801, longitude: -47.9292 },
  { name: "Canadá", capital: "Ottawa", latitude: 45.4215, longitude: -75.6972 },
  { name: "Estados Unidos", capital: "Washington D.C.", latitude: 38.9072, longitude: -77.0369 },
  { name: "Sudáfrica", capital: "Pretoria", latitude: -25.7461, longitude: 28.1881 },
  { name: "Egipto", capital: "El Cairo", latitude: 30.0444, longitude: 31.2357 },
  { name: "Marruecos", capital: "Rabat", latitude: 34.0209, longitude: -6.8416 },
  { name: "Nigeria", capital: "Abuya", latitude: 9.0765, longitude: 7.3986 },
  { name: "Kenia", capital: "Nairobi", latitude: -1.2921, longitude: 36.8219 },
  { name: "Etiopía", capital: "Adís Abeba", latitude: 9.0320, longitude: 38.7469 },
  { name: "Suecia", capital: "Estocolmo", latitude: 59.3293, longitude: 18.0686 },
  { name: "Noruega", capital: "Oslo", latitude: 59.9139, longitude: 10.7522 },
  { name: "Finlandia", capital: "Helsinki", latitude: 60.1699, longitude: 24.9384 },
  { name: "Dinamarca", capital: "Copenhague", latitude: 55.6761, longitude: 12.5683 },
  { name: "Bélgica", capital: "Bruselas", latitude: 50.8503, longitude: 4.3517 },
  { name: "Países Bajos", capital: "Ámsterdam", latitude: 52.3676, longitude: 4.9041 },
  { name: "Suiza", capital: "Berna", latitude: 46.9480, longitude: 7.4474 },
  { name: "Austria", capital: "Viena", latitude: 48.2082, longitude: 16.3738 },
  { name: "Polonia", capital: "Varsovia", latitude: 52.2297, longitude: 21.0122 },
  { name: "Ucrania", capital: "Kiev", latitude: 50.4501, longitude: 30.5234 },
  { name: "Turquía", capital: "Ankara", latitude: 39.9334, longitude: 32.8597 }
];

export const getRandomCountry = (): Country => {
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance);
}; 