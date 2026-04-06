'use client';

const Redacted = ({ children }) => <span className="bg-black text-black inline-block px-1">{children}</span>;

const Statement = ({ codename, date, children, name }) => (
  <div className="border-t-2 border-b-2 border-gray-400 py-8 relative">
    <h3 className="font-bold text-lg mb-4">STATEMENT OF [{codename}] — TAKEN {date}</h3>
    <div className="pl-8 text-lg leading-relaxed space-y-4">
      {children}
    </div>
    <div className="mt-8 pl-8">
      <p>Signature: <span className="font-mono">_______________</span></p>
      <p className="text-sm">{name}</p>
    </div>
    <div className="absolute bottom-4 right-4 text-red-700 text-xl font-bold border-2 border-red-700 p-2 transform -rotate-6 opacity-70">
      SWORN AND ATTESTED
    </div>
  </div>
);

const Statements = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold uppercase tracking-wider mb-12 text-center">Sworn Statements</h2>
      <div className="space-y-16">
        <Statement codename="VIPER" date="██/██/2026" name="[REDACTED]">
          <p>"I used to see conversations as a two-way street. Shadow Persuasion revealed it's a chessboard, and I was playing checkers. My close rate in high-ticket sales went from 20% to over 80% in three months. It's not about what you say, it's about creating a reality where your outcome is the only logical conclusion. The AI doesn't just give you lines; it teaches you how to <Redacted>control the frame</Redacted> from the first word."</p>
        </Statement>
        <Statement codename="ECHO" date="██/██/2026" name="[REDACTED]">
          <p>"The Visual Intelligence Module is terrifyingly effective. I uploaded a photo from a fundraising dinner, and the analysis of the board members' body language gave me the leverage I needed to secure a seven-figure donation. It pointed out a <Redacted>micro-expression of contempt</Redacted> between two directors, which I exploited to create a private alliance. This feels like a superpower."</p>
        </Statement>
        <Statement codename="SPECTRE" date="██/██/2026" name="[REDACTED]">
          <p>"I deal with corporate acquisitions. My job is to find the breaking point. Before this, it was intuition and expensive research. Now, it's a science. The profiling unit gave me a full psychological workup of a target CEO from a few of his public interviews. It identified a deep-seated <Redacted>fear of irrelevance</Redacted>. I structured my entire offer around that, and they accepted a bid 30% lower than their board's initial asking price. It's an unfair advantage, and I love it."</p>
        </Statement>
      </div>
    </section>
  );
};

export default Statements;
