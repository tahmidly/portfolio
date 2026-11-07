import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "../lib/gsap";
import "./GitHubActivity.css";

const GITHUB_USERNAME = import.meta.env.VITE_GITHUB_USERNAME || "";

function GitHubIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function levelFor(count) {
  if (count <= 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 9) return 3;
  return 4;
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Deterministic demo data so the graph looks realistic without an API call.
function buildDemoData() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  start.setDate(start.getDate() - 363);
  start.setDate(start.getDate() - start.getDay()); // start on Sunday

  const days = [];
  let total = 0;

  for (const cursor = new Date(start); cursor <= today; cursor.setDate(cursor.getDate() + 1)) {
    const index = days.length;
    const weekday = cursor.getDay();
    const noise =
      Math.abs(Math.sin((index + 7) * 12.9898) * 43758.5453) % 1;

    let count = 0;
    if (noise > 0.16) {
      const ceiling = weekday === 0 || weekday === 6 ? 6 : 13;
      count = Math.floor(noise * ceiling);
      if (noise > 0.93) count += 9;
    }

    total += count;
    days.push({
      date: toISODate(cursor),
      count,
      level: levelFor(count),
    });
  }

  return { days, total };
}

function normalizeContributions(payload) {
  const days = (payload.contributions || []).map((day) => ({
    date: day.date,
    count: day.count,
    level: typeof day.level === "number" ? day.level : levelFor(day.count),
  }));

  return {
    days,
    total: days.reduce((sum, day) => sum + day.count, 0),
  };
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function GitHubActivity() {
  const [data, setData] = useState(buildDemoData);
  const gridRef = useRef(null);

  useEffect(() => {
    if (!GITHUB_USERNAME) return undefined;

    let active = true;
    fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
    )
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => {
        if (active) setData(normalizeContributions(payload));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return undefined;

    const cells = grid.querySelectorAll(".github-activity-cell");
    const tween = gsap.fromTo(
      cells,
      { scale: 0, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "back.out(2)",
        stagger: { each: 0.004, from: "start" },
        delay: 0.9,
        onComplete: () => gsap.set(cells, { clearProps: "transform" }),
      },
    );

    return () => tween.kill();
  }, [data]);

  const contributionLabel = useMemo(() => {
    const noun = data.total === 1 ? "contribution" : "contributions";
    return `${data.total.toLocaleString()} ${noun} in the last year`;
  }, [data.total]);

  return (
    <div className="github-activity blur-in">
      <div className="github-activity-header">
        <span className="github-activity-title">
          <GitHubIcon />
          GitHub activity
          {GITHUB_USERNAME ? (
            <span className="github-activity-handle">
              @{GITHUB_USERNAME}
            </span>
          ) : null}
        </span>
        <span className="github-activity-total">{contributionLabel}</span>
      </div>

      <div className="github-activity-scroll">
        <div
          className="github-activity-grid"
          ref={gridRef}
          role="img"
          aria-label={`GitHub contribution graph — ${contributionLabel}`}
        >
          {data.days.map((day, index) => (
            <div
              key={day.date}
              className={`github-activity-cell level-${day.level}`}
              style={{ "--i": index }}
              title={`${day.count} ${
                day.count === 1 ? "contribution" : "contributions"
              } on ${formatDate(day.date)}`}
            />
          ))}
        </div>
        <span className="github-activity-sweep" aria-hidden="true" />
      </div>

      <div className="github-activity-legend" aria-hidden="true">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`github-activity-legend-cell level-${level}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
