export const metadata = {
  title: "Quick Heal",
  description: "Professional web app built by Sourav",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
