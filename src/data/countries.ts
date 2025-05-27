export interface Country {
  name: string;
  capital: string;
  latitude: number;
  longitude: number;
  code: string; // Código de país para las banderas
  continent: string; // Continente al que pertenece el país
}

// Importar los códigos de país
import countryCodes from './codes.json';

// Función para encontrar el código de país basado en el nombre
const findCountryCode = (countryName: string): string => {
  // Normalizar el nombre del país para la comparación
  const normalizedName = countryName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  
  // Buscar el código correspondiente
  for (const [code, name] of Object.entries(countryCodes)) {
    const normalizedCodeName = (name as string)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    
    if (normalizedCodeName === normalizedName) {
      return code;
    }
  }
  
  // Manejar casos especiales
  const specialCases: Record<string, string> = {
    "España": "es",
    "México": "mx",
    "Perú": "pe",
    "Panamá": "pa",
    "República Dominicana": "do",
    "Estados Unidos": "us",
    "Reino Unido": "gb",
    "Países Bajos": "nl",
    "Rusia": "ru",
    "Sudáfrica": "za"
  };
  
  return specialCases[countryName] || "xx"; // "xx" como código por defecto si no se encuentra
};

export const countries: Country[] = [
  { name: "Afganistán", capital: "Kabul", latitude: 33.8179, longitude: 65.9979, code: "af", continent: "Asia" },
  { name: "Albania", capital: "Tirana", latitude: 41.1389, longitude: 20.0708, code: "al", continent: "Europa" },
  { name: "Alemania", capital: "Berlín", latitude: 52.5200, longitude: 13.4050, code: "de", continent: "Europa" },
  { name: "Andorra", capital: "Andorra la Vella", latitude: 42.5000, longitude: 1.5000, code: "ad", continent: "Europa" },
  { name: "Angola", capital: "Luanda", latitude: -12.5000, longitude: 18.5000, code: "ao", continent: "África" },
  { name: "Antigua y Barbuda", capital: "Saint John's", latitude: 17.1167, longitude: -61.8500, code: "ag", continent: "América del Norte" },
  { name: "Arabia Saudita", capital: "Riad", latitude: 25.0000, longitude: 45.0000, code: "sa", continent: "Asia" },
  { name: "Argelia", capital: "Argel", latitude: 28.0000, longitude: 3.0000, code: "dz", continent: "África" },
  { name: "Argentina", capital: "Buenos Aires", latitude: -34.6037, longitude: -58.3816, code: "ar", continent: "América del Sur" },
  { name: "Armenia", capital: "Ereván", latitude: 40.0000, longitude: 45.0000, code: "am", continent: "Asia" },
  { name: "Australia", capital: "Canberra", latitude: -35.2809, longitude: 149.1300, code: "au", continent: "Oceanía" },
  { name: "Austria", capital: "Viena", latitude: 48.2082, longitude: 16.3738, code: "at", continent: "Europa" },
  { name: "Azerbaiyán", capital: "Bakú", latitude: 40.5000, longitude: 47.5000, code: "az", continent: "Asia" },
  { name: "Bahamas", capital: "Nassau", latitude: 24.2500, longitude: -76.0000, code: "bs", continent: "América del Norte" },
  { name: "Bangladesh", capital: "Daca", latitude: 24.0000, longitude: 90.0000, code: "bd", continent: "Asia" },
  { name: "Barbados", capital: "Bridgetown", latitude: 13.1667, longitude: -59.5333, code: "bb", continent: "América del Norte" },
  { name: "Baréin", capital: "Manama", latitude: 26.0000, longitude: 50.5500, code: "bh", continent: "Asia" },
  { name: "Bélgica", capital: "Bruselas", latitude: 50.8503, longitude: 4.3517, code: "be", continent: "Europa" },
  { name: "Belice", capital: "Belmopán", latitude: 17.2500, longitude: -88.7500, code: "bz", continent: "América del Norte" },
  { name: "Benín", capital: "Porto-Novo", latitude: 9.5000, longitude: 2.2500, code: "bj", continent: "África" },
  { name: "Bielorrusia", capital: "Minsk", latitude: 53.0000, longitude: 28.0000, code: "by", continent: "Europa" },
  { name: "Bolivia", capital: "La Paz", latitude: -16.4897, longitude: -68.1193, code: "bo", continent: "América del Sur" },
  { name: "Bosnia y Herzegovina", capital: "Sarajevo", latitude: 44.0000, longitude: 18.0000, code: "ba", continent: "Europa" },
  { name: "Botsuana", capital: "Gaborone", latitude: -22.0000, longitude: 24.0000, code: "bw", continent: "África" },
  { name: "Brasil", capital: "Brasilia", latitude: -15.7801, longitude: -47.9292, code: "br", continent: "América del Sur" },
  { name: "Brunéi", capital: "Bandar Seri Begawan", latitude: 4.5000, longitude: 114.6667, code: "bn", continent: "Asia" },
  { name: "Bulgaria", capital: "Sofía", latitude: 43.0000, longitude: 25.0000, code: "bg", continent: "Europa" },
  { name: "Burkina Faso", capital: "Uagadugú", latitude: 13.0000, longitude: -2.0000, code: "bf", continent: "África" },
  { name: "Burundi", capital: "Buyumbura", latitude: -3.5000, longitude: 30.0000, code: "bi", continent: "África" },
  { name: "Bután", capital: "Timbu", latitude: 27.5000, longitude: 90.5000, code: "bt", continent: "Asia" },
  { name: "Cabo Verde", capital: "Praia", latitude: 16.0000, longitude: -24.0000, code: "cv", continent: "África" },
  { name: "Camboya", capital: "Nom Pen", latitude: 13.0000, longitude: 105.0000, code: "kh", continent: "Asia" },
  { name: "Camerún", capital: "Yaundé", latitude: 6.0000, longitude: 12.0000, code: "cm", continent: "África" },
  { name: "Canadá", capital: "Ottawa", latitude: 45.4215, longitude: -75.6972, code: "ca", continent: "América del Norte" },
  { name: "Chad", capital: "Yamena", latitude: 15.0000, longitude: 19.0000, code: "td", continent: "África" },
  { name: "Chile", capital: "Santiago", latitude: -33.4489, longitude: -70.6693, code: "cl", continent: "América del Sur" },
  { name: "China", capital: "Pekín", latitude: 39.9042, longitude: 116.4074, code: "cn", continent: "Asia" },
  { name: "Chipre", capital: "Nicosia", latitude: 35.0000, longitude: 33.0000, code: "cy", continent: "Asia" },
  { name: "Ciudad del Vaticano", capital: "Ciudad del Vaticano", latitude: 41.9000, longitude: 12.4500, code: "va", continent: "Europa" },
  { name: "Colombia", capital: "Bogotá", latitude: 4.7110, longitude: -74.0721, code: "co", continent: "América del Sur" },
  { name: "Comoras", capital: "Moroni", latitude: -12.1667, longitude: 44.2500, code: "km", continent: "África" },
  { name: "Congo", capital: "Kinshasa", latitude: -4.0000, longitude: 15.0000, code: "cg", continent: "África" },
  { name: "Corea del Norte", capital: "Pyongyang", latitude: 39.0000, longitude: 125.7500, code: "kp", continent: "Asia" },
  { name: "Corea del Sur", capital: "Seúl", latitude: 37.0000, longitude: 127.5000, code: "kr", continent: "Asia" },
  { name: "Costa de Marfil", capital: "Yamusukro", latitude: 8.0000, longitude: -5.0000, code: "ci", continent: "África" },
  { name: "Costa Rica", capital: "San José", latitude: 9.9281, longitude: -84.0907, code: "cr", continent: "América del Norte" },
  { name: "Croacia", capital: "Zagreb", latitude: 45.1667, longitude: 15.5000, code: "hr", continent: "Europa" },
  { name: "Cuba", capital: "La Habana", latitude: 23.1136, longitude: -82.3666, code: "cu", continent: "América del Norte" },
  { name: "Dinamarca", capital: "Copenhague", latitude: 55.6761, longitude: 12.5683, code: "dk", continent: "Europa" },
  { name: "Dominica", capital: "Roseau", latitude: 15.4167, longitude: -61.3333, code: "dm", continent: "América del Norte" },
  { name: "Ecuador", capital: "Quito", latitude: -0.1807, longitude: -78.4678, code: "ec", continent: "América del Sur" },
  { name: "Egipto", capital: "El Cairo", latitude: 30.0444, longitude: 31.2357, code: "eg", continent: "África" },
  { name: "El Salvador", capital: "San Salvador", latitude: 13.6929, longitude: -89.2182, code: "sv", continent: "América del Norte" },
  { name: "Emiratos Árabes Unidos", capital: "Abu Dabi", latitude: 24.0000, longitude: 54.0000, code: "ae", continent: "Asia" },
  { name: "Eritrea", capital: "Asmara", latitude: 15.0000, longitude: 39.0000, code: "er", continent: "África" },
  { name: "Eslovaquia", capital: "Bratislava", latitude: 48.6667, longitude: 19.5000, code: "sk", continent: "Europa" },
  { name: "Eslovenia", capital: "Liubliana", latitude: 46.0000, longitude: 15.0000, code: "si", continent: "Europa" },
  { name: "España", capital: "Madrid", latitude: 40.4168, longitude: -3.7038, code: "es", continent: "Europa" },
  { name: "Estados Unidos", capital: "Washington D.C.", latitude: 38.9072, longitude: -77.0369, code: "us", continent: "América del Norte" },
  { name: "Estonia", capital: "Tallin", latitude: 59.0000, longitude: 26.0000, code: "ee", continent: "Europa" },
  { name: "Eswatini", capital: "Mbabane", latitude: -26.5000, longitude: 31.5000, code: "sz", continent: "África" },
  { name: "Etiopía", capital: "Adís Abeba", latitude: 9.0320, longitude: 38.7469, code: "et", continent: "África" },
  { name: "Filipinas", capital: "Manila", latitude: 13.0000, longitude: 122.0000, code: "ph", continent: "Asia" },
  { name: "Finlandia", capital: "Helsinki", latitude: 60.1699, longitude: 24.9384, code: "fi", continent: "Europa" },
  { name: "Fiyi", capital: "Suva", latitude: -18.0000, longitude: 175.0000, code: "fj", continent: "Oceanía" },
  { name: "Francia", capital: "París", latitude: 48.8566, longitude: 2.3522, code: "fr", continent: "Europa" },
  { name: "Gabón", capital: "Libreville", latitude: -1.0000, longitude: 11.7500, code: "ga", continent: "África" },
  { name: "Gambia", capital: "Banjul", latitude: 13.4667, longitude: -16.5667, code: "gm", continent: "África" },
  { name: "Georgia", capital: "Tiflis", latitude: 42.0000, longitude: 43.5000, code: "ge", continent: "Asia" },
  { name: "Ghana", capital: "Acra", latitude: 8.0000, longitude: -2.0000, code: "gh", continent: "África" },
  { name: "Granada", capital: "Saint George's", latitude: 12.1167, longitude: -61.6667, code: "gd", continent: "América del Norte" },
  { name: "Grecia", capital: "Atenas", latitude: 37.9838, longitude: 23.7275, code: "gr", continent: "Europa" },
  { name: "Guatemala", capital: "Ciudad de Guatemala", latitude: 14.6349, longitude: -90.5069, code: "gt", continent: "América del Norte" },
  { name: "Guinea-Bisáu", capital: "Bisáu", latitude: 12.0000, longitude: -15.0000, code: "gw", continent: "África" },
  { name: "Guinea", capital: "Conakry", latitude: 11.0000, longitude: -10.0000, code: "gn", continent: "África" },
  { name: "Guinea Ecuatorial", capital: "Malabo", latitude: 2.0000, longitude: 10.0000, code: "gq", continent: "África" },
  { name: "Guyana", capital: "Georgetown", latitude: 5.0000, longitude: -59.0000, code: "gy", continent: "América del Sur" },
  { name: "Haití", capital: "Puerto Príncipe", latitude: 19.0000, longitude: -72.4167, code: "ht", continent: "América del Norte" },
  { name: "Honduras", capital: "Tegucigalpa", latitude: 14.0723, longitude: -87.1921, code: "hn", continent: "América del Norte" },
  { name: "Hungría", capital: "Budapest", latitude: 47.0000, longitude: 20.0000, code : "hu", continent: "Europa" },
  { name: "India", capital: "Nueva Delhi", latitude: 28.6139, longitude: 77.2090, code: "in", continent: "Asia" },
  { name: "Indonesia", capital: "Yakarta", latitude: -5.0000, longitude: 120.0000, code: "id", continent: "Asia" },
  { name: "Irán", capital: "Teherán", latitude: 32.0000, longitude: 53.0000, code: "ir", continent: "Asia" },
  { name: "Iraq", capital: "Bagdad", latitude: 33.0000, longitude: 44.0000, code: "iq", continent: "Asia" },
  { name: "Irlanda", capital: "Dublín", latitude: 53.0000, longitude: -8.0000, code: "ie", continent: "Europa" },
  { name: "Islandia", capital: "Reikiavik", latitude: 65.0000, longitude: -18.0000, code: "is", continent: "Europa" },
  { name: "Islas Marshall", capital: "Majuro", latitude: 7.0900, longitude: 171.3800, code: "mh", continent: "Oceanía" },
  { name: "Islas Salomón", capital: "Honiara", latitude: -8.0000, longitude: 159.0000, code: "sb", continent: "Oceanía" },
  { name: "Israel", capital: "Jerusalén", latitude: 31.5000, longitude: 34.7500, code: "il", continent: "Asia" },
  { name: "Italia", capital: "Roma", latitude: 41.9028, longitude: 12.4964, code: "it", continent: "Europa" },
  { name: "Jamaica", capital: "Kingston", latitude: 18.2500, longitude: -77.5000, code: "jm", continent: "América del Norte" },
  { name: "Japón", capital: "Tokio", latitude: 35.6762, longitude: 139.6503, code: "jp", continent: "Asia" },
  { name: "Jordania", capital: "Amán", latitude: 31.0000, longitude: 36.0000, code: "jo", continent: "Asia" },
  { name: "Kazajistán", capital: "Astaná", latitude: 48.0000, longitude: 68.0000, code: "kz", continent: "Asia" },
  { name: "Kenia", capital: "Nairobi", latitude: -1.2921, longitude: 36.8219, code: "ke", continent: "África" },
  { name: "Kirguistán", capital: "Biskek", latitude: 41.0000, longitude: 75.0000, code: "kg", continent: "Asia" },
  { name: "Kiribati", capital: "Tarawa", latitude: 1.3500, longitude: 172.9333, code: "ki", continent: "Oceanía" },
  { name: "Laos", capital: "Vientián", latitude: 18.0000, longitude: 105.0000, code: "la", continent: "Asia" },
  { name: "Lesoto", capital: "Maseru", latitude: -29.5000, longitude: 28.5000, code: "ls", continent: "África" },
  { name: "Letonia", capital: "Riga", latitude: 57.0000, longitude: 25.0000, code: "lv", continent: "Europa" },
  { name: "Líbano", capital: "Beirut", latitude: 33.8333, longitude: 35.8333, code: "lb", continent: "Asia" },
  { name: "Liberia", capital: "Monrovia", latitude: 6.5000, longitude: -9.5000, code: "lr", continent: "África" },
  { name: "Libia", capital: "Trípoli", latitude: 25.0000, longitude: 17.0000, code: "ly", continent: "África" },
  { name: "Liechtenstein", capital: "Vaduz", latitude: 47.1667, longitude: 9.5333, code: "li", continent: "Europa" },
  { name: "Lituania", capital: "Vilna", latitude: 56.0000, longitude: 24.0000, code: "lt", continent: "Europa" },
  { name: "Luxemburgo", capital: "Luxemburgo", latitude: 49.7500, longitude: 6.1667, code: "lu", continent: "Europa" },
  { name: "Macedonia del Norte", capital: "Skopie", latitude: 41.8333, longitude: 22.0000, code: "mk", continent: "Europa" },
  { name: "Madagascar", capital: "Antananarivo", latitude: -20.0000, longitude: 47.0000, code: "mg", continent: "África" },
  { name: "Malasia", capital: "Kuala Lumpur", latitude: 2.5000, longitude: 112.5000, code: "my", continent: "Asia" },
  { name: "Malaui", capital: "Lilongüe", latitude: -13.5000, longitude: 34.0000, code: "mw", continent: "África" },
  { name: "Maldivas", capital: "Malé", latitude: 3.2500, longitude: 73.0000, code: "mv", continent: "Asia" },
  { name: "Malí", capital: "Bamako", latitude: 17.0000, longitude: -4.0000, code: "ml", continent: "África" },
  { name: "Malta", capital: "La Valeta", latitude: 35.8333, longitude: 14.5833, code: "mt", continent: "Europa" },
  { name: "Marruecos", capital: "Rabat", latitude: 34.0209, longitude: -6.8416, code: "ma", continent: "África" },
  { name: "Mauricio", capital: "Port Louis", latitude: -20.2833, longitude: 57.5500, code: "mu", continent: "África" },
  { name: "Mauritania", capital: "Nuakchot", latitude: 20.0000, longitude: -12.0000, code: "mr", continent: "África" },
  { name: "México", capital: "Ciudad de México", latitude: 19.4326, longitude: -99.1332, code: "mx", continent: "América del Norte" },
  { name: "Micronesia", capital: "Palikir", latitude: 6.9167, longitude: 158.1500, code: "fm", continent: "Oceanía" },
  { name: "Moldavia", capital: "Chisináu", latitude: 47.0000, longitude: 29.0000, code: "md", continent: "Europa" },
  { name: "Mónaco", capital: "Mónaco", latitude: 43.7333, longitude: 7.4000, code: "mc", continent: "Europa" },
  { name: "Mongolia", capital: "Ulán Bator", latitude: 46.0000, longitude: 105.0000, code: "mn", continent: "Asia" },
  { name: "Montenegro", capital: "Podgorica", latitude: 42.5000, longitude: 19.3000, code: "me", continent: "Europa" },
  { name: "Mozambique", capital: "Maputo", latitude: -18.2500, longitude: 35.0000, code: "mz", continent: "África" },
  { name: "Myanmar", capital: "Naypyidaw", latitude: 19.7515, longitude: 96.1622, code: "mm", continent: "Asia" },
  { name: "Namibia", capital: "Windhoek", latitude: -22.0000, longitude: 17.0000, code: "na", continent: "África" },
  { name: "Nauru", capital: "Yaren", latitude: -0.5228, longitude: 166.9340, code: "nr", continent: "Oceanía" },
  { name: "Nepal", capital: "Katmandú", latitude: 28.0000, longitude: 84.0000, code: "np", continent: "Asia" },
  { name: "Nicaragua", capital: "Managua", latitude: 12.1364, longitude: -86.2514, code: "ni", continent: "América del Norte" },
  { name: "Níger", capital: "Niamey", latitude: 16.0000, longitude: 8.0000, code: "ne", continent: "África" },
  { name: "Nigeria", capital: "Abuya", latitude: 9.0765, longitude: 7.3986, code: "ng", continent: "África" },
  { name: "Noruega", capital: "Oslo", latitude: 59.9139, longitude: 10.7522, code: "no", continent: "Europa" },
  { name: "Nueva Zelanda", capital: "Wellington", latitude: -41.0000, longitude: 174.0000, code: "nz", continent: "Oceanía" },
  { name: "Omán", capital: "Mascate", latitude: 21.0000, longitude: 57.0000, code: "om", continent: "Asia" },
  { name: "Países Bajos", capital: "Ámsterdam", latitude: 52.3676, longitude: 4.9041, code: "nl", continent: "Europa" },
  { name: "Pakistán", capital: "Islamabad", latitude: 30.0000, longitude: 70.0000, code: "pk", continent: "Asia" },
  { name: "Palaos", capital: "Melekeok", latitude: 7.5000, longitude: 134.5000, code: "pw", continent: "Oceanía" },
  { name: "Palaos", capital: "Melekeok", latitude: 7.5000, longitude: 134.5000, code: "pw", continent: "Oceanía" },
  { name: "Palestina", capital: "Jerusalén Este", latitude: 32.0000, longitude: 35.2500, code: "ps", continent: "Asia" },
  { name: "Panamá", capital: "Ciudad de Panamá", latitude: 8.9936, longitude: -79.5197, code: "pa", continent: "América del Norte" },
  { name: "Papúa Nueva Guinea", capital: "Port Moresby", latitude: -6.0000, longitude: 147.0000, code: "pg", continent: "Oceanía" },
  { name: "Paraguay", capital: "Asunción", latitude: -25.2637, longitude: -57.5759, code: "py", continent: "América del Sur" },
  { name: "Perú", capital: "Lima", latitude: -12.0464, longitude: -77.0428, code: "pe", continent: "América del Sur" },
  { name: "Polonia", capital: "Varsovia", latitude: 52.2297, longitude: 21.0122, code: "pl", continent: "Europa" },
  { name: "Portugal", capital: "Lisboa", latitude: 38.7223, longitude: -9.1393, code: "pt", continent: "Europa" },
  { name: "Qatar", capital: "Doha", latitude: 25.5000, longitude: 51.2500, code: "qa", continent: "Asia" },
  { name: "Reino Unido", capital: "Londres", latitude: 51.5074, longitude: -0.1278, code: "gb", continent: "Europa" },
  { name: "República Centroafricana", capital: "Bangui", latitude: 7.0000, longitude: 21.0000, code: "cf", continent: "África" },
  { name: "República Checa", capital: "Praga", latitude: 49.7500, longitude: 15.5000, code: "cz", continent: "Europa" },
  { name: "República Democrática del Congo", capital: "Brazzaville", latitude: -1.0000, longitude: 15.0000, code: "cd", continent: "África" },
  { name: "República Dominicana", capital: "Santo Domingo", latitude: 18.4861, longitude: -69.9312, code: "do", continent: "América del Norte" },
  { name: "Ruanda", capital: "Kigali", latitude: -2.0000, longitude: 30.0000, code: "rw", continent: "África" },
  { name: "Rumania", capital: "Bucarest", latitude: 46.0000, longitude: 25.0000, code: "ro", continent: "Europa" },
  { name: "Rusia", capital: "Moscú", latitude: 55.7558, longitude: 37.6173, code: "ru", continent: "Europa" },
  { name: "Samoa", capital: "Apia", latitude: -13.5833, longitude: -172.3333, code: "ws", continent: "Oceanía" },
  { name: "San Cristóbal y Nieves", capital: "Basseterre", latitude: 17.3333, longitude: -62.7500, code: "kn", continent: "América del Norte" },
  { name: "San Marino", capital: "San Marino", latitude: 43.7667, longitude: 12.4167, code: "sm", continent: "Europa" },
  { name: "San Vicente y las Granadinas", capital: "Kingstown", latitude: 13.2500, longitude: -61.2000, code: "vc", continent: "América del Norte" },
  { name: "Santa Lucía", capital: "Castries", latitude: 13.8833, longitude: -61.1333, code: "lc", continent: "América del Norte" },
  { name: "Santo Tomé y Príncipe", capital: "Santo Tomé", latitude: 1.0000, longitude: 7.0000, code: "st", continent: "África" },
  { name: "Senegal", capital: "Dakar", latitude: 14.0000, longitude: -14.0000, code: "sn", continent: "África" },
  { name: "Serbia", capital: "Belgrado", latitude: 44.0000, longitude: 21.0000, code: "rs", continent: "Europa" },
  { name: "Seychelles", capital: "Victoria", latitude: -4.5833, longitude: 55.6667, code: "sc", continent: "África" },
  { name: "Sierra Leona", capital: "Freetown", latitude: 8.5000, longitude: -11.5000, code: "sl", continent: "África" },
  { name: "Singapur", capital: "Singapur", latitude: 1.3667, longitude: 103.8000, code: "sg", continent: "Asia" },
  { name: "Siria", capital: "Damasco", latitude: 35.0000, longitude: 38.0000, code: "sy", continent: "Asia" },
  { name: "Somalia", capital: "Mogadiscio", latitude: 10.0000, longitude: 49.0000, code: "so", continent: "África" },
  { name: "Sri Lanka", capital: "Colombo", latitude: 7.0000, longitude: 81.0000, code: "lk", continent: "Asia" },
  { name: "Sudáfrica", capital: "Pretoria", latitude: -25.7461, longitude: 28.1881, code: "za", continent: "África" },
  { name: "Sudán del Sur", capital: "Yuba", latitude: 7.0000, longitude: 30.0000, code: "ss", continent: "África" },
  { name: "Sudán", capital: "Jartum", latitude: 15.0000, longitude: 30.0000, code: "sd", continent: "África" },
  { name: "Suecia", capital: "Estocolmo", latitude: 59.3293, longitude: 18.0686, code: "se", continent: "Europa" },
  { name: "Suiza", capital: "Berna", latitude: 46.9480, longitude: 7.4474, code: "ch", continent: "Europa" },
  { name: "Surinam", capital: "Paramaribo", latitude: 4.0000, longitude: -56.0000, code: "sr", continent: "América del Sur" },
  { name: "Tailandia", capital: "Bangkok", latitude: 15.0000, longitude: 100.0000, code: "th", continent: "Asia" },
  { name: "Taiwan", capital: "Taipei", latitude: 25.0000, longitude: 121.0000, code: "tw", continent: "Asia" },
  { name: "Tanzania", capital: "Dodoma", latitude: -6.0000, longitude: 35.0000, code: "tz", continent: "África" },
  { name: "Tayikistán", capital: "Dusambé", latitude: 39.0000, longitude: 71.0000, code: "tj", continent: "Asia" },
  { name: "Timor Oriental", capital: "Dili", latitude: -8.5500, longitude: 125.5167, code: "tl", continent: "Asia" },
  { name: "Togo", capital: "Lomé", latitude: 8.0000, longitude: 1.1667, code: "tg", continent: "África" },
  { name: "Tonga", capital: "Nukualofa", latitude: -20.0000, longitude: -175.0000, code: "to", continent: "Oceanía" },
  { name: "Trinidad y Tobago", capital: "Puerto España", latitude: 11.0000, longitude: -61.0000, code: "tt", continent: "América del Norte" },
  { name: "Túnez", capital: "Túnez", latitude: 34.0000, longitude: 9.0000, code: "tn", continent: "África" },
  { name: "Turkmenistán", capital: "Asjabad", latitude: 40.0000, longitude: 60.0000, code: "tm", continent: "Asia" },
  { name: "Turquía", capital: "Ankara", latitude: 39.9334, longitude: 32.8597, code: "tr", continent: "Asia" },
  { name: "Tuvalu", capital: "Funafuti", latitude: -8.0000, longitude: 178.0000, code: "tv", continent: "Oceanía" },
  { name: "Ucrania", capital: "Kiev", latitude: 50.4501, longitude: 30.5234, code: "ua", continent: "Europa" },
  { name: "Uganda", capital: "Kampala", latitude: 1.0000, longitude: 32.0000, code: "ug", continent: "África" },
  { name: "Uruguay", capital: "Montevideo", latitude: -34.9011, longitude: -56.1645, code: "uy", continent: "América del Sur" },
  { name: "Uzbekistán", capital: "Taskent", latitude: 41.0000, longitude: 64.0000, code: "uz", continent: "Asia" },
  { name: "Vanuatu", capital: "Port Vila", latitude: -16.0000, longitude: 167.0000, code: "vu", continent: "Oceanía" },
  { name: "Venezuela", capital: "Caracas", latitude: 10.4806, longitude: -66.9036, code: "ve", continent: "América del Sur" },
  { name: "Vietnam", capital: "Hanói", latitude: 16.0000, longitude: 106.0000, code: "vn", continent: "Asia" },
  { name: "Yemen", capital: "Saná", latitude: 15.0000, longitude: 48.0000, code: "ye", continent: "Asia" },
  { name: "Yibuti", capital: "Yibuti", latitude: 11.5000, longitude: 43.0000, code: "dj", continent: "África" },
  { name: "Zambia", capital: "Lusaka", latitude: -15.0000, longitude: 30.0000, code: "zm", continent: "África" },
  { name: "Zimbabue", capital: "Harare", latitude: -20.0000, longitude: 30.0000, code: "zw", continent: "África" },
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