// Einfachste mögliche Test-Route
export default function TestPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'green', fontSize: '24px' }}>✅ Finanzierung Route funktioniert!</h1>
      <p>Diese Seite beweist, dass die /finanzierung Route korrekt geladen wird.</p>
      <p>Zeit: {new Date().toLocaleString()}</p>
    </div>
  )
}