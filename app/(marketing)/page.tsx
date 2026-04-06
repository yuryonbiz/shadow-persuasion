'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './homepage-components/CoverPage';
import ExecutiveSummary from './homepage-components/ExecutiveSummary';
import { SystemCapabilities } from './homepage-components/SystemCapabilities';
import AppPreview from './homepage-components/AppPreview';
import ScenarioSimulator from './homepage-components/ScenarioSimulator';
import ProgressionPath from './homepage-components/ProgressionPath';
import DarkPatternRolodex from './homepage-components/DarkPatternRolodex';
import FieldAssessment from './homepage-components/FieldAssessment';
import Evidence from './homepage-components/Evidence';
import Statements from './homepage-components/Statements';
import FAQ from './homepage-components/FAQ';
import ClassifiedComparison from './homepage-components/ClassifiedComparison';
import AccessRequest from './homepage-components/AccessRequest';
import Footer from './homepage-components/Footer';
import SectionDivider from './homepage-components/SectionDivider';
import LiveAnalysisDemo from './homepage-components/LiveAnalysisDemo';
import DossierAnalysis from './homepage-components/DossierAnalysis';
import MeasuredImpact from './homepage-components/MeasuredImpact';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function HomePage() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      <CoverPage />
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ExecutiveSummary />
      </div>

      <SectionDivider text="// STRATEGIC COMMUNICATION TRAINING — PUBLIC ACCESS //" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <SystemCapabilities />
      </div>

      <AppPreview />

      <LiveAnalysisDemo />
      <DossierAnalysis />
      <ScenarioSimulator />

      <SectionDivider text="// SUCCESS METRICS — VERIFIED RESULTS //" />

      <Evidence />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <MeasuredImpact />
        <ProgressionPath />
        <DarkPatternRolodex />
        <Statements />
      </div>

      <FieldAssessment />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <FAQ />
      </div>

      <ClassifiedComparison />
      <AccessRequest />

      <Footer />
    </main>
  );
}
