// Entries for the Photobook (/photobook), newest first. "image" is the cover
// shown in the book; "photos" adds more, shown in a slider on the moment's own
// page. Replace these sample entries with your own: an image can be an upload
// in /public (e.g. "/moments/rain.jpg") or a URL.
const unsplash = (id) =>
  `https://images.unsplash.com/${id}?w=900&q=80&auto=format&fit=crop`;

const entries = [
  {
    date: "2026-11-08",
    place: "Sylhet",
    weather: "Rain all morning",
    title: "Tea after the rain",
    note: "The roof drummed for hours. When it stopped, the whole street smelled of wet earth and somebody's kettle.",
    image: unsplash("photo-1495474472287-4d71bcdd2085"),
    alt: "Two cups of coffee on a wooden table",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1509042239860-f550ce710b93"), alt: "Cups of coffee with latte art on a wooden table" },
      { src: unsplash("photo-1442512595331-e89e73853f31"), alt: "Coffee being brewed at a small café counter" },
      { src: unsplash("photo-1515823064-d6e0c04616a7"), alt: "A green latte in a white cup" },
    ],
  },
  {
    date: "2026-10-30",
    place: "Bhola",
    weather: "Warm, still air",
    title: "Buffalo in the river",
    note: "Only their heads above the water, perfectly patient. I watched for an hour and nobody moved, me included.",
    image: unsplash("photo-1626041934397-aa2dbadac561"),
    alt: "A water buffalo resting in a river",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1516426122078-c23e76319801"), alt: "Sunset over wide grassland and trees" },
      { src: unsplash("photo-1470071459604-3b5ec3a7fe05"), alt: "Green hills under an evening sky" },
    ],
  },
  {
    date: "2026-10-12",
    place: "Cox's Bazar",
    weather: "Clear, light wind",
    title: "First light on the sea",
    note: "Up before the sun for once. The waves kept their own time, the way they always do.",
    image: unsplash("photo-1507525428034-b723cf961d3e"),
    alt: "Calm sea meeting a sandy beach at sunrise",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1505142468610-359e7d316be0"), alt: "Waves rolling onto the sand, seen from above" },
      { src: unsplash("photo-1473116763249-2faaef81ccda"), alt: "Soft waves on the beach at sunset" },
      { src: unsplash("photo-1519046904884-53103b34b206"), alt: "Palm trees and umbrellas on a white beach" },
    ],
  },
  {
    date: "2026-09-21",
    place: "Srimangal",
    weather: "Mist, then sun",
    title: "A walk through green",
    note: "The forest held the morning fog like a secret. Every few steps the light changed.",
    image: unsplash("photo-1448375240586-882707db888b"),
    alt: "Light falling through a misty forest",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1441974231531-c6227db76b6e"), alt: "Tall trees in a sunlit forest" },
      { src: unsplash("photo-1447752875215-b2761acb3c5d"), alt: "A wooden bridge leading into the forest" },
      { src: unsplash("photo-1506744038136-46273834b3fb"), alt: "Trees and mountains reflected in a still lake" },
    ],
  },
  {
    date: "2026-08-30",
    place: "Home",
    weather: "Humid evening",
    title: "The shelf by my desk",
    note: "Rearranged the books again. Kept only the ones I would happily read a second time.",
    image: unsplash("photo-1512820790803-83ca734da794"),
    alt: "A stack of old books",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1481627834876-b7833e8f5570"), alt: "Rows of old books in a library" },
      { src: unsplash("photo-1507842217343-583bb7270b66"), alt: "A wall of bookshelves" },
      { src: unsplash("photo-1495446815901-a7297e633e8d"), alt: "Book spines standing in a row" },
    ],
  },
  {
    date: "2026-08-02",
    place: "Bandarban",
    weather: "Cool, no signal",
    title: "Up in the hills",
    note: "No messages for two days. The valley filled with cloud every morning and emptied by noon.",
    image: unsplash("photo-1469474968028-56623f02e42e"),
    alt: "Sunlight over green hills and a valley",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1501785888041-af3ef285b470"), alt: "A boat on a turquoise lake between mountains" },
      { src: unsplash("photo-1464822759023-fed622ff2c3b"), alt: "Mountains above a green valley" },
      { src: unsplash("photo-1464278533981-50106e6176b1"), alt: "Hills reflected in water at dusk" },
    ],
  },
  {
    date: "2026-07-14",
    place: "On the road",
    weather: "Cold and bright",
    title: "Above the clouds",
    note: "A view that made everyone in the car stop talking at the same moment.",
    image: unsplash("photo-1506905925346-21bda4d32df4"),
    alt: "Mountains rising above a sea of clouds",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1454496522488-7a8e488e8606"), alt: "Snowy mountain peaks under a clear sky" },
      { src: unsplash("photo-1500530855697-b586d89ba3ee"), alt: "A long road through a red canyon" },
    ],
  },
  {
    date: "2026-06-20",
    place: "Somewhere quiet",
    weather: "Clear night",
    title: "More stars than dark",
    note: "Lay on the roof until my neck hurt. Lost count somewhere after a thousand.",
    image: unsplash("photo-1519681393784-d120267933ba"),
    alt: "A starry night sky over snowy mountains",
    // More photos from the same day (the first photo above is the cover).
    photos: [
      { src: unsplash("photo-1419242902214-272b3f66ee7a"), alt: "The Milky Way over a dark horizon" },
      { src: unsplash("photo-1444703686981-a3abbc4d4fe3"), alt: "A person standing under the Milky Way" },
      { src: unsplash("photo-1475274047050-1d0c0975c63e"), alt: "A night sky full of stars" },
    ],
  },
];

// Each moment gets its own page at /photobook/<slug>/ (from its date and title).
export const momentSlug = (m) =>
  `${m.date}-${m.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// Every moment: its slug, plus all its photos in order (cover first).
export const moments = entries.map((m) => ({
  ...m,
  slug: momentSlug(m),
  images: [{ src: m.image, alt: m.alt }, ...(m.photos ?? [])],
}));

// "2026-11-08" → "Sunday the 8th of November"
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July",
  "August", "September", "October", "November", "December"];
function ordinal(day) {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${{ 1: "st", 2: "nd", 3: "rd" }[day % 10] || "th"}`;
}
export function logDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} the ${ordinal(d.getDate())} of ${MONTHS[d.getMonth()]}`;
}
