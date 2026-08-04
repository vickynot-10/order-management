export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-full flex flex-col max-w-full overflow-x-clip">
      {children}
    </main>
  );
}
