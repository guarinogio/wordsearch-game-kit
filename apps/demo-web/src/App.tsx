export default function App() {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: '2rem',
        background: '#0b1020',
        color: '#f8fafc',
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ maxWidth: 720, textAlign: 'center' }}>
        <h1 style={{ marginBottom: 12, fontSize: '2rem' }}>wordsearch-game-kit</h1>
        <p style={{ opacity: 0.85 }}>
          Bootstrap listo. La siguiente fase implementa los contratos públicos y la API inicial.
        </p>
      </div>
    </main>
  );
}