import { Zap, Shield, Users, Palette, Clock, Share2 } from 'lucide-react'

export default function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-4 text-center">
                    <h2 className="text-balance text-3xl font-bold">Everything You Need</h2>
                    <p className="text-lg text-muted-foreground">Professional tools for modern tattoo artists</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Lightning Fast</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Generate photorealistic previews in under 5 seconds with our AI technology</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Shield className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Secure & Private</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Your designs and client photos are encrypted and never shared</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Users className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Client Collaboration</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Share preview links with clients for instant feedback and approval</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Palette className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Multiple Styles</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Black & gray, color, fine line, watercolor - all styles supported</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Clock className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Save Time</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">Reduce consultation time by 70% with instant visualizations</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Share2 className="size-5 text-purple-600" />
                            <h3 className="font-semibold">Easy Sharing</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">One-click sharing to social media or direct client links</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
