// Entries for the Photobook (/photobook), newest first. Two entries fill
// one page of the book. Replace these sample entries with your own: the
// image can be an upload in /public (e.g. "/moments/rain.jpg") or a URL.
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
  },
  {
    date: "2026-10-30",
    place: "Bhola",
    weather: "Warm, still air",
    title: "Buffalo in the river",
    note: "Only their heads above the water, perfectly patient. I watched for an hour and nobody moved, me included.",
    image: unsplash("photo-1626041934397-aa2dbadac561"),
    alt: "A water buffalo resting in a river",
  },
  {
    date: "2026-10-12",
    place: "Cox's Bazar",
    weather: "Clear, light wind",
    title: "First light on the sea",
    note: "Up before the sun for once. The waves kept their own time, the way they always do.",
    image: unsplash("photo-1507525428034-b723cf961d3e"),
    alt: "Calm sea meeting a sandy beach at sunrise",
  },
  {
    date: "2026-09-21",
    place: "Srimangal",
    weather: "Mist, then sun",
    title: "A walk through green",
    note: "The forest held the morning fog like a secret. Every few steps the light changed.",
    image: unsplash("photo-1448375240586-882707db888b"),
    alt: "Light falling through a misty forest",
  },
  {
    date: "2026-08-30",
    place: "Home",
    weather: "Humid evening",
    title: "The shelf by my desk",
    note: "Rearranged the books again. Kept only the ones I would happily read a second time.",
    image: unsplash("photo-1512820790803-83ca734da794"),
    alt: "A stack of old books",
  },
  {
    date: "2026-08-02",
    place: "Bandarban",
    weather: "Cool, no signal",
    title: "Up in the hills",
    note: "No messages for two days. The valley filled with cloud every morning and emptied by noon.",
    image: unsplash("photo-1469474968028-56623f02e42e"),
    alt: "Sunlight over green hills and a valley",
  },
  {
    date: "2026-07-14",
    place: "On the road",
    weather: "Cold and bright",
    title: "Above the clouds",
    note: "A view that made everyone in the car stop talking at the same moment.",
    image: unsplash("photo-1506905925346-21bda4d32df4"),
    alt: "Mountains rising above a sea of clouds",
  },
  {
    date: "2026-06-20",
    place: "Somewhere quiet",
    weather: "Clear night",
    title: "More stars than dark",
    note: "Lay on the roof until my neck hurt. Lost count somewhere after a thousand.",
    image: unsplash("photo-1519681393784-d120267933ba"),
    alt: "A starry night sky over snowy mountains",
  },
];

// Each moment gets its own page at /photobook/<slug>/ (from its date and title).
export const momentSlug = (m) =>
  `${m.date}-${m.title}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const moments = entries.map((m) => ({ ...m, slug: momentSlug(m) }));

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
