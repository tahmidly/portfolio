import Reveal from "./Reveal";
import NoisyShimmerButton from "./ui/NoisyShimmerButton";
import "./SectionHeader.css";

export default function SectionHeader({
  eyebrow,
  title,
  subtitle,
  action,
  actionVariant = "default",
  actionOnClick,
}) {
  return (
    <Reveal className="section-header" start="top 85%">
      <div className="section-header-row">
        <div>
          <div className="section-eyebrow">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">{eyebrow}</span>
          </div>
          <h2 className="section-heading">{title}</h2>
          {subtitle ? <p className="section-sub">{subtitle}</p> : null}
        </div>
        {action ? (
          actionVariant === "shimmer" ? (
            <div className="section-header-action">
              <NoisyShimmerButton type="button" onClick={actionOnClick}>
                <span className="text-sm font-medium tracking-tight text-white whitespace-nowrap">
                  {action}
                </span>
              </NoisyShimmerButton>
            </div>
          ) : (
            <button type="button" className="view-all-btn">
              {action}
            </button>
          )
        ) : null}
      </div>
    </Reveal>
  );
}
