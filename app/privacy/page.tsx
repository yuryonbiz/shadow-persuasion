import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — Shadow Persuasion',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#D4A017] hover:underline mb-8 inline-block">&larr; Back to Home</Link>

        <h1 className="text-3xl font-bold font-mono uppercase tracking-wider text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 16, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Introduction</h2>
            <p>Shadow Persuasion ("we," "our," or "us") operates the website shadowpersuasion.com and the associated web application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Information We Collect</h2>
            <p className="mb-2"><strong className="text-white">Account Information:</strong> When you create an account, we collect your email address and authentication credentials via Firebase Authentication. We may also collect your display name if you provide one.</p>
            <p className="mb-2"><strong className="text-white">Usage Data:</strong> We collect information about how you interact with our service, including conversation analyses, training session data, technique practice results, and mission completions. This data is stored in our database and associated with your account.</p>
            <p className="mb-2"><strong className="text-white">User-Generated Content:</strong> Any text, messages, or conversation excerpts you submit for analysis are processed by our AI systems and may be stored in our database to provide you with a persistent experience.</p>
            <p><strong className="text-white">Automatically Collected Data:</strong> We may collect standard technical information such as your browser type, device type, and general location (country/region) through standard web server logs and analytics.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide, maintain, and improve our service</li>
              <li>To process your conversation analyses and generate AI-powered insights</li>
              <li>To track your learning progress, scores, and technique mastery</li>
              <li>To personalize your experience and provide recommendations</li>
              <li>To communicate with you about your account or service updates</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services to operate our platform:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong className="text-white">Firebase (Google):</strong> For user authentication</li>
              <li><strong className="text-white">Supabase:</strong> For database storage and backend services</li>
              <li><strong className="text-white">OpenRouter / AI Providers:</strong> For AI-powered analysis and coaching features. Conversation text you submit may be sent to AI model providers for processing.</li>
              <li><strong className="text-white">Vercel:</strong> For hosting and serving the application</li>
            </ul>
            <p className="mt-2">Each of these services has its own privacy policy governing how they handle data.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Data Retention</h2>
            <p>We retain your account data and usage history for as long as your account is active. You may request deletion of your account and associated data at any time by contacting us. Upon account deletion, we will remove your personal data from our systems within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect your personal information. All data is transmitted over encrypted connections (HTTPS). However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Your Rights</h2>
            <p className="mb-2">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Request portability of your data</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, please contact us at the email address below.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Children&apos;s Privacy</h2>
            <p>Our service is not intended for individuals under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page with an updated "Last updated" date.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at: <a href="mailto:yury@onbiz.com" className="text-[#D4A017] hover:underline">yury@onbiz.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
