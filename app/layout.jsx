import "./globals.css";

export const metadata = {
  title: "ContextCard",
  description: "Know anyone before you meet them"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
