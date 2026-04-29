import Link from "next/link";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Privacy Policy — ahna.ae" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 28, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">

          <Section title="1. Introduction">
            <p><strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), the operator of <strong className="text-foreground">ahna.ae</strong> ("we", "us", "our"), is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding it. By using our Service, you agree to the collection and use of information in accordance with this policy.</p>
          </Section>

          <Section title="2. Data We Collect">
            <p>We collect the following categories of personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-foreground">Account data:</strong> Email address and password (hashed) when you register.</li>
              <li><strong className="text-foreground">Business data:</strong> Business name, address, phone number, opening hours, photos, and other information you import from Google Business Profile or enter manually.</li>
              <li><strong className="text-foreground">Usage data:</strong> Log files, IP addresses, browser type, pages visited, and timestamps for security and analytics purposes.</li>
              <li><strong className="text-foreground">Payment data:</strong> Payment processing is handled entirely by Paddle. We do not store credit card numbers or full payment details on our servers.</li>
            </ul>
          </Section>

          <Section title="3. Payment Processing by Paddle">
            <p>All subscription payments are processed by <strong className="text-foreground">Paddle.com Market Limited</strong>, which acts as the Merchant of Record. When you make a purchase, Paddle collects and processes your payment details, billing address, and transaction information in accordance with <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Paddle's Privacy Policy</a>. We share your email address with Paddle for the purpose of payment processing and fraud prevention.</p>
          </Section>

          <Section title="4. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To create and maintain your account and business page.</li>
              <li>To process subscriptions and billing (via Paddle).</li>
              <li>To send transactional emails (account confirmation, invoices, service updates).</li>
              <li>To monitor and improve the security and performance of the Service.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Third Parties">
            <p>We do not sell your personal data. We share data only with:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-foreground">Paddle</strong> — for payment processing and tax compliance.</li>
              <li><strong className="text-foreground">Supabase</strong> — our database and authentication provider, hosted on secure cloud infrastructure.</li>
              <li><strong className="text-foreground">Legal authorities</strong> — when required by law or to protect our rights.</li>
            </ul>
          </Section>

          <Section title="6. Cookies">
            <p>We use strictly necessary cookies to maintain your session and authentication state. We do not use advertising or tracking cookies. You can control cookies through your browser settings.</p>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain your account and business data for as long as your account is active or as needed to provide the Service. If you delete your account, we will delete your personal data within 30 days, except where we are required by law to retain it longer.</p>
          </Section>

          <Section title="8. Security">
            <p>We implement industry-standard security measures including encrypted connections (HTTPS), hashed passwords, and access controls. However, no method of transmission over the internet is 100% secure.</p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your location, you may have the following rights regarding your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
              <li><strong className="text-foreground">Correction</strong> — request correction of inaccurate data.</li>
              <li><strong className="text-foreground">Deletion</strong> — request deletion of your data ("right to be forgotten").</li>
              <li><strong className="text-foreground">Portability</strong> — request your data in a machine-readable format.</li>
              <li><strong className="text-foreground">Objection</strong> — object to processing based on legitimate interests.</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, email us at <a href="mailto:privacy@ahna.ae" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@ahna.ae</a>. We will respond within 30 days.</p>
          </Section>

          <Section title="10. International Data Transfers">
            <p>Your data may be processed and stored in countries outside your own. Where required, we implement appropriate safeguards such as Standard Contractual Clauses to ensure your data is protected.</p>
          </Section>

          <Section title="11. Children">
            <p>The Service is not directed at children under 18. We do not knowingly collect personal data from minors. If you believe a minor has provided us with personal data, please contact us and we will delete it promptly.</p>
          </Section>

          <Section title="12. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. We will notify you of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance.</p>
          </Section>

          <Section title="13. Contact">
            <p>For privacy-related questions or requests, contact our Data Controller at <a href="mailto:privacy@ahna.ae" className="text-indigo-600 dark:text-indigo-400 hover:underline">privacy@ahna.ae</a>. The Platform is operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), United Arab Emirates.</p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
