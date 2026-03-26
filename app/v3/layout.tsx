export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FAF8F5', color: '#1A1A2E', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
