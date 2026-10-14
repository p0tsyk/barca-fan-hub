export default function Stub({ title }: { title: string }) {
  return (
    <div className="card">
      <h1>{title}</h1>
      <p className="muted">Экран в разработке — скоро здесь будет интерактив по макету из Figma.</p>
    </div>
  );
}