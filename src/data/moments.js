// Moments for the Photobook (/photobook), newest first. "image" is the cover
// shown in the book; "photos" adds more, shown in a slider on the moment's own
// page. An image can be a file in /public (e.g. "/moments/rain.jpg") or a URL.
// Each moment looks like this:
//
//   {
//     date: "2026-11-08",
//     endDate: "2026-11-10",              // optional: for a trip of several days
//     place: "Sylhet",
//     weather: "Rain all morning",
//     title: "Tea after the rain",
//     note: "A sentence or two about the moment.",
//     image: "/moments/tea.jpg",            // the cover shown in the book
//     alt: "Two cups of tea on a wooden table",
//     story: [                              // optional: a longer story for its page
//       "A first paragraph…",
//       "A second paragraph…",
//     ],
//     photos: [                             // optional: more photos for its page
//       { src: "/moments/tea-2.jpg", alt: "Rain on the window" },
//     ],
//   },
const entries = [
  {
    date: "2026-09-17",
    endDate: "2026-09-20", // optional: last day of a trip
    place: "Cox's Bazar",
    weather: "Warm sun, soft evening clouds",
    title: "Where the sea keeps the light",
    note: "Four slow days by the sea. Warm sand in the afternoon, waves that kept rolling in at dusk, green cliffs along the way, and a sun that sank quietly behind the palms.",
    image: "/photobook/coxs-bazar/waves-at-dusk.webp",
    alt: "Waves rolling in at dusk, with a few people far out in the water",
    // The longer story, shown only on the moment's own page (one paragraph per line).
    story: [
      "It was my first time at the sea. I stood on the sand for a long time, just watching the waves come and go. It felt bigger and calmer than I had ever imagined. And that sunset behind the palms is something I'll never forget.",
    ],
    photos: [
      {
        src: "/photobook/coxs-bazar/palm-sunset.webp",
        alt: "A palm tree in silhouette as the sun sets over the sea",
      },
      {
        src: "/photobook/coxs-bazar/beach-afternoon.webp",
        alt: "Green leaves in front of a wide, quiet beach under a bright blue sky",
      },
      {
        src: "/photobook/coxs-bazar/green-hills.webp",
        alt: "Green cliffs and palm trees above rice fields, with big white clouds",
      },
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
// A moment's date line: one day, or a trip from date to endDate.
export function logDateRange(moment) {
  if (!moment.endDate || moment.endDate === moment.date) return logDate(moment.date);
  const a = new Date(`${moment.date}T12:00:00`);
  const b = new Date(`${moment.endDate}T12:00:00`);
  const from = `${WEEKDAYS[a.getDay()]} the ${ordinal(a.getDate())}`;
  const to = `${WEEKDAYS[b.getDay()]} the ${ordinal(b.getDate())} of ${MONTHS[b.getMonth()]}`;
  return a.getMonth() === b.getMonth()
    ? `${from} to ${to}`
    : `${from} of ${MONTHS[a.getMonth()]} to ${to}`;
}

export function logDate(iso) {
  const d = new Date(`${iso}T12:00:00`);
  return `${WEEKDAYS[d.getDay()]} the ${ordinal(d.getDate())} of ${MONTHS[d.getMonth()]}`;
}
