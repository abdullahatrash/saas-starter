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
        name: 'Sarah Mitchell',
        role: 'Owner @ Ink & Soul Studio',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        quote: 'This tool has revolutionized my consultation process. Clients love seeing exactly how their tattoo will look before committing. Booking rates up 40%!',
        rating: 5,
    },
    {
        name: 'Marcus Chen',
        role: 'Lead Artist @ Dragon Tattoo NYC',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
        quote: 'The AI is incredibly accurate. It handles different skin tones and body contours perfectly. My clients are always amazed by the realistic previews.',
        rating: 5,
    },
    {
        name: 'Lisa Rodriguez',
        role: 'Founder @ Modern Ink LA',
        image: 'https://randomuser.me/api/portraits/women/7.jpg',
        quote: 'Worth every penny. I\'ve reduced consultation time by 70% and increased client satisfaction. The sharing feature is perfect for social media.',
        rating: 5,
    },
    {
        name: 'Jake Thompson',
        role: 'Senior Artist @ Black Rose Tattoo',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
        quote: 'Game changer for cover-up consultations. Being able to show clients multiple options instantly has doubled my cover-up bookings. The quality is phenomenal.',
        rating: 5,
    },
    {
        name: 'Emma Wilson',
        role: 'Tattoo Artist @ Sacred Art Studio',
        image: 'https://randomuser.me/api/portraits/women/4.jpg',
        quote: 'Finally, a tool that understands tattoo artistry. The style options are spot-on, and the placement tools save hours of back-and-forth with clients.',
        rating: 5,
    },
    {
        name: 'David Park',
        role: 'Owner @ Precision Tattoo Co',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        quote: 'My conversion rate went from 30% to 75% after implementing this. Clients feel confident when they can visualize their tattoo beforehand.',
        rating: 5,
    },
    {
        name: 'Nina Petrov',
        role: 'Fine Line Specialist @ Ethereal Ink',
        image: 'https://randomuser.me/api/portraits/women/5.jpg',
        quote: 'Perfect for fine line work visualization. The detail preservation is impressive. I use it for every consultation now. Absolute must-have tool.',
        rating: 5,
    },
    {
        name: 'Carlos Mendoza',
        role: 'Traditional Artist @ Old School Tattoos',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
        quote: 'Even for traditional work, this tool is invaluable. Shows clients exactly how bold lines and colors will look on their skin. 5 stars!',
        rating: 5,
    },
    {
        name: 'Ashley Kim',
        role: 'Watercolor Specialist @ Artistry Ink',
        image: 'https://randomuser.me/api/portraits/women/10.jpg',
        quote: 'The watercolor style preview is surprisingly accurate. Helps clients understand how these artistic styles will age. Fantastic for setting expectations.',
        rating: 5,
    },
    {
        name: 'Mike Stevens',
        role: 'Shop Manager @ Veteran Ink',
        image: 'https://randomuser.me/api/portraits/men/11.jpg',
        quote: 'All our artists use this now. It\'s streamlined our workflow and reduced no-shows by 60%. The ROI was immediate. Best investment we\'ve made.',
        rating: 5,
    },
    {
        name: 'Rachel Green',
        role: 'Apprentice @ Rising Phoenix Tattoo',
        image: 'https://randomuser.me/api/portraits/women/12.jpg',
        quote: 'As an apprentice, this tool helps me communicate ideas with clients professionally. It\'s boosted my confidence and bookings significantly.',
        rating: 5,
    },
    {
        name: 'Tony Russo',
        role: '20+ Years Experience @ Classic Tattoos',
        image: 'https://randomuser.me/api/portraits/men/13.jpg',
        quote: 'I\'ve been tattooing for 20 years. This is the most significant advancement I\'ve seen. It bridges the gap between artist vision and client expectations perfectly.',
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
                    <h2 className="text-3xl font-bold mb-4">Loved by Artists Worldwide</h2>
                    <p className="text-lg text-muted-foreground">
                        See what tattoo professionals are saying
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
