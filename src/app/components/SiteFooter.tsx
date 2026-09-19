import Image from "next/image";
import Link from "next/link";
import type { UpdatesSignupPreviewState } from "@/lib/updates-types";
import UpdatesSignupForm from "./UpdatesSignupForm";
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
      <div className="px-6 pt-10 pb-4 sm:px-8 lg:px-8">
        <div className="grid gap-14 lg:min-h-56 lg:grid-cols-3 lg:gap-8">
          <div className="flex flex-col justify-between gap-12">
            <div className="flex gap-16 sm:gap-20">
              <nav aria-label="Community">
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

              <nav aria-label="Explore">
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
            </div>

            <div>
              <p className="mb-1 text-xs text-secondary">
                The craft of type, open to everyone.
              </p>
              <p className="text-xs tracking-tight">
                <span className="font-semibold">Kostya Farber</span> ©{" "}
                {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center lg:self-center">
            <Image
              src="/footer-art.svg"
              alt=""
              width={600}
              height={607}
              unoptimized
              className="h-auto w-32"
            />
            <Image
              src="/shift-logo-lettering.svg"
              alt="Shift"
              width={694}
              height={233}
              unoptimized
              className="mt-2 h-auto w-14"
            />
          </div>

          <section
            aria-labelledby="footer-updates-heading"
            className="w-full max-w-sm lg:justify-self-end"
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
        </div>
      </div>
    </footer>
  );
}
