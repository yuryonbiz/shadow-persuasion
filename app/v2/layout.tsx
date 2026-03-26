export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#0C0C0C', color: '#E8E8E0', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
