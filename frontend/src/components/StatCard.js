export default function StatCard({ title, value, subtitle }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span className="stat-title">{title}</span>
        <span className="stat-icon">🐚</span>
      </div>
      <h3 className="stat-value">{value}</h3>
      {subtitle ? <p className="stat-subtitle">{subtitle}</p> : null}
    </div>
  );
}