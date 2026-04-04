/**
 * Built-in airport database — no API dependency.
 * Covers major international airports relevant to AU/NZ travellers.
 */

interface Airport {
  iataCode: string
  name: string
  cityName: string
  countryCode: string
}

const AIRPORTS: Airport[] = [
  // Australia
  { iataCode: 'SYD', name: 'Sydney Airport', cityName: 'Sydney', countryCode: 'AU' },
  { iataCode: 'MEL', name: 'Melbourne Airport', cityName: 'Melbourne', countryCode: 'AU' },
  { iataCode: 'BNE', name: 'Brisbane Airport', cityName: 'Brisbane', countryCode: 'AU' },
  { iataCode: 'PER', name: 'Perth Airport', cityName: 'Perth', countryCode: 'AU' },
  { iataCode: 'ADL', name: 'Adelaide Airport', cityName: 'Adelaide', countryCode: 'AU' },
  { iataCode: 'OOL', name: 'Gold Coast Airport', cityName: 'Gold Coast', countryCode: 'AU' },
  { iataCode: 'CNS', name: 'Cairns Airport', cityName: 'Cairns', countryCode: 'AU' },
  { iataCode: 'CBR', name: 'Canberra Airport', cityName: 'Canberra', countryCode: 'AU' },
  { iataCode: 'HBA', name: 'Hobart Airport', cityName: 'Hobart', countryCode: 'AU' },
  { iataCode: 'DRW', name: 'Darwin Airport', cityName: 'Darwin', countryCode: 'AU' },
  // New Zealand
  { iataCode: 'AKL', name: 'Auckland Airport', cityName: 'Auckland', countryCode: 'NZ' },
  { iataCode: 'WLG', name: 'Wellington Airport', cityName: 'Wellington', countryCode: 'NZ' },
  { iataCode: 'CHC', name: 'Christchurch Airport', cityName: 'Christchurch', countryCode: 'NZ' },
  { iataCode: 'ZQN', name: 'Queenstown Airport', cityName: 'Queenstown', countryCode: 'NZ' },
  // Southeast Asia
  { iataCode: 'SIN', name: 'Singapore Changi Airport', cityName: 'Singapore', countryCode: 'SG' },
  { iataCode: 'BKK', name: 'Suvarnabhumi Airport', cityName: 'Bangkok', countryCode: 'TH' },
  { iataCode: 'DMK', name: 'Don Mueang Airport', cityName: 'Bangkok', countryCode: 'TH' },
  { iataCode: 'KUL', name: 'Kuala Lumpur International Airport', cityName: 'Kuala Lumpur', countryCode: 'MY' },
  { iataCode: 'DPS', name: 'Ngurah Rai International Airport', cityName: 'Bali', countryCode: 'ID' },
  { iataCode: 'CGK', name: 'Soekarno-Hatta International Airport', cityName: 'Jakarta', countryCode: 'ID' },
  { iataCode: 'MNL', name: 'Ninoy Aquino International Airport', cityName: 'Manila', countryCode: 'PH' },
  { iataCode: 'SGN', name: 'Tan Son Nhat International Airport', cityName: 'Ho Chi Minh City', countryCode: 'VN' },
  { iataCode: 'HAN', name: 'Noi Bai International Airport', cityName: 'Hanoi', countryCode: 'VN' },
  { iataCode: 'RGN', name: 'Yangon International Airport', cityName: 'Yangon', countryCode: 'MM' },
  { iataCode: 'PNH', name: 'Phnom Penh International Airport', cityName: 'Phnom Penh', countryCode: 'KH' },
  // East Asia
  { iataCode: 'NRT', name: 'Narita International Airport', cityName: 'Tokyo', countryCode: 'JP' },
  { iataCode: 'HND', name: 'Tokyo Haneda Airport', cityName: 'Tokyo', countryCode: 'JP' },
  { iataCode: 'KIX', name: 'Kansai International Airport', cityName: 'Osaka', countryCode: 'JP' },
  { iataCode: 'ICN', name: 'Incheon International Airport', cityName: 'Seoul', countryCode: 'KR' },
  { iataCode: 'HKG', name: 'Hong Kong International Airport', cityName: 'Hong Kong', countryCode: 'HK' },
  { iataCode: 'TPE', name: 'Taiwan Taoyuan International Airport', cityName: 'Taipei', countryCode: 'TW' },
  // China
  { iataCode: 'PVG', name: 'Shanghai Pudong International Airport', cityName: 'Shanghai', countryCode: 'CN' },
  { iataCode: 'PEK', name: 'Beijing Capital International Airport', cityName: 'Beijing', countryCode: 'CN' },
  { iataCode: 'CAN', name: 'Guangzhou Baiyun International Airport', cityName: 'Guangzhou', countryCode: 'CN' },
  { iataCode: 'CTU', name: 'Chengdu Tianfu International Airport', cityName: 'Chengdu', countryCode: 'CN' },
  { iataCode: 'SZX', name: 'Shenzhen Bao\'an International Airport', cityName: 'Shenzhen', countryCode: 'CN' },
  { iataCode: 'XIY', name: 'Xi\'an Xianyang International Airport', cityName: 'Xi\'an', countryCode: 'CN' },
  { iataCode: 'KMG', name: 'Kunming Changshui International Airport', cityName: 'Kunming', countryCode: 'CN' },
  { iataCode: 'WUH', name: 'Wuhan Tianhe International Airport', cityName: 'Wuhan', countryCode: 'CN' },
  { iataCode: 'HGH', name: 'Hangzhou Xiaoshan International Airport', cityName: 'Hangzhou', countryCode: 'CN' },
  { iataCode: 'NKG', name: 'Nanjing Lukou International Airport', cityName: 'Nanjing', countryCode: 'CN' },
  { iataCode: 'CKG', name: 'Chongqing Jiangbei International Airport', cityName: 'Chongqing', countryCode: 'CN' },
  // South Asia
  { iataCode: 'DEL', name: 'Indira Gandhi International Airport', cityName: 'Delhi', countryCode: 'IN' },
  { iataCode: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', cityName: 'Mumbai', countryCode: 'IN' },
  { iataCode: 'CMB', name: 'Bandaranaike International Airport', cityName: 'Colombo', countryCode: 'LK' },
  // Middle East
  { iataCode: 'DXB', name: 'Dubai International Airport', cityName: 'Dubai', countryCode: 'AE' },
  { iataCode: 'AUH', name: 'Abu Dhabi International Airport', cityName: 'Abu Dhabi', countryCode: 'AE' },
  { iataCode: 'DOH', name: 'Hamad International Airport', cityName: 'Doha', countryCode: 'QA' },
  { iataCode: 'IST', name: 'Istanbul Airport', cityName: 'Istanbul', countryCode: 'TR' },
  // Europe
  { iataCode: 'LHR', name: 'Heathrow Airport', cityName: 'London', countryCode: 'GB' },
  { iataCode: 'LGW', name: 'Gatwick Airport', cityName: 'London', countryCode: 'GB' },
  { iataCode: 'CDG', name: 'Charles de Gaulle Airport', cityName: 'Paris', countryCode: 'FR' },
  { iataCode: 'AMS', name: 'Amsterdam Schiphol Airport', cityName: 'Amsterdam', countryCode: 'NL' },
  { iataCode: 'FRA', name: 'Frankfurt Airport', cityName: 'Frankfurt', countryCode: 'DE' },
  { iataCode: 'MUC', name: 'Munich Airport', cityName: 'Munich', countryCode: 'DE' },
  { iataCode: 'FCO', name: 'Leonardo da Vinci International Airport', cityName: 'Rome', countryCode: 'IT' },
  { iataCode: 'MAD', name: 'Adolfo Suárez Madrid–Barajas Airport', cityName: 'Madrid', countryCode: 'ES' },
  { iataCode: 'BCN', name: 'Barcelona–El Prat Airport', cityName: 'Barcelona', countryCode: 'ES' },
  { iataCode: 'ZRH', name: 'Zurich Airport', cityName: 'Zurich', countryCode: 'CH' },
  { iataCode: 'ATH', name: 'Athens International Airport', cityName: 'Athens', countryCode: 'GR' },
  // Americas
  { iataCode: 'LAX', name: 'Los Angeles International Airport', cityName: 'Los Angeles', countryCode: 'US' },
  { iataCode: 'SFO', name: 'San Francisco International Airport', cityName: 'San Francisco', countryCode: 'US' },
  { iataCode: 'JFK', name: 'John F. Kennedy International Airport', cityName: 'New York', countryCode: 'US' },
  { iataCode: 'ORD', name: "O'Hare International Airport", cityName: 'Chicago', countryCode: 'US' },
  { iataCode: 'MIA', name: 'Miami International Airport', cityName: 'Miami', countryCode: 'US' },
  { iataCode: 'SEA', name: 'Seattle-Tacoma International Airport', cityName: 'Seattle', countryCode: 'US' },
  { iataCode: 'HNL', name: 'Daniel K. Inouye International Airport', cityName: 'Honolulu', countryCode: 'US' },
  { iataCode: 'DEN', name: 'Denver International Airport', cityName: 'Denver', countryCode: 'US' },
  { iataCode: 'DFW', name: 'Dallas/Fort Worth International Airport', cityName: 'Dallas', countryCode: 'US' },
  { iataCode: 'YVR', name: 'Vancouver International Airport', cityName: 'Vancouver', countryCode: 'CA' },
  { iataCode: 'YYZ', name: 'Toronto Pearson International Airport', cityName: 'Toronto', countryCode: 'CA' },
  // Pacific Islands
  { iataCode: 'NAN', name: 'Nadi International Airport', cityName: 'Nadi', countryCode: 'FJ' },
  { iataCode: 'PPT', name: "Faa'a International Airport", cityName: 'Tahiti', countryCode: 'PF' },
  { iataCode: 'APW', name: 'Faleolo International Airport', cityName: 'Apia', countryCode: 'WS' },
  { iataCode: 'NOU', name: 'La Tontouta International Airport', cityName: 'Nouméa', countryCode: 'NC' },
  // Africa
  { iataCode: 'JNB', name: 'O.R. Tambo International Airport', cityName: 'Johannesburg', countryCode: 'ZA' },
  { iataCode: 'CPT', name: 'Cape Town International Airport', cityName: 'Cape Town', countryCode: 'ZA' },
  { iataCode: 'NBO', name: 'Jomo Kenyatta International Airport', cityName: 'Nairobi', countryCode: 'KE' },
]

/**
 * Search airports by keyword (city name, IATA code, or airport name).
 * Returns up to 8 results, sorted by relevance.
 */
export function searchAirportsLocal(keyword: string): Airport[] {
  const q = keyword.toLowerCase()

  // Score each airport by match quality
  const scored = AIRPORTS.map((a) => {
    const code = a.iataCode.toLowerCase()
    const city = a.cityName.toLowerCase()
    const name = a.name.toLowerCase()

    let score = 0
    if (code === q) score = 100                     // Exact IATA match
    else if (code.startsWith(q)) score = 80         // IATA prefix
    else if (city === q) score = 70                  // Exact city match
    else if (city.startsWith(q)) score = 60          // City prefix
    else if (name.startsWith(q)) score = 50          // Airport name prefix
    else if (city.includes(q)) score = 40            // City contains
    else if (name.includes(q)) score = 30            // Airport name contains
    else if (code.includes(q)) score = 20            // IATA contains

    return { airport: a, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((s) => s.airport)
}
