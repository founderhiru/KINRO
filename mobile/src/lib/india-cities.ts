// Mobile — India-wide city data for the Add/Edit Dog city picker.
//
// DogProfileWrite requires real latitude/longitude (see src/lib/contracts.ts
// and the backend's src/lib/contracts/dog-profiles.ts), and the backend's
// own distance search (CITY_CENTERS in src/app/api/dog-profiles/route.ts)
// only has exact coordinates for six metros. Neither of those actually
// requires the mobile app to restrict WHICH city a dog can be listed in —
// `city` itself is just a free-form string server-side. This file exists so
// the picker can go far beyond those six metros while every selection still
// resolves to *some* usable coordinate pair (see resolveCity in dog-form.ts).
//
// There is no geocoding API available in this project's environment (same
// constraint noted next to CITY_CENTERS), so coordinates below are the
// well-known city-centre points for each place — good enough for Discover's
// approximate distance sort, not survey-grade geocoding.

export interface CityCoordinates {
  latitude: number;
  longitude: number;
}

export interface CityEntry extends CityCoordinates {
  name: string;
}

const POPULAR_CITY_ENTRIES: readonly CityEntry[] = [
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Delhi NCR", latitude: 28.6139, longitude: 77.209 },
  { name: "Bengaluru", latitude: 12.9716, longitude: 77.5946 },
  { name: "Hyderabad", latitude: 17.385, longitude: 78.4867 },
  { name: "Chennai", latitude: 13.0827, longitude: 80.2707 },
  { name: "Pune", latitude: 18.5204, longitude: 73.8567 },
  { name: "Kolkata", latitude: 22.5726, longitude: 88.3639 },
  { name: "Ahmedabad", latitude: 23.0225, longitude: 72.5714 },
  { name: "Jaipur", latitude: 26.9124, longitude: 75.7873 },
  { name: "Lucknow", latitude: 26.8467, longitude: 80.9462 },
  { name: "Kochi", latitude: 9.9312, longitude: 76.2673 },
  { name: "Chandigarh", latitude: 30.7333, longitude: 76.7794 },
  { name: "Indore", latitude: 22.7196, longitude: 75.8577 },
  { name: "Nagpur", latitude: 21.1458, longitude: 79.0882 },
  { name: "Surat", latitude: 21.1702, longitude: 72.8311 },
  { name: "Coimbatore", latitude: 11.0168, longitude: 76.9558 },
  { name: "Mysuru", latitude: 12.2958, longitude: 76.6394 },
  { name: "Visakhapatnam", latitude: 17.6868, longitude: 83.2185 },
  { name: "Bhubaneswar", latitude: 20.2961, longitude: 85.8245 },
  { name: "Guwahati", latitude: 26.1445, longitude: 91.7362 },
  { name: "Dehradun", latitude: 30.3165, longitude: 78.0322 },
];

/** Shown first, before any search — the cities most owners will want. */
export const POPULAR_CITIES: readonly string[] = POPULAR_CITY_ENTRIES.map(
  (c) => c.name,
);

/**
 * Well beyond the metros: state capitals and other well-known Tier-2/3
 * Indian cities and towns, so the search reaches past the popular list
 * without needing a live geocoding service. Not exhaustive — anything
 * typed that isn't here still works via resolveCity's custom-city fallback.
 */
const OTHER_CITIES: readonly CityEntry[] = [
  { name: "Patna", latitude: 25.5941, longitude: 85.1376 },
  { name: "Bhopal", latitude: 23.2599, longitude: 77.4126 },
  { name: "Raipur", latitude: 21.2514, longitude: 81.6296 },
  { name: "Ranchi", latitude: 23.3441, longitude: 85.3096 },
  { name: "Thiruvananthapuram", latitude: 8.5241, longitude: 76.9366 },
  { name: "Amritsar", latitude: 31.634, longitude: 74.8723 },
  { name: "Ludhiana", latitude: 30.901, longitude: 75.8573 },
  { name: "Agra", latitude: 27.1767, longitude: 78.0081 },
  { name: "Varanasi", latitude: 25.3176, longitude: 82.9739 },
  { name: "Kanpur", latitude: 26.4499, longitude: 80.3319 },
  { name: "Nashik", latitude: 19.9975, longitude: 73.7898 },
  { name: "Vadodara", latitude: 22.3072, longitude: 73.1812 },
  { name: "Rajkot", latitude: 22.3039, longitude: 70.8022 },
  { name: "Jodhpur", latitude: 26.2389, longitude: 73.0243 },
  { name: "Udaipur", latitude: 24.5854, longitude: 73.7125 },
  { name: "Ajmer", latitude: 26.4499, longitude: 74.6399 },
  { name: "Bikaner", latitude: 28.0229, longitude: 73.3119 },
  { name: "Meerut", latitude: 28.9845, longitude: 77.7064 },
  { name: "Prayagraj", latitude: 25.4358, longitude: 81.8463 },
  { name: "Gwalior", latitude: 26.2183, longitude: 78.1828 },
  { name: "Jabalpur", latitude: 23.1815, longitude: 79.9864 },
  { name: "Amravati", latitude: 20.9374, longitude: 77.7796 },
  { name: "Aurangabad", latitude: 19.8762, longitude: 75.3433 },
  { name: "Solapur", latitude: 17.6599, longitude: 75.9064 },
  { name: "Thane", latitude: 19.2183, longitude: 72.9781 },
  { name: "Navi Mumbai", latitude: 19.033, longitude: 73.0297 },
  { name: "Kalyan", latitude: 19.2403, longitude: 73.1305 },
  { name: "Vasai-Virar", latitude: 19.4259, longitude: 72.8225 },
  { name: "Madurai", latitude: 9.9252, longitude: 78.1198 },
  { name: "Tiruchirappalli", latitude: 10.7905, longitude: 78.7047 },
  { name: "Salem", latitude: 11.6643, longitude: 78.146 },
  { name: "Tirunelveli", latitude: 8.7139, longitude: 77.7567 },
  { name: "Erode", latitude: 11.341, longitude: 77.7172 },
  { name: "Vellore", latitude: 12.9165, longitude: 79.1325 },
  { name: "Thoothukudi", latitude: 8.7642, longitude: 78.1348 },
  { name: "Warangal", latitude: 17.9689, longitude: 79.5941 },
  { name: "Vijayawada", latitude: 16.5062, longitude: 80.648 },
  { name: "Guntur", latitude: 16.3067, longitude: 80.4365 },
  { name: "Tirupati", latitude: 13.6288, longitude: 79.4192 },
  { name: "Nellore", latitude: 14.4426, longitude: 79.9865 },
  { name: "Kurnool", latitude: 15.8281, longitude: 78.0373 },
  { name: "Mangaluru", latitude: 12.9141, longitude: 74.856 },
  { name: "Hubballi-Dharwad", latitude: 15.3647, longitude: 75.124 },
  { name: "Belagavi", latitude: 15.8497, longitude: 74.4977 },
  { name: "Kalaburagi", latitude: 17.3297, longitude: 76.8343 },
  { name: "Davanagere", latitude: 14.4644, longitude: 75.9932 },
  { name: "Shivamogga", latitude: 13.9299, longitude: 75.5681 },
  { name: "Thrissur", latitude: 10.5276, longitude: 76.2144 },
  { name: "Kollam", latitude: 8.8932, longitude: 76.6141 },
  { name: "Kozhikode", latitude: 11.2588, longitude: 75.7804 },
  { name: "Kannur", latitude: 11.8745, longitude: 75.3704 },
  { name: "Alappuzha", latitude: 9.4981, longitude: 76.3388 },
  { name: "Puducherry", latitude: 11.9416, longitude: 79.8083 },
  { name: "Bhavnagar", latitude: 21.7645, longitude: 72.1519 },
  { name: "Jamnagar", latitude: 22.4707, longitude: 70.0577 },
  { name: "Anand", latitude: 22.5645, longitude: 72.9289 },
  { name: "Gandhinagar", latitude: 23.2156, longitude: 72.6369 },
  { name: "Bhilai", latitude: 21.1938, longitude: 81.3509 },
  { name: "Bilaspur", latitude: 22.0797, longitude: 82.1409 },
  { name: "Durgapur", latitude: 23.5204, longitude: 87.3119 },
  { name: "Asansol", latitude: 23.6739, longitude: 86.9524 },
  { name: "Siliguri", latitude: 26.7271, longitude: 88.3953 },
  { name: "Howrah", latitude: 22.5958, longitude: 88.2636 },
  { name: "Cuttack", latitude: 20.4625, longitude: 85.8828 },
  { name: "Rourkela", latitude: 22.2604, longitude: 84.8536 },
  { name: "Berhampur", latitude: 19.3149, longitude: 84.7941 },
  { name: "Imphal", latitude: 24.817, longitude: 93.9368 },
  { name: "Shillong", latitude: 25.5788, longitude: 91.8933 },
  { name: "Agartala", latitude: 23.8315, longitude: 91.2868 },
  { name: "Aizawl", latitude: 23.7271, longitude: 92.7176 },
  { name: "Kohima", latitude: 25.6751, longitude: 94.1086 },
  { name: "Itanagar", latitude: 27.0844, longitude: 93.6053 },
  { name: "Gangtok", latitude: 27.3389, longitude: 88.6065 },
  { name: "Panaji", latitude: 15.4909, longitude: 73.8278 },
  { name: "Margao", latitude: 15.2832, longitude: 73.9862 },
  { name: "Shimla", latitude: 31.1048, longitude: 77.1734 },
  { name: "Manali", latitude: 32.2432, longitude: 77.1892 },
  { name: "Dharamshala", latitude: 32.219, longitude: 76.3234 },
  { name: "Srinagar", latitude: 34.0837, longitude: 74.7973 },
  { name: "Jammu", latitude: 32.7266, longitude: 74.857 },
  { name: "Leh", latitude: 34.1526, longitude: 77.5771 },
  { name: "Faridabad", latitude: 28.4089, longitude: 77.3178 },
  { name: "Gurugram", latitude: 28.4595, longitude: 77.0266 },
  { name: "Noida", latitude: 28.5355, longitude: 77.391 },
  { name: "Ghaziabad", latitude: 28.6692, longitude: 77.4538 },
  { name: "Rohtak", latitude: 28.8955, longitude: 76.6066 },
  { name: "Hisar", latitude: 29.1492, longitude: 75.7217 },
  { name: "Karnal", latitude: 29.6857, longitude: 76.9905 },
  { name: "Panipat", latitude: 29.3909, longitude: 76.9635 },
  { name: "Bareilly", latitude: 28.367, longitude: 79.4304 },
  { name: "Aligarh", latitude: 27.8974, longitude: 78.088 },
  { name: "Moradabad", latitude: 28.8386, longitude: 78.7733 },
  { name: "Gorakhpur", latitude: 26.7606, longitude: 83.3732 },
  { name: "Jhansi", latitude: 25.4484, longitude: 78.5685 },
  { name: "Muzaffarpur", latitude: 26.1225, longitude: 85.3906 },
  { name: "Gaya", latitude: 24.7955, longitude: 85.0002 },
  { name: "Bhagalpur", latitude: 25.2445, longitude: 86.9718 },
  { name: "Darbhanga", latitude: 26.1542, longitude: 85.8918 },
  { name: "Dhanbad", latitude: 23.7957, longitude: 86.4304 },
  { name: "Jamshedpur", latitude: 22.8046, longitude: 86.2029 },
  { name: "Bokaro", latitude: 23.6693, longitude: 86.1511 },
  { name: "Dimapur", latitude: 25.9091, longitude: 93.7278 },
  { name: "Silchar", latitude: 24.8333, longitude: 92.7789 },
  { name: "Tezpur", latitude: 26.6338, longitude: 92.8 },
  { name: "Rajahmundry", latitude: 17.0005, longitude: 81.804 },
  { name: "Kakinada", latitude: 16.9891, longitude: 82.2475 },
  { name: "Anantapur", latitude: 14.6819, longitude: 77.6006 },
  { name: "Nizamabad", latitude: 18.6725, longitude: 78.0941 },
  { name: "Karimnagar", latitude: 18.4386, longitude: 79.1288 },
  { name: "Bidar", latitude: 17.9104, longitude: 77.5199 },
  { name: "Latur", latitude: 18.4088, longitude: 76.5604 },
  { name: "Kolhapur", latitude: 16.705, longitude: 74.2433 },
  { name: "Sangli", latitude: 16.8524, longitude: 74.5815 },
  { name: "Satara", latitude: 17.6805, longitude: 74.0183 },
  { name: "Akola", latitude: 20.7002, longitude: 77.0082 },
  { name: "Nanded", latitude: 19.1383, longitude: 77.321 },
  { name: "Ratnagiri", latitude: 16.9902, longitude: 73.312 },
  { name: "Bharuch", latitude: 21.7051, longitude: 72.9959 },
  { name: "Junagadh", latitude: 21.5222, longitude: 70.4579 },
  { name: "Patiala", latitude: 30.3398, longitude: 76.3869 },
  { name: "Bathinda", latitude: 30.211, longitude: 74.9455 },
  { name: "Jalandhar", latitude: 31.326, longitude: 75.5762 },
  { name: "Ambala", latitude: 30.3782, longitude: 76.7767 },
  { name: "Sirsa", latitude: 29.5321, longitude: 75.0318 },
  { name: "Vijayapura", latitude: 16.8302, longitude: 75.71 },
  { name: "Tumakuru", latitude: 13.3379, longitude: 77.1173 },
  { name: "Udupi", latitude: 13.3409, longitude: 74.7421 },
  { name: "Cuddalore", latitude: 11.748, longitude: 79.7714 },
  { name: "Kanchipuram", latitude: 12.8342, longitude: 79.7036 },
  { name: "Dindigul", latitude: 10.3673, longitude: 77.9803 },
  { name: "Karur", latitude: 10.9601, longitude: 78.0766 },
  { name: "Nagercoil", latitude: 8.178, longitude: 77.4346 },
  { name: "Rewa", latitude: 24.5364, longitude: 81.3037 },
  { name: "Sagar", latitude: 23.8388, longitude: 78.7378 },
  { name: "Ujjain", latitude: 23.1765, longitude: 75.7885 },
  { name: "Dewas", latitude: 22.9676, longitude: 76.0534 },
  { name: "Ratlam", latitude: 23.3315, longitude: 75.0367 },
  { name: "Satna", latitude: 24.6005, longitude: 80.8322 },
  { name: "Sambalpur", latitude: 21.4669, longitude: 83.9756 },
  { name: "Balasore", latitude: 21.4942, longitude: 86.9317 },
  { name: "Puri", latitude: 19.8135, longitude: 85.8312 },
  { name: "Alwar", latitude: 27.553, longitude: 76.6346 },
  { name: "Sikar", latitude: 27.6094, longitude: 75.1399 },
  { name: "Kota", latitude: 25.2138, longitude: 75.8648 },
  { name: "Bhilwara", latitude: 25.3407, longitude: 74.6313 },
  { name: "Sri Ganganagar", latitude: 29.9094, longitude: 73.88 },
];

/** Every city this picker knows the exact coordinates for — popular cities first, then the rest alphabetically. */
export const INDIA_CITIES: readonly CityEntry[] = [
  ...POPULAR_CITY_ENTRIES,
  ...[...OTHER_CITIES].sort((a, b) => a.name.localeCompare(b.name)),
];

export const OTHER_CITY_NAMES: readonly string[] = INDIA_CITIES.slice(
  POPULAR_CITIES.length,
).map((c) => c.name);

/**
 * Geographic centre of India — the best-effort placeholder location for a
 * city someone typed by hand that isn't in INDIA_CITIES. There's no
 * geocoding API available here (see the module comment above), so this
 * keeps Discover's distance search harmless (rather than wrong) for that one
 * dog instead of ever blocking profile creation on a city not being listed.
 */
export const INDIA_CENTER: CityCoordinates = {
  latitude: 22.9734,
  longitude: 78.6569,
};

export function findKnownCity(name: string): CityEntry | undefined {
  const target = name.trim().toLocaleLowerCase("en-IN");
  if (!target) return undefined;
  return INDIA_CITIES.find((c) => c.name.toLocaleLowerCase("en-IN") === target);
}
