export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#F4ECD8', color: '#1A1A1A', minHeight: '100vh' }}>
      {children}
    </div>
  );
}
