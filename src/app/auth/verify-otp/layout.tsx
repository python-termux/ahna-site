import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Code",
};

export default function VerifyOtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
