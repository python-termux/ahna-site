import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Read syrflow.com's terms of service for using our platform. Learn about your rights and responsibilities.",
  openGraph: {
    title: "Terms of Service | syrflow.com",
    description: "Read syrflow.com's terms of service for using our platform.",
    url: "https://syrflow.com/terms",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
