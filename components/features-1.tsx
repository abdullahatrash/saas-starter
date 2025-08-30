import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Image, Palette, Download } from 'lucide-react'
import { ReactNode } from 'react'

export default function Features() {
    return (
        <section className="py-20">
            <div className="@container mx-auto max-w-5xl px-6">
                <div className="text-center">
                    <h2 className="text-balance text-3xl font-bold">How It Works</h2>
                    <p className="mt-4 text-lg text-muted-foreground">Three simple steps to perfect tattoo previews</p>
                </div>
                <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Image
                                    className="size-6 text-purple-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-xl font-semibold">1. Upload Photos</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="text-muted-foreground">Upload a photo of the body part and your tattoo design</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Palette
                                    className="size-6 text-purple-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-xl font-semibold">2. Customize Style</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-muted-foreground">Choose style, adjust size, rotation, and placement</p>
                        </CardContent>
                    </Card>

                    <Card className="group shadow-zinc-950/5">
                        <CardHeader className="pb-3">
                            <CardDecorator>
                                <Download
                                    className="size-6 text-purple-600"
                                    aria-hidden
                                />
                            </CardDecorator>

                            <h3 className="mt-6 text-xl font-semibold">3. Share Results</h3>
                        </CardHeader>

                        <CardContent>
                            <p className="mt-3 text-muted-foreground">Download high-res previews or share with clients instantly</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
    <div className="relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:bg-white/5 dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
        <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px]"
        />
        <div
            aria-hidden
            className="bg-radial to-background absolute inset-0 from-transparent to-75%"
        />
        <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">{children}</div>
    </div>
)
