import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy",
  description: "syrflow.com's refund policy. Full refund if your website gets fewer than 100 visitors in the first 7 days.",
  openGraph: {
    title: "Refund Policy | syrflow.com",
    description: "syrflow.com's refund policy. Full refund if your website gets fewer than 100 visitors in the first 7 days.",
    url: "https://syrflow.com/refund",
    type: "website",
  },
};

export default function RefundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
