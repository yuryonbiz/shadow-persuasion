export default function V5Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#FFFFFF', color: '#111111', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
