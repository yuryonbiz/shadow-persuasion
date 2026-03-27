
'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './components/CoverPage';
import ExecutiveSummary from './components/ExecutiveSummary';
import { SystemCapabilities } from './components/SystemCapabilities';
import { SystemPreview } from './components/SystemPreview';
import TableOfContents from './components/TableOfContents';
import SubjectFiles from './components/SubjectFiles';
import { OperationalModules } from './components/OperationalModules';
import ScenarioSimulator from './components/ScenarioSimulator';
import InfluenceDecoder from './components/InfluenceDecoder';
import ProgressionPath from './components/ProgressionPath';
import DarkPatternRolodex from './components/DarkPatternRolodex';
import DeploymentFeed from './components/DeploymentFeed';
import FieldAssessment from './components/FieldAssessment';
import Evidence from './components/Evidence';
import Statements from './components/Statements';
import { Architects } from './components/Architects';
import FAQ from './components/FAQ';
import ClassifiedComparison from './components/ClassifiedComparison';
import AccessRequest from './components/AccessRequest';
import Footer from './components/Footer';
import SectionDivider from './components/SectionDivider';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function V4Page() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      <CoverPage />
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ExecutiveSummary />
      </div>
      
      <SectionDivider text="// SYSTEM OVERVIEW — CLEARANCE LEVEL 2 //" />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <SystemCapabilities />
        <SystemPreview />
      </div>
      
      <SectionDivider text="// TACTICAL ANALYSIS — EYES ONLY //" />
      
      <ScenarioSimulator />
      
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <InfluenceDecoder />
      </div>

      <SectionDivider text="// CLASSIFIED MATERIAL — RESTRICTED ACCESS //" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <TableOfContents />
        <SubjectFiles />
        <OperationalModules />
      </div>

      <SectionDivider text="// FIELD DATA — APPROACHING CLASSIFIED //" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <ProgressionPath />
        <DarkPatternRolodex />
      </div>
      
      <DeploymentFeed />

      <SectionDivider text="// OPERATIONAL EVIDENCE — TOP SECRET //" />

      <Evidence />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16 md:space-y-20 py-16">
        <Statements />
        <Architects />
      </div>

      <SectionDivider text="// OPERATOR EVALUATION — FINAL CLEARANCE //" />

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
