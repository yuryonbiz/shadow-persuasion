
import { Cormorant_Garamond } from 'next/font/google';
import Opening from './components/Opening';
import TheQuestion from './components/TheQuestion';
import TheMirror from './components/TheMirror';
import TheList from './components/TheList';
import TheSpace from './components/TheSpace';
import Voices from './components/Voices';
import TheArchitects from './components/TheArchitects';
import Questions from './components/Questions';
import TheThreshold from './components/TheThreshold';
import Footer from './components/Footer';

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
});

export default function V5Page() {
  return (
    <div className={`bg-white text-[#111111] ${cormorant.className}`}>
      <Opening />
      <TheQuestion />
      <TheMirror />
      <TheList />
      <TheSpace />
      <Voices />
      <TheArchitects />
      <Questions />
      <TheThreshold />
      <Footer />
    </div>
  );
}
