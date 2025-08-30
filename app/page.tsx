import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import HeroSection from "@/components/hero-section";
import Features1 from "@/components/features-1";
import DemoVideoPlayer from "@/components/demo-video-player";
// import TattooGallery from '@/components/tattoo-gallery'
import Features from "@/components/features-4";
import WallOfLoveSection from "@/components/testimonials";
import FAQsTwo from "@/components/faqs-2";
import Pricing from "@/components/pricing";
import FooterSection from "@/components/footer";
import { CreditCard, ChevronRight } from "lucide-react";

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "TattoosTry",
  "applicationCategory": "DesignApplication",
  "url": "https://tattoostry.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "500"
  },
  "description": "Try tattoos on your skin instantly with AI tattoo preview technology"
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        {/* Hero Section */}
        <HeroSection />

        {/* Trust Indicators */}
        <section className="border-y bg-white py-8" aria-label="Trust indicators">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">10,000+</p>
              <p className="text-sm text-muted-foreground">
                Previews Generated
              </p>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-muted-foreground">Tattoo Artists</p>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">4.9/5</p>
              <p className="text-sm text-muted-foreground">Customer Rating</p>
            </div>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div>
              <p className="text-2xl font-bold">5 sec</p>
              <p className="text-sm text-muted-foreground">
                Average Generation
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="bg-yellow-50">
        <Features1 />
      </section>

      {/* Video Demo Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Centered Title */}
            <div className="text-center mb-12">
              <span className="text-yellow-500 font-bold text-sm uppercase tracking-wider">Watch Demo</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2">
                See It In <span className="text-yellow-400">Action</span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mt-4 max-w-3xl mx-auto">
                Watch how easy it is to preview tattoos on your skin before committing. 
                Transform any design into a realistic preview in seconds.
              </p>
            </div>
            
            {/* Large Video Player */}
            <DemoVideoPlayer />
          </div>
        </div>
      </section>

      {/* Tattoo Gallery */}
      {/* <section id="gallery">
        <TattooGallery />
      </section> */}

      {/* Features Grid */}
      <section className="bg-yellow-50">
        <Features />
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Gallery</h2>
          <p className="text-muted-foreground">Coming soon - See amazing tattoo previews created by our users</p>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-yellow-50">
        <Pricing />
      </section>

      {/* Testimonials */}
      <section className="bg-white">
        <WallOfLoveSection />
      </section>

      {/* FAQ Section */}
      <section className="bg-yellow-50">
        <FAQsTwo />
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black" aria-label="Call to action">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Tattoo Business?
          </h2>
          <p className="text-xl mb-8">
            Join 500+ artists already using our platform. Start with 3 free
            previews today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-black text-yellow-400 hover:bg-gray-900 min-w-[200px]">
                Start Free Trial
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="outline"
                className="min-w-[200px] bg-transparent text-black border-black hover:bg-black hover:text-yellow-400"
              >
                View Pricing
                <CreditCard className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <FooterSection />
    </main>
    </>
  );
}
