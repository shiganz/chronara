import type { Metadata } from "next";
import "./globals.css";
import { minikitConfig } from "../../minikit.config";

export async function generateMetadata(): Promise<Metadata> {
  const appName = minikitConfig.miniapp.name;

  return {
    title: appName,
    description: minikitConfig.miniapp.description,
    other: {
      "base:app_id": process.env.NEXT_PUBLIC_BASE_APP_ID || "",
      "fc:miniapp": JSON.stringify({
        version: "next",
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${appName}`,
          action: {
            type: "launch_miniapp",
            name: appName,
            url: minikitConfig.miniapp.homeUrl,
            splashImageUrl: minikitConfig.miniapp.splashImageUrl,
            splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
