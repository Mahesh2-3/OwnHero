export default function AppLoading() {
  return <div className="page-loading" role="status" aria-busy="true">
    <span className="visually-hidden">Loading page</span>
    <div className="loading-title skeleton-block"/>
    <div className="loading-description skeleton-block"/>
    <div className="loading-stats">
      <div className="panel loading-stat skeleton-block"/>
      <div className="panel loading-stat skeleton-block"/>
      <div className="panel loading-stat skeleton-block"/>
    </div>
    <div className="panel loading-panel skeleton-block"/>
    <div className="loading-columns">
      <div className="panel loading-panel skeleton-block"/>
      <div className="panel loading-panel skeleton-block"/>
    </div>
  </div>;
}
