import "./RouteLoading.css";

/**
 * Instant fallback shown by loading.jsx while a route renders on the server,
 * so a click gives immediate feedback instead of appearing to do nothing.
 */
export default function RouteLoading() {
  return (
    <div className="route-loading" role="status" aria-label="Loading">
      <span className="route-loading-bar" aria-hidden="true" />
      <span className="route-loading-dot" aria-hidden="true" />
    </div>
  );
}
