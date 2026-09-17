import type { HTMLAttributes } from "react";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level: HeadingLevel;
};

export function Heading({ level, ...props }: HeadingProps) {
  switch (level) {
    case 1:
      return <h1 {...props} />;
    case 2:
      return <h2 {...props} />;
    case 3:
      return <h3 {...props} />;
    case 4:
      return <h4 {...props} />;
    case 5:
      return <h5 {...props} />;
    case 6:
      return <h6 {...props} />;
  }
}

export function nextHeadingLevel(level: HeadingLevel): HeadingLevel {
  return Math.min(level + 1, 6) as HeadingLevel;
}
