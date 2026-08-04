
import AppHeader from "@/components/common/Header";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
