import Link from "next/link";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Terms of Service — ahna.ae" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 28, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">

          <Section title="1. Agreement to Terms">
            <p>These Terms of Service ("Terms") govern your access to and use of the platform at <strong className="text-foreground">ahna.ae</strong> ("Platform", "Service", "we", "us", "our"), operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>). By creating an account or using the Platform you agree to be bound by these Terms. If you do not agree, do not use the Platform.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>ahna.ae is a SaaS platform operated by Osaad that allows businesses to create a professional one-page website by importing data from their Google Business Profile. The Service is offered on a subscription basis.</p>
          </Section>

          <Section title="3. Subscriptions and Billing">
            <p>The Service is offered on a recurring subscription basis. By subscribing, you authorise us to charge your payment method on a recurring basis at the frequency selected at checkout (monthly or annually).</p>
            <p>Payments are processed by <strong className="text-foreground">Paddle.com Market Limited</strong> ("Paddle"), which acts as the Merchant of Record for all transactions. By completing a purchase you also agree to <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">Paddle's Buyer Terms</a>. Paddle is responsible for collecting and remitting applicable taxes.</p>
            <p>All prices are listed in USD unless otherwise stated. Subscription fees are charged at the start of each billing period.</p>
          </Section>

          <Section title="4. Free Trial">
            <p>If a free trial is offered, it will be stated clearly at sign-up. At the end of the trial period, your subscription automatically converts to a paid plan unless cancelled before the trial ends.</p>
          </Section>

          <Section title="5. Cancellation">
            <p>You may cancel your subscription at any time from your account dashboard or by emailing <a href="mailto:support@ahna.ae" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">support@ahna.ae</a>. Cancellation takes effect at the end of the current billing period. You retain access to the Service until then.</p>
          </Section>

          <Section title="6. Refunds">
            <p>Please see our <Link href="/refund" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">Refund Policy</Link> for full details. Customers in the European Union are entitled to a 14-day statutory cooling-off period from the date of first purchase, provided the Service has not been used.</p>
          </Section>

          <Section title="7. User Accounts">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your login credentials.</li>
              <li>You must be at least 18 years old or the age of majority in your jurisdiction.</li>
              <li>You may not share accounts or create multiple accounts for the same business.</li>
            </ul>
          </Section>

          <Section title="8. Acceptable Use">
            <p>You agree not to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Publish false, misleading, or fraudulent business information.</li>
              <li>Infringe the intellectual property rights of third parties.</li>
              <li>Distribute spam, malware, or harmful content.</li>
              <li>Attempt unauthorised access to any systems or networks.</li>
              <li>Violate any applicable laws or regulations.</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <p>You retain ownership of all content you submit. By submitting content, you grant ahna.ae a non-exclusive, royalty-free licence to host, display, and deliver that content solely to operate the Service. ahna.ae retains all rights to its platform, software, design, and branding.</p>
          </Section>

          <Section title="10. Disclaimers">
            <p>The Service is provided "as is" and "as available" without warranty of any kind. We do not guarantee uninterrupted or error-free operation. Business data imported from Google Maps is for convenience — you are responsible for verifying its accuracy.</p>
          </Section>

          <Section title="11. Limitation of Liability">
            <p>To the maximum extent permitted by applicable law, ahna.ae shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenue arising from your use of the Service.</p>
          </Section>

          <Section title="12. Termination">
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, fraudulent activity, or non-payment. Upon termination, your right to use the Service ceases immediately.</p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>We may update these Terms periodically. We will notify you of material changes by email or by posting a notice on the Service. Continued use after changes constitutes acceptance.</p>
          </Section>

          <Section title="14. Governing Law">
            <p>These Terms are governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of the UAE.</p>
          </Section>

          <Section title="15. Contact">
            <p>For questions about these Terms, contact us at <a href="mailto:support@ahna.ae" className="text-[#0066cc] dark:text-[#2997ff] hover:underline">support@ahna.ae</a>. The Platform is operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), United Arab Emirates.</p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
