import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "拼豆图纸工坊";
const description = "上传图片，一键生成可调行列、带参考色号和用量清单的拼豆图纸。";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") ?? "https";
  const metadataBase = host
    ? new URL(`${protocol}://${host}`)
    : new URL("https://bead-pattern-studio.local");

  return {
    title,
    description,
    metadataBase,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "拼豆图纸工坊的图纸预览和色号清单",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
