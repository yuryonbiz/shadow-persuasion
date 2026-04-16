import Link from 'next/link';

export const metadata = {
  title: 'Terms and Conditions — Shadow Persuasion',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-300">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-[#D4A017] hover:underline mb-8 inline-block">&larr; Back to Home</Link>

        <h1 className="text-3xl font-bold font-mono uppercase tracking-wider text-white mb-2">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: April 16, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Shadow Persuasion ("the Service"), operated at shadowpersuasion.com, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>Shadow Persuasion is an AI-powered educational platform that provides training in communication psychology, influence techniques, and strategic conversation skills. The Service includes conversation analysis, AI coaching, scenario-based training, and technique libraries.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Eligibility</h2>
            <p>You must be at least 18 years of age to use the Service. By creating an account, you represent and warrant that you meet this age requirement.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Account Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Acceptable Use</h2>
            <p className="mb-2">You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree NOT to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Use the Service to harm, harass, stalk, threaten, or defraud others</li>
              <li>Use techniques learned through the Service for illegal activities, coercion, or manipulation that causes harm</li>
              <li>Upload content that is illegal, abusive, or violates the rights of others</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or data</li>
              <li>Use the Service in any way that could disable, overburden, or impair its functionality</li>
              <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Ethical Use Disclaimer</h2>
            <p>Shadow Persuasion provides educational content about communication psychology and influence. This content is intended for self-improvement, professional development, and defensive awareness. We strongly discourage the use of these techniques for deception, coercion, or any activity that causes harm to others. You are solely responsible for how you apply what you learn.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Intellectual Property</h2>
            <p>All content, features, and functionality of the Service — including text, graphics, logos, and software — are owned by Shadow Persuasion or its licensors and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from any part of the Service without our prior written consent.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. AI-Generated Content</h2>
            <p>The Service uses artificial intelligence to generate analyses, coaching advice, and training scenarios. AI-generated content is provided for educational and informational purposes only. It should not be considered professional psychological, legal, or medical advice. We do not guarantee the accuracy, completeness, or appropriateness of AI-generated responses.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Subscription and Payments</h2>
            <p>Certain features of the Service may require a paid subscription. Payment terms, pricing, and billing cycles will be presented to you at the time of purchase. All fees are non-refundable except as required by applicable law or as explicitly stated in our refund policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Shadow Persuasion and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not warrant that the Service will be uninterrupted, error-free, or that any results obtained from using the Service will be accurate or reliable.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we determine violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the Service will immediately cease.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">13. Changes to Terms</h2>
            <p>We may revise these Terms at any time by updating this page. Your continued use of the Service after changes are posted constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">14. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to conflict of law principles.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">15. Contact Us</h2>
            <p>If you have questions about these Terms, please contact us at: <a href="mailto:yury@onbiz.com" className="text-[#D4A017] hover:underline">yury@onbiz.com</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
