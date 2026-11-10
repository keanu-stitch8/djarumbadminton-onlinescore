import type { AnchorHTMLAttributes } from "react";
import { assetUrl } from "./asset-url";

// Stand-in for next/link in the static build: a plain <a>.
export default function Link({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return <a href={assetUrl(href)} {...rest} />;
}
