'use client';

const FooterColumn = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
  <div>
    <h4 className="font-mono text-xs uppercase tracking-widest text-[#D4A017] mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors duration-200">
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-[#0D0D0D] border-t border-white/10 w-full">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        {/* Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <FooterColumn
            title="Product"
            links={[
              { label: 'Features', href: '#features' },
              { label: 'Live Demo', href: '#demo' },
              { label: 'Pricing', href: '#pricing' },
              { label: 'Changelog', href: '#' },
            ]}
          />
          <FooterColumn
            title="Company"
            links={[
              { label: 'About', href: '#' },
              { label: 'Contact', href: '#' },
              { label: 'Careers', href: '#' },
            ]}
          />
          <FooterColumn
            title="Legal"
            links={[
              { label: 'Terms of Service', href: '/terms' },
              { label: 'Privacy Policy', href: '/privacy' },
              { label: 'Acceptable Use', href: '#' },
            ]}
          />
          <FooterColumn
            title="Support"
            links={[
              { label: 'FAQ', href: '#faq' },
              { label: 'Contact Support', href: '#' },
              { label: 'Documentation', href: '#' },
            ]}
          />
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6 mb-10">
          {['X', 'IG', 'YT', 'TG'].map((platform) => (
            <a
              key={platform}
              href="#"
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-xs font-mono text-gray-500 hover:border-[#D4A017] hover:text-[#D4A017] transition-colors duration-200"
            >
              {platform}
            </a>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <img src="/logo-dark.png" alt="Shadow Persuasion" className="w-28" />
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} Shadow Persuasion. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
