import DiscordIcon from "../assets/discord.svg";
import GithubIcon from "../assets/github.svg";
import LinkedinIcon from "../assets/linkedin.svg";
import XIcon from "../assets/x.svg";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/shift-editor/shift",
    icon: GithubIcon,
  },
  {
    label: "Discord",
    href: "https://discord.gg/582FxBdNH7",
    icon: DiscordIcon,
  },
  {
    label: "X",
    href: "https://x.com/kostyafarber_",
    icon: XIcon,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kostyafarber/",
    icon: LinkedinIcon,
  },
];

export default function SiteFooter() {
  return (
    <footer className="mt-20 px-6 pb-8 font-ui sm:px-12 lg:px-24">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <p className="tracking-tight text-xs">
          <span className="font-semibold">Kostya Farber</span> © {new Date().getFullYear()}
        </p>

        <nav aria-label="Social links">
          <ul className="flex items-center gap-5">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="block transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
