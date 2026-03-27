'use client';

import { Special_Elite } from 'next/font/google';
import CoverPage from './components/CoverPage';
import ExecutiveSummary from './components/ExecutiveSummary';
import { SystemCapabilities } from './components/SystemCapabilities';
import { SystemPreview } from './components/SystemPreview';
import { OperationalModules } from './components/OperationalModules';
import { Architects } from './components/Architects';
import TableOfContents from './components/TableOfContents';
import SubjectFiles from './components/SubjectFiles';
import Evidence from './components/Evidence';
import Statements from './components/Statements';
import FAQ from './components/FAQ';
import AccessRequest from './components/AccessRequest';
import Footer from './components/Footer';

const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });

export default function V4Page() {
  return (
    <main className={`${specialElite.className} bg-[#F4ECD8] text-black`}>
      <CoverPage />
      <div className="bg-[#F4ECD8]">
        <ExecutiveSummary />
        <SystemCapabilities />
        <SystemPreview />
        <SubjectFiles />
        <OperationalModules />
        <Evidence />
        <Statements />
        <Architects />
        <TableOfContents />
        <FAQ />
        <AccessRequest />
        <Footer />
      </div>
    </main>
  );
}
