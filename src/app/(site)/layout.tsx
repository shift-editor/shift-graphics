import SiteFooter from "../components/SiteFooter";
import SiteHeader from "../components/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-app">
      <div className="flex flex-1 flex-col px-6 pt-8 sm:px-12 lg:px-24">
        <SiteHeader />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}
