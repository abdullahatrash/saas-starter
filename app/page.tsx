import { Separator } from "@/components/ui/separator";
import HeroSection from "@/components/hero-section";
import Features1 from "@/components/features-1";
import DemoVideoPlayer from "@/components/demo-video-player";
// import TattooGallery from '@/components/tattoo-gallery'
import Features from "@/components/features-4";
import WallOfLoveSection from "@/components/testimonials";
import FAQsTwo from "@/components/faqs-2";
import Pricing from "@/components/pricing";
import PricingWithCheckout from "@/components/pricing-with-checkout";
import FooterSection from "@/components/footer";
import CTASection from "@/components/cta-section";
import {
  Comparison,
  ComparisonItem,
  ComparisonHandle,
} from "@/components/ui/shadcn-io/comparison";
import { getUser } from "@/lib/db/queries";
import { checkoutAction } from "@/lib/payments/actions";

// Structured data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "TattoosTry",
  applicationCategory: "DesignApplication",
  url: "https://tattoostry.com",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "500",
  },
  description:
    "Try tattoos on your skin instantly with AI tattoo preview technology",
};

export default async function LandingPage() {
  const user = await getUser();
  
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
        <section
          className="border-y bg-white py-8"
          aria-label="Trust indicators"
        >
          <div className="container mx-auto max-w-6xl px-4">
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              <div>
                <p className="text-2xl font-bold">10,000+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block"
              />
              <div>
                <p className="text-2xl font-bold">500+</p>
                <p className="text-sm text-muted-foreground">Tattoo Artists</p>
              </div>
              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block"
              />
              <div>
                <p className="text-2xl font-bold">4.9/5</p>
                <p className="text-sm text-muted-foreground">Star Rating</p>
              </div>
              <Separator
                orientation="vertical"
                className="h-8 hidden sm:block"
              />
              <div>
                <p className="text-2xl font-bold">30-60s</p>
                <p className="text-sm text-muted-foreground">Generation Time</p>
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
                <span className="text-yellow-500 font-bold text-sm uppercase tracking-wider">
                  Watch Demo
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mt-2">
                  See It In <span className="text-yellow-400">Action</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mt-4 max-w-3xl mx-auto">
                  Watch how easy it is to preview tattoos on your skin before
                  committing. Transform any design into a realistic preview in
                  seconds.
                </p>
              </div>

              {/* Large Video Player */}
              <DemoVideoPlayer />
            </div>
          </div>
        </section>

        {/* Before/After Comparison Section */}
        <section className="bg-yellow-50 py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Section Title */}
              <div className="text-center mb-12">
                <span className="text-yellow-600 font-bold text-sm uppercase tracking-wider">
                  See The Difference
                </span>
                <h2 className="text-4xl md:text-5xl font-bold mt-2">
                  Before & <span className="text-yellow-500">After</span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mt-4 max-w-3xl mx-auto">
                  Drag the slider to see how our AI transforms your skin with
                  realistic tattoo previews
                </p>
              </div>

              {/* Comparison Component - Better aspect ratio for tattoo display */}
              <div className="w-full">
                <Comparison
                  mode="drag"
                  className="rounded-xl overflow-hidden shadow-2xl"
                >
                  <div className="relative aspect-[4/3] md:aspect-[16/10]">
                    <ComparisonItem position="left">
                      <img
                        src="https://p9xcezb73lfrkkkg.public.blob.vercel-storage.com/images/tattoo-image-slider-before.png"
                        alt="Before - Original skin"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                      <div className="absolute bottom-6 left-6 bg-black/70 text-white px-4 py-2 rounded-full text-sm md:text-base font-bold">
                        BEFORE
                      </div>
                    </ComparisonItem>
                    <ComparisonItem position="right">
                      <img
                        src="https://p9xcezb73lfrkkkg.public.blob.vercel-storage.com/images/tattoo-final-slider.png"
                        alt="After - With tattoo preview"
                        className="absolute inset-0 h-full w-full object-cover object-center"
                      />
                      <div className="absolute bottom-6 right-6 bg-yellow-400 text-black px-4 py-2 rounded-full text-sm md:text-base font-bold">
                        AFTER
                      </div>
                    </ComparisonItem>
                    <ComparisonHandle />
                  </div>
                </Comparison>
              </div>
            </div>
          </div>
        </section>

        {/* First CTA Section */}
        <CTASection variant="primary" />

        {/* Tattoo Gallery */}
        {/* <section id="gallery">
        <TattooGallery />
      </section> */}

        {/* Features Grid */}
        <section className="bg-white">
          <Features />
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="py-20 bg-yellow-50">
          <div className="container mx-auto max-w-6xl px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Gallery</h2>
            <p className="text-muted-foreground">
              Coming soon - See amazing tattoo previews created by our users
            </p>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-white">
          {user ? (
            <PricingWithCheckout checkoutAction={checkoutAction} />
          ) : (
            <Pricing />
          )}
        </section>

        {/* Testimonials */}
        <section className="bg-yellow-50">
          <WallOfLoveSection />
        </section>

        {/* FAQ Section */}
        <section className="bg-white">
          <FAQsTwo />
        </section>

        {/* Second CTA Section */}
        <CTASection variant="secondary" />

        {/* Footer */}
        <FooterSection />
      </main>
    </>
  );
}
