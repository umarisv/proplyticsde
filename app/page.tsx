import { MarketingHeader } from "@/components/layout/marketing-header"
import {
  HeroSection,
  SocialProof,
  HowItWorks,
  FeatureGrid,
  ReportPreview,
  TrustSection,
  FinalCTA,
  Footer,
} from "@/components/sections"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        <HeroSection />
        <SocialProof />
        <HowItWorks />
        <FeatureGrid />
        <ReportPreview />
        <TrustSection />
        <FinalCTA />
        <Footer />
      </main>
    </div>
  )
}
