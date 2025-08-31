import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'

type Testimonial = {
    name: string
    role: string
    image: string
    quote: string
    rating?: number
}

const testimonials: Testimonial[] = [
    {
        name: 'Sarah Thompson',
        role: 'First-time Client',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'I was nervous about getting my first tattoo. This tool helped me try 10 different placements until I found the perfect spot!',
        rating: 5,
    },
    {
        name: 'Mike Chen',
        role: 'Tattoo Artist',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: 'My clients love seeing their ideas come to life before we start. It\'s saved me hours of consultation time.',
        rating: 5,
    },
    {
        name: 'Emma Wilson',
        role: 'College Student',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        quote: 'Helped me convince my parents by showing them exactly how subtle and professional my wrist tattoo would look.',
        rating: 5,
    },
    {
        name: 'Jason Miller',
        role: 'Tattoo Collector',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: 'Finally decided on my sleeve design after seeing how all the pieces work together. Incredible tool!',
        rating: 5,
    },
    {
        name: 'Lisa Martinez',
        role: 'Studio Owner @ Modern Ink',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        quote: 'Worth every penny. I\'ve reduced consultation time by 70% and increased client satisfaction. My conversion rate doubled!',
        rating: 5,
    },
    {
        name: 'David Park',
        role: 'Cover-up Specialist',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        quote: 'Game changer for cover-up consultations. Shows clients exactly how the new design will hide the old tattoo.',
        rating: 5,
    },
    {
        name: 'Nina Rodriguez',
        role: 'Anxious First-Timer',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        quote: 'As someone with tattoo anxiety, being able to see it on my body first was exactly what I needed to feel confident.',
        rating: 5,
    },
    {
        name: 'Carlos Mendoza',
        role: 'Traditional Artist',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        quote: 'The AI handles all styles perfectly. My clients can now visualize bold traditional work before committing.',
        rating: 5,
    },
    {
        name: 'Ashley Kim',
        role: 'Planning Sleeve',
        image: 'https://randomuser.me/api/portraits/women/10.jpg',
        quote: 'Used this to plan my entire arm sleeve. Seeing how designs flow together saved me from costly mistakes.',
        rating: 5,
    },
    {
        name: 'Tony Stevens',
        role: '20+ Years Tattoo Artist',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        quote: 'I\'ve been tattooing for 20 years. This is the most significant advancement I\'ve seen. It bridges the gap between vision and reality.',
        rating: 5,
    },
    {
        name: 'Rachel Green',
        role: 'Memorial Tattoo',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'For something as important as my memorial tattoo, seeing it first was crucial. It helped me get the placement perfect.',
        rating: 5,
    },
    {
        name: 'Marcus Johnson',
        role: 'Professional',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        quote: 'Needed to ensure my tattoo could be covered for work. The preview helped me find the perfect spot that\'s both meaningful and practical.',
        rating: 5,
    },
]

const chunkArray = (array: Testimonial[], chunkSize: number): Testimonial[][] => {
    const result: Testimonial[][] = []
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize))
    }
    return result
}

const testimonialChunks = chunkArray(testimonials, Math.ceil(testimonials.length / 3))

export default function WallOfLoveSection() {
    return (
        <section className="py-20 px-4 bg-muted/30">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Loved by Thousands Worldwide</h2>
                    <p className="text-lg text-muted-foreground">
                        From first-timers to professional artists - see what our users are saying
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 md:mt-12 lg:grid-cols-3">
                    {testimonialChunks.map((chunk, chunkIndex) => (
                        <div
                            key={chunkIndex}
                            className="space-y-3">
                            {chunk.map(({ name, role, quote, image, rating }, index) => (
                                <Card key={index} className="hover:shadow-lg transition-shadow">
                                    <CardContent className="pt-6">
                                        {rating && (
                                            <div className="flex mb-3">
                                                {[...Array(rating)].map((_, i) => (
                                                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                ))}
                                            </div>
                                        )}
                                        <blockquote className="mb-4">
                                            <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{quote}"</p>
                                        </blockquote>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage
                                                    alt={name}
                                                    src={image}
                                                    loading="lazy"
                                                />
                                                <AvatarFallback>{name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-sm">{name}</h3>
                                                <span className="text-muted-foreground text-xs">{role}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
