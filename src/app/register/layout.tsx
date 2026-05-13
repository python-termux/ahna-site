import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Your Business Website",
  description: "Register on syrflow.com and go live in minutes. Turn your Google Business profile into a professional website. No coding required.",
  openGraph: {
    title: "Create Your Business Website | syrflow.com",
    description: "Register on syrflow.com and go live in minutes. No coding required.",
    url: "https://syrflow.com/register",
    type: "website",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
