import Hero from '@/components/home/hero';
import Problems from '@/components/home/problems';
import Features from '@/components/home/features';
import WowSection from '@/components/home/wow-section';
import Audience from '@/components/home/audience';
import HowItWorks from '@/components/home/how-it-works';
import CTA from '@/components/home/cta';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Problems />
      <Features />
      <WowSection />
      <Audience />
      <HowItWorks />
      <CTA />
    </main>
  );
}
