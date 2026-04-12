'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './homepage-components/CoverPage';
import ExecutiveSummary from './homepage-components/ExecutiveSummary';
import HowItWorks from './homepage-components/HowItWorks';
import { SystemCapabilities } from './homepage-components/SystemCapabilities';
import AppPreview from './homepage-components/AppPreview';
import { SystemPreview } from './homepage-components/SystemPreview';
import LiveAnalysisDemo from './homepage-components/LiveAnalysisDemo';
import ConversationBreakdown from './homepage-components/ConversationBreakdown';
import ScenarioSimulator from './homepage-components/ScenarioSimulator';
import { OperationalModules } from './homepage-components/OperationalModules';
import Evidence from './homepage-components/Evidence';
import ProgressionPath from './homepage-components/ProgressionPath';
import DarkPatternRolodex from './homepage-components/DarkPatternRolodex';
import Statements from './homepage-components/Statements';
import ClassifiedComparison from './homepage-components/ClassifiedComparison';
import FAQ from './homepage-components/FAQ';
import AccessRequest from './homepage-components/AccessRequest';
import Footer from './homepage-components/Footer';
import SectionDivider from './homepage-components/SectionDivider';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A] overflow-x-hidden`}>
      {/* 1. CoverPage */}
      <CoverPage />

      {/* 2. ExecutiveSummary */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <ExecutiveSummary />
      </div>

      {/* 3. HowItWorks */}
      <HowItWorks />

      {/* 4. ScenarioSimulator */}
      <ScenarioSimulator />

      {/* 5. AppPreview */}
      <AppPreview />

      {/* 6. SectionDivider */}
      <SectionDivider text="// SEE WHAT THE SYSTEM ACTUALLY DOES //" />

      {/* 7. SystemCapabilities */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <SystemCapabilities />
      </div>

      {/* 8. LiveAnalysisDemo */}
      <LiveAnalysisDemo />

      {/* 9. SystemPreview */}
      <SystemPreview />

      {/* 10. ConversationBreakdown */}
      <ConversationBreakdown />

      {/* 11. OperationalModules */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <OperationalModules />
      </div>

      {/* 12. SectionDivider */}
      <SectionDivider text="// THE RESULTS SPEAK FOR THEMSELVES //" />

      {/* 13. Evidence */}
      <Evidence />

      {/* 14. Statements */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <Statements />
      </div>

      {/* 15-17. ProgressionPath, DarkPatternRolodex */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <ProgressionPath />
        <DarkPatternRolodex />
      </div>

      {/* 18. ClassifiedComparison */}
      <ClassifiedComparison />

      {/* 19. FAQ */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-12 md:space-y-16 py-10 md:py-14">
        <FAQ />
      </div>

      {/* 20. AccessRequest */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10 md:py-14">
        <AccessRequest />
      </div>

      {/* 21. Footer */}
      <Footer />

    </main>
  );
}
