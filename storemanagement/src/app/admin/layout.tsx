import Script from "next/script";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#f7fbf9",
      }}
    >
      <Script
        src="https://cdn.tailwindcss.com?plugins=forms,container-queries"
        strategy="afterInteractive"
      />

      {children}
    </div>
  );
}
