import Image from "next/image";
import Link from "next/link";
import type { UpdatesSignupPreviewState } from "@/lib/updates-types";
import UpdatesSignupForm from "./UpdatesSignupForm";
import CaptLocke from "./capt-locke/CaptLocke";
import { Separator } from "./ui/Separator";

const exploreLinks = [
  { label: "About", href: "/" },
  { label: "Changelog", href: "/releases" },
];

const communityLinks = [
  { label: "X", href: "https://x.com/kostyafarber_" },
  { label: "GitHub", href: "https://github.com/shift-editor/shift" },
  { label: "Discord", href: "https://discord.gg/582FxBdNH7" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/kostyafarber/" },
];

export default function SiteFooter({
  previewState,
}: {
  previewState?: UpdatesSignupPreviewState;
} = {}) {
  const updatesEnabled =
    process.env.UPDATES_SIGNUP_ENABLED === "true" &&
    Boolean(
      process.env.RESEND_API_KEY &&
        process.env.TURNSTILE_SECRET_KEY &&
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    );

  return (
    <footer className="mt-20 font-ui">
      <Separator />
      <div className="px-6 pt-8 pb-4 sm:px-8 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 lg:min-h-48 lg:grid-cols-[16rem_7rem_7rem_minmax(2rem,1fr)_minmax(18rem,24rem)] lg:grid-rows-[1fr_auto] lg:gap-x-6 lg:gap-y-0">
          <div className="order-1 col-span-2 flex items-center self-start lg:order-none lg:col-span-1 lg:col-start-1 lg:row-start-1">
            <Image
              src="/shift-logo-lettering.svg"
              alt="Shift"
              width={694}
              height={233}
              unoptimized
              className="h-auto w-[62px]"
            />
          </div>

          <div className="order-4 col-span-2 -mb-6 self-end text-primary lg:order-none lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:mb-0 lg:pb-6">
            <CaptLocke />
          </div>

          <nav
            aria-label="Community"
            className="order-3 lg:order-none lg:col-start-2 lg:row-start-1"
          >
            <h2 className="mb-4 text-sm font-semibold">Community</h2>
            <ul className="space-y-3 text-xs text-secondary">
              {communityLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-label="Explore"
            className="order-3 lg:order-none lg:col-start-3 lg:row-start-1"
          >
            <h2 className="mb-4 text-sm font-semibold">Explore</h2>
            <ul className="space-y-3 text-xs text-secondary">
              {exploreLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section
            aria-labelledby="footer-updates-heading"
            className="order-2 col-span-2 w-full max-w-sm lg:order-none lg:col-span-1 lg:col-start-5 lg:row-span-2 lg:row-start-1 lg:justify-self-end"
          >
            <h2 id="footer-updates-heading" className="text-sm font-semibold">
              Updates
            </h2>
            <p className="mt-2 mb-10 max-w-xs text-xs leading-relaxed text-secondary">
              Stay up to date with Shift announcements and development notes.
            </p>
            <UpdatesSignupForm
              enabled={updatesEnabled}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
              previewState={previewState}
            />
          </section>

          <div className="order-5 col-span-2 lg:order-none lg:col-span-1 lg:col-start-1 lg:row-start-2">
            <p className="mb-1 text-xs text-secondary">
              The craft of type, open to everyone.
            </p>
            <p className="text-xs tracking-tight">
              <span className="font-semibold">Kostya Farber</span> ©{" "}
              {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
