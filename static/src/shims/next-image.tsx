import type { ImgHTMLAttributes } from "react";
import { assetUrl } from "./asset-url";

// Stand-in for next/image in the static build: a plain <img> with the same props the shared
// components use. Images are served as-is (no Next.js optimizer exists on a static host).
type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string; priority?: boolean; unoptimized?: boolean };

export default function Image({ src, priority, unoptimized: _unoptimized, alt, ...rest }: Props) {
  return <img src={assetUrl(src)} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" {...rest} />;
}
