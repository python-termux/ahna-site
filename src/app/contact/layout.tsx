import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the syrflow.com team. Email us at team@syrflow.com for support and inquiries.",
  openGraph: {
    title: "Contact Us | syrflow.com",
    description: "Get in touch with the syrflow.com team. Email us at team@syrflow.com for support and inquiries.",
    url: "https://syrflow.com/contact",
    type: "website",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
