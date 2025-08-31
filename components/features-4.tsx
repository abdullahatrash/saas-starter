import { Heart, DollarSign, Eye, Palette, Shield, Share2 } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center">
                    <h2 className="text-balance text-3xl font-bold">Why Choose TattoosTry?</h2>
                    <p className="text-lg text-muted-foreground">Benefits for everyone - from first-timers to professional artists</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Heart className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Risk-Free Decisions</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">See exactly how your tattoo will look before making a permanent commitment</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Save Money</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Avoid costly mistakes, cover-ups, and tattoo removal procedures</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Eye className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Photorealistic Quality</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">AI-powered previews that accurately show body contours and skin tones</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Palette className="size-5 text-purple-600" />
                            <h3 className="font-semibold">All Styles Supported</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Black & gray, color, fine line, watercolor - try any tattoo style instantly</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-purple-600" />
                            <h3 className="font-semibold">100% Private</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Your photos are encrypted and automatically deleted after 30 days</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Share2 className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Get Feedback</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Share previews with friends, family, or your artist before deciding</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
