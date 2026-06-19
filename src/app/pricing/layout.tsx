import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Affordable website plans from $2/month. Turn your Google Business profile into a live website instantly. No coding required.",
  openGraph: {
    title: "Pricing | syrflow.com",
    description: "Affordable website plans from $2/month. Turn your Google Business profile into a live website instantly.",
    url: "https://syrflow.com/pricing",
    type: "website",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
