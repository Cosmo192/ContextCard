import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "ContextCard",
  description: "Know anyone before you meet them"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
