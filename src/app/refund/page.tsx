import Link from "next/link";
import Footer from "@/components/Footer";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Refund Policy — ahna.ae" };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      <div className="text-muted-foreground space-y-2">{children}</div>
    </section>
  );
}

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 w-full">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-12">Last updated: April 28, 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">

          <Section title="Overview">
            <p>This Refund Policy applies to subscriptions for the <strong className="text-foreground">ahna.ae</strong> platform, operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>). All payments are processed by <strong className="text-foreground">Paddle.com Market Limited</strong>, which acts as the Merchant of Record. Refund requests are subject to the terms below and to <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">Paddle's Buyer Terms</a>.</p>
          </Section>

          <Section title="14-Day Cooling-Off Period (EU & EEA Customers)">
            <p>If you are located in the European Union or European Economic Area, you have the right to withdraw from your subscription within <strong className="text-foreground">14 days</strong> of the date of your first payment, without giving any reason, provided that you have not used the Service during this period.</p>
            <p>To exercise this right, contact us at <a href="mailto:support@ahna.ae" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@ahna.ae</a> within 14 days of your purchase with the subject line "Refund Request". We will process your refund within 14 business days.</p>
            <p>Please note: if you access or use the Service (e.g. publish your business page) during the cooling-off period, you expressly waive your right to the statutory withdrawal period.</p>
          </Section>

          <Section title="General Refund Policy">
            <p>Outside of the statutory EU cooling-off period, we consider refund requests on a case-by-case basis. We may issue a refund at our sole discretion in the following situations:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>A technical error on our side prevented you from using the Service.</li>
              <li>You were charged twice for the same subscription period.</li>
              <li>The Service was completely unavailable for an extended period due to our fault.</li>
            </ul>
          </Section>

          <Section title="Non-Refundable Situations">
            <p>We generally do not issue refunds in the following cases:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>You forgot to cancel before your renewal date.</li>
              <li>You no longer need or wish to use the Service.</li>
              <li>You have used the Service during the billing period.</li>
              <li>Your account was suspended or terminated due to a violation of our <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">Terms of Service</Link>.</li>
              <li>Partial months or unused portions of a subscription period.</li>
            </ul>
          </Section>

          <Section title="Annual Subscriptions">
            <p>Annual subscriptions are non-refundable after the 14-day cooling-off period (for EU customers) or after 7 days of purchase (for all other customers) unless a technical fault on our side prevented service delivery.</p>
          </Section>

          <Section title="How to Request a Refund">
            <p>To request a refund, email <a href="mailto:support@ahna.ae" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@ahna.ae</a> with:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Your account email address.</li>
              <li>The date of purchase.</li>
              <li>Your Paddle order ID (found in your payment confirmation email).</li>
              <li>The reason for your refund request.</li>
            </ul>
            <p>We will respond within 3 business days. Approved refunds are processed by Paddle and typically appear within 5–10 business days depending on your bank.</p>
          </Section>

          <Section title="Contact">
            <p>For refund enquiries, contact us at <a href="mailto:support@ahna.ae" className="text-indigo-600 dark:text-indigo-400 hover:underline">support@ahna.ae</a>. We aim to respond within 3 business days. The Platform is operated by <strong className="text-foreground">Osaad</strong> (also trading as <strong className="text-foreground">Osaad.tech</strong>), United Arab Emirates.</p>
          </Section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
