import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "syrflow.com's privacy policy — how we collect, use, and protect your personal data.",
  openGraph: {
    title: "Privacy Policy | syrflow.com",
    description: "syrflow.com's privacy policy — how we collect, use, and protect your personal data.",
    url: "https://syrflow.com/privacy-policy",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
