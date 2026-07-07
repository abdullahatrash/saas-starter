import { ImageUp, Palette, Share2, ArrowRight } from 'lucide-react'
import { ReactNode } from 'react'

const steps = [
    {
        number: '01',
        title: 'Upload Photos',
        description: 'Upload a photo of the body part and your tattoo design',
        icon: ImageUp,
        tilt: '-rotate-3',
        delay: '0s',
    },
    {
        number: '02',
        title: 'Place & Style',
        description: 'Drag, resize, and rotate the design right on your photo, then pick a style',
        icon: Palette,
        tilt: 'rotate-2',
        delay: '0.6s',
    },
    {
        number: '03',
        title: 'Share Results',
        description: 'Download high-res previews or share them with your artist instantly',
        icon: Share2,
        tilt: '-rotate-2',
        delay: '1.2s',
    },
]

export default function Features() {
    return (
        <section className="py-20">
            <div className="mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-yellow-600">How it works</span>
                    <h2 className="text-balance mt-2 text-3xl font-bold md:text-4xl">
                        Three Steps to <span className="text-yellow-500">Your Tattoo</span>
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">From photo to photorealistic preview in under a minute</p>
                </div>

                <div className="relative mt-10 md:mt-16">
                    {/* Connectors between steps (desktop only) */}
                    <div aria-hidden className="absolute inset-x-0 top-16 hidden md:block">
                        <ArrowRight className="absolute left-[31%] size-6 text-yellow-500" />
                        <ArrowRight className="absolute left-[64.5%] size-6 text-yellow-500" />
                    </div>

                    <div className="mx-auto grid max-w-sm gap-6 text-center md:max-w-full md:grid-cols-3 md:gap-8">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="group relative rounded-2xl border border-black/10 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[8px_8px_0_0_theme(colors.yellow.400)]"
                            >
                                <span
                                    aria-hidden
                                    className="absolute right-5 top-3 text-5xl font-black text-yellow-400/60 transition-colors duration-300 group-hover:text-yellow-400"
                                >
                                    {step.number}
                                </span>

                                <IconTile tilt={step.tilt} delay={step.delay}>
                                    <step.icon className="size-9 text-yellow-400" strokeWidth={1.75} aria-hidden />
                                </IconTile>

                                <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                                <p className="mt-3 text-muted-foreground">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

const IconTile = ({ children, tilt, delay }: { children: ReactNode; tilt: string; delay: string }) => (
    <div className={`mx-auto w-fit ${tilt} transition-transform duration-300 group-hover:rotate-0 group-hover:scale-110`}>
        <div
            style={{ animationDelay: delay }}
            className="motion-safe:animate-tile-float flex size-20 items-center justify-center rounded-2xl bg-black shadow-lg shadow-black/20"
        >
            {children}
        </div>
    </div>
)
