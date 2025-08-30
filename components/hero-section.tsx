"use client";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
// import DemoVideoPlayer from '@/components/demo-video-player'

const menuItems = [
  { name: "Features", href: "#features" },
  { name: "Pricing", href: "#pricing" },
  { name: "Gallery", href: "#gallery" },
  { name: "Studio", href: "/studio" },
];

export default function HeroSection() {
  const [menuState, setMenuState] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Video autoplay failed:", error);
      });
    }
  }, []);

  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setMenuState(false); // Close mobile menu after clicking
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-black">
      {/* Background Video */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <div className="absolute inset-0 bg-black/70 z-10" />
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="https://p9xcezb73lfrkkkg.public.blob.vercel-storage.com/thumbnails/hero-page-video-thumbnail.png"
        >
          <source
            src="https://p9xcezb73lfrkkkg.public.blob.vercel-storage.com/Video/Tattoo_Design_Fade_Transition_Video.mp4"
            type="video/mp4"
          />
          Your browser does not support the video tag.
        </video>
      </div>

      <header className="relative z-20">
        <nav
          data-state={menuState && "active"}
          className="fixed z-20 w-full border-b border-yellow-400/20 bg-black/80 backdrop-blur-md"
        >
          <div className="m-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
              <div className="flex w-full justify-between lg:w-auto">
                <Link
                  href="/"
                  aria-label="home"
                  className="flex items-center space-x-2"
                >
                  <span className="text-2xl font-black text-yellow-400 uppercase tracking-tight">
                    TattooAI
                  </span>
                </Link>

                <button
                  onClick={() => setMenuState(!menuState)}
                  aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                  className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                >
                  <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 text-yellow-400 duration-200" />
                  <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 text-yellow-400 -rotate-180 scale-0 opacity-0 duration-200" />
                </button>
              </div>

              <div className="bg-black/90 in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border border-yellow-400/20 p-6 shadow-2xl shadow-yellow-400/10 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
                <div className="lg:pr-4">
                  <ul className="space-y-6 text-base lg:flex lg:gap-8 lg:space-y-0 lg:text-sm">
                    {menuItems.map((item, index) => (
                      <li key={index}>
                        {item.href.startsWith("#") ? (
                          <a
                            href={item.href}
                            onClick={(e) => handleSmoothScroll(e, item.href)}
                            className="text-gray-300 hover:text-yellow-400 block font-bold uppercase text-sm tracking-wider transition-colors duration-150 cursor-pointer"
                          >
                            <span>{item.name}</span>
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            className="text-gray-300 hover:text-yellow-400 block font-bold uppercase text-sm tracking-wider transition-colors duration-150"
                          >
                            <span>{item.name}</span>
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit lg:border-l lg:pl-6">
                  <Button
                    asChild
                    className="border-yellow-400 text-black hover:bg-yellow-400 hover:text-black font-bold uppercase tracking-wider"
                    variant="outline"
                    size="sm"
                  >
                    <Link href="/sign-in">
                      <span>Login</span>
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="bg-yellow-400 text-black hover:bg-yellow-500 font-bold uppercase tracking-wider"
                    size="sm"
                  >
                    <Link href="/sign-up">
                      <span>Sign Up</span>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="relative min-h-screen flex items-center justify-center">
          <div className="relative mx-auto max-w-6xl px-6 py-24 w-full">
            <div className="lg:flex lg:items-center lg:gap-12">
              <div className="relative z-10 mx-auto max-w-2xl text-center lg:ml-0 lg:w-2/3 lg:max-w-none lg:text-left">
                <h1 className="text-5xl md:text-6xl xl:text-7xl font-black uppercase leading-none">
                  <span className="text-white">Try Before</span>
                  <br />
                  <span className="text-yellow-400">You Ink</span>
                </h1>
                <div className="mt-8 space-y-3 text-lg text-gray-200 max-w-2xl">
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-3 flex-shrink-0 text-xl">
                      🔥
                    </span>
                    <span className="leading-relaxed font-semibold">
                      Upload photo → See tattoos on your skin
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-3 flex-shrink-0 text-xl">
                      💉
                    </span>
                    <span className="leading-relaxed font-semibold">
                      Upload sketch → Instant realistic preview
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-3 flex-shrink-0 text-xl">
                      🎨
                    </span>
                    <span className="leading-relaxed font-semibold">
                      Try tattoos in any style — Black & Grey, Watercolor,
                      Traditional
                    </span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-yellow-400 mr-3 flex-shrink-0 text-xl">
                      ⚡
                    </span>
                    <span className="leading-relaxed font-semibold">
                      Test anywhere: arm, back, chest, neck
                    </span>
                  </p>
                </div>

                <div className="mt-10">
                  <div className="mx-auto lg:ml-0 w-full max-w-sm sm:max-w-none sm:w-fit">
                    <Link href="/sign-up" className="block w-full sm:w-auto">
                      <Button
                        size="lg"
                        className="bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-wide px-6 py-6 text-base sm:text-lg shadow-lg hover:shadow-xl transition-all w-full sm:w-auto whitespace-normal sm:whitespace-nowrap"
                      >
                        <span className="block sm:hidden">
                          Start Free Preview →
                        </span>
                        <span className="hidden sm:block">
                          Start Your First AI Tattoo Free Preview →
                        </span>
                      </Button>
                    </Link>
                  </div>

                  <p className="mt-4 text-sm text-gray-400 text-center lg:text-left">
                    No credit card required • 3 free previews
                  </p>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="hidden lg:block lg:w-1/3">
                <div className="relative">
                  <div className="absolute -right-10 top-20 w-32 h-32">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-yellow-400 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                  <div className="absolute -right-10 bottom-20 w-32 h-32">
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 bg-yellow-400/30 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
