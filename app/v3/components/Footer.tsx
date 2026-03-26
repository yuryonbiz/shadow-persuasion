"use client";

const Footer = () => {
  return (
    <footer className="bg-bone-light border-t border-steel-gray">
      <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm text-steel-gray-light">
            <p className="font-libre-baskerville">&copy; 2026 Shadow Persuasion. All rights reserved.</p>
            <p className="font-mono mt-1">ISSN: 2026-XXXX</p>
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#methodology" className="text-navy hover:text-clinical-red transition-colors duration-300">Research</a>
            <a href="#case-studies" className="text-navy hover:text-clinical-red transition-colors duration-300">Case Studies</a>
            <a href="#team" className="text-navy hover:text-clinical-red transition-colors duration-300">Team</a>
            <a href="#" className="text-navy hover:text-clinical-red transition-colors duration-300">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
