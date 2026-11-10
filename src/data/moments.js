// Moments for the Photobook (/photobook), newest first. "image" is the cover
// shown in the book; "photos" adds more, shown in a slider on the moment's own
// page. An image can be a file in /public (e.g. "/moments/rain.jpg") or a URL.
// Each moment looks like this:
//
//   {
//     date: "2026-11-08",
//     place: "Sylhet",
//     weather: "Rain all morning",
//     title: "Tea after the rain",
//     note: "A sentence or two about the moment.",
//     image: "/moments/tea.jpg",            // the cover shown in the book
//     alt: "Two cups of tea on a wooden table",
//     photos: [                             // optional: more photos for its page
//       { src: "/moments/tea-2.jpg", alt: "Rain on the window" },
//     ],
//   },
const entries = [];

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
