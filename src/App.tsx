import './App.css';


function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #6366f1 60%, #f8fafc 100%)',
      }}
    >
      <div style={{ display: 'flex', gap: '3vw', alignItems: 'center', marginBottom: '2.5rem' }}>
        <img
          src="/Media/Images/Atherion_Transparent.png"
          alt="Atherion Logo"
          style={{ height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 2px 16px #6366f1aa) brightness(1.15)' }}
        />
        <img
          src="/Media/Images/Andromeda_Transparent.png"
          alt="Andromeda Logo"
          style={{ height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 2px 16px #6366f1aa) brightness(1.15)' }}
        />
      </div>
      <h2
        style={{
          fontWeight: 400,
          color: '#f1f5f9',
          fontSize: '1.5rem',
          letterSpacing: '0.02em',
          opacity: 0.93,
          textAlign: 'center',
          textShadow: '0 2px 8px #1e293b88',
        }}
      >
        Webpage wireframe and scaffolding
      </h2>
    </div>
  );
}

export default App;
