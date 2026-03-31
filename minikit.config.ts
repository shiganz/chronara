const ROOT_URL = "https://chronara-three.vercel.app";

export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjIzNzk2NzMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHhCM0M5OEU5RWY0M2Y3ODJEZWIwOTVjMGM1NTcyRjZCNjQ4QzZENDExIn0",
    payload: "eyJkb21haW4iOiJjaHJvbmFyYS10aHJlZS52ZXJjZWwuYXBwIn0",
    signature: "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEErPfCBZ0GRNIfJBDVNyvGJUjVKnu1Ruj0Wg0pJ-hm_0EushR3MHPMy5r8DJOzjh-7_oDIPjUuZB_RZ0lfUTda6GwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
  },
  miniapp: {
    version: "1",
    name: "Chonara",
    subtitle: "Endless run!",
    description: "Escape through collapsing timelines",
    screenshotUrls: ["https://chronara-three.vercel.app/image.png"],
    iconUrl: "https://chronara-three.vercel.app/image.png",
    splashImageUrl: "https://chronara-three.vercel.app/image.png",
    splashBackgroundColor: "#e78636",
    homeUrl: ROOT_URL,
    webhookUrl: "https://chronara-three.vercel.app/api/webhook",
    primaryCategory: "games",
    tags: ["adventure", "game", "miniapp"],
    heroImageUrl: "https://chronara-three.vercel.app/image.png",
    tagline: "Play Endlessly!",
    ogTitle: "Chonara",
    ogDescription: "Escape through collapsing timelines",
    ogImageUrl: "https://chronara-three.vercel.app/image.png",
    "noindex": true

  },
} as const;
