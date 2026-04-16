'use client';

import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Links row */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
          <a href="#features" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Features</a>
          <a href="#pricing" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Pricing</a>
          <a href="#faq" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">FAQ</a>
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Terms and Conditions</Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Privacy Policy</Link>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col items-center gap-4">
          <img src="/logo-dark.png" alt="Shadow Persuasion" className="w-28" />
          <p className="text-xs text-gray-600 text-center">
            Copyright &copy; {new Date().getFullYear()} Shadow Persuasion. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
