import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Deletion",
  description: "Request deletion of your syrflow.com account and all associated data.",
  robots: { index: false, follow: false },
};

export default function DataDeletionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
