export default function SectionCard({ title, children, actions }) {
  return (
    <section className="section-card">
      <div className="section-header">
        <h2>{title}</h2>
        <div>{actions}</div>
      </div>
      <div>{children}</div>
    </section>
  );
}