import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Data Deletion — ahna.ae",
  description: "How to request deletion of your data from ahna.ae",
};

export default function DataDeletionPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; code?: string }>;
}) {
  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <section className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Data Deletion Request</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Last updated: {new Date().toLocaleDateString("en-AE", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-6 text-sm text-foreground leading-relaxed">
          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">What data we store</h2>
            <p className="text-muted-foreground">
              When you connect your Facebook page, ahna.ae only reads your page&apos;s public
              information (name, contact details, photos, reviews) to build your business website.
              We do not store your Facebook credentials, personal messages, or private data.
            </p>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">How to delete your data</h2>
            <p className="text-muted-foreground mb-4">
              To delete all your data from ahna.ae, you have two options:
            </p>
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
              <li>
                <strong className="text-foreground">From your dashboard:</strong> Log in to ahna.ae,
                go to your dashboard, open the menu and click &quot;Delete account&quot;. This removes all
                your business data and account immediately.
              </li>
              <li>
                <strong className="text-foreground">Via email:</strong> Send a deletion request to{" "}
                <a href="mailto:support@ahna.ae" className="underline" style={{ color: "#0066cc" }}>
                  support@ahna.ae
                </a>{" "}
                with the subject &quot;Data Deletion Request&quot; and your registered email address. We
                will process it within 30 days.
              </li>
            </ol>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">Facebook-specific removal</h2>
            <p className="text-muted-foreground">
              To remove ahna.ae&apos;s access to your Facebook pages at any time, go to your{" "}
              <a
                href="https://www.facebook.com/settings?tab=applications"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
                style={{ color: "#0066cc" }}
              >
                Facebook App Settings
              </a>{" "}
              and remove ahna.ae from the list. This immediately revokes our access to your pages.
            </p>
          </div>

          <div className="bg-card border border-border rounded-[8px] p-5">
            <h2 className="font-semibold text-base mb-2">Contact</h2>
            <p className="text-muted-foreground">
              For any data-related questions, email us at{" "}
              <a href="mailto:support@ahna.ae" className="underline" style={{ color: "#0066cc" }}>
                support@ahna.ae
              </a>
              .
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-10 text-xs text-muted-foreground">
          <Link href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
