const ROOT_URL =
  process.env.NODE_ENV === "production"
    ? `${process.env.NEXT_PUBLIC_ROOT_URL}`
    : "http://localhost:3000";

export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  miniapp: {
    version: "1",
    name: "Miniapp Name",
    subtitle: "Miniapp subtitle",
    description: "Miniapp Description",
    screenshotUrls: [`${ROOT_URL}/image.png`],
    iconUrl: `${ROOT_URL}/image.png`,
    splashImageUrl: `${ROOT_URL}/image.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["marketing", "ads", "quickstart"],
    heroImageUrl: `${ROOT_URL}/image.png`,
    tagline: "your tagline here",
    ogTitle: "Miniapp Name",
    ogDescription: "Miniapp Description",
    ogImageUrl: `${ROOT_URL}/image.png`,
  },
} as const;
