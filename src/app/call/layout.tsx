export default function CallLayout({ children }: { children: React.ReactNode }) {
  return <div className="h-screen bg-black relative z-auto">{children}</div>;
}
