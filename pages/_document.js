import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* ── Character encoding ── */}
        <meta charSet="utf-8" />

        {/* ── Favicon + App Icons ──────────────────────────────────────
            Place these files in /public/:
            • favicon.ico          — classic browser tab icon
            • favicon-16x16.png    — small tab icon
            • favicon-32x32.png    — standard tab icon
            • apple-touch-icon.png — iOS home screen icon (180×180px)
            • icon-192.png         — Android home screen (192×192px)
            • icon-512.png         — Android splash screen (512×512px)
            • site.webmanifest     — PWA manifest file
        ────────────────────────────────────────────────────────────── */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ── Theme color (browser UI on mobile) ── */}
        <meta name="theme-color" content="#8B1A1A" />
        <meta name="msapplication-TileColor" content="#8B1A1A" />

        {/* ── Fonts — preconnect first for speed ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Cabinet+Grotesk:wght@300;400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}