
import AppHeader from "@/components/common/Header";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className=" p-5" >
      <AppHeader />
      {children}
    </div>
  );
}
