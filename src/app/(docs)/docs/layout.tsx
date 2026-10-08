import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { RootProvider } from "fumadocs-ui/provider/next";
import Image from "next/image";
import { docsSource } from "@/lib/docs-source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <RootProvider theme={{ enabled: false }}>
      <div className="docs-shell font-ui">
        <DocsLayout
          tree={docsSource.getPageTree()}
          nav={{
            url: "/docs",
            title: (
              <>
                <Image
                  src="/shift-logo-lettering.svg"
                  alt="Shift"
                  width={694}
                  height={233}
                  unoptimized
                  className="block h-auto w-[42px]"
                />
                <span className="text-sm font-medium text-muted">Docs</span>
              </>
            ),
          }}
          links={[
            { text: "About", url: "/" },
            { text: "Changelog", url: "/releases", active: "nested-url" },
            { text: "Download", url: "/downloads", active: "nested-url" },
          ]}
          githubUrl="https://github.com/shift-editor/shift"
          themeSwitch={{ enabled: false }}
        >
          {children}
        </DocsLayout>
      </div>
    </RootProvider>
  );
}
