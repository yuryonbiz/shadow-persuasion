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

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function V4Page() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-[#1A1A1A]`}>
      <CoverPage />
      <div className="max-w-4xl mx-auto px-6 md:px-12 space-y-20 py-16">
        <ExecutiveSummary />
        <SystemCapabilities />
        <SystemPreview />
        <ScenarioSimulator />
        <InfluenceDecoder />
        <TableOfContents />
        <SubjectFiles />
        <OperationalModules />
        <ProgressionPath />
        <DarkPatternRolodex />
        <DeploymentFeed />
        <Evidence />
        <Statements />
        <Architects />
        <FieldAssessment />
        <FAQ />
        <ClassifiedComparison />
        <AccessRequest />
      </div>
      <Footer />
    </main>
  );
}