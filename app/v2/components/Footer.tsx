'use client';

export default function Footer() {
  return (
    <footer className="border-t-2 border-[#1A2E1A] py-8 text-center text-xs text-gray-500">
      <p className="font-mono uppercase tracking-widest">
        Shadow Persuasion // EST. 2026 // All Rights Reserved
      </p>
      <div className="mt-4 flex justify-center space-x-4">
        <a href="#" className="hover:text-[#FF8C00]">
          [System Policy]
        </a>
        <a href="#" className="hover:text-[#FF8C00]">
          [Contact Intel]
        </a>
        <a href="#" className="hover:text-[#FF8C00]">
          [Secure Login]
        </a>
      </div>
    </footer>
  );
}
