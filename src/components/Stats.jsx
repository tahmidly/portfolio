import { stats } from "../data/portfolio";
import "./Stats.css";

export default function Stats() {
  return (
    <section className="stats" id="stats">
      <div className="stats-inner">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-number text-gradient">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
