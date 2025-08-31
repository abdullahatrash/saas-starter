'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How realistic are the previews?',
            answer: 'Our AI technology creates photorealistic previews that accurately show how the tattoo will look on your skin, including natural lighting, body contours, and skin tone blending. The previews are so realistic that both clients and artists consistently report being amazed by the accuracy.',
        },
        {
            id: 'item-2',
            question: 'What image formats are supported?',
            answer: 'We support JPG, PNG, and WebP images up to 10MB. Images are automatically compressed for optimal processing. Use clear, well-lit photos for best results - the clearer your images, the better the preview quality.',
        },
        {
            id: 'item-3',
            question: 'How long does it take to generate a preview?',
            answer: 'Most previews are ready in 30-60 seconds. Complex designs might take slightly longer. We use Google\'s advanced Nano-Banana AI model via Replicate for fast, high-quality results.',
        },
        {
            id: 'item-4',
            question: 'What makes a good body photo?',
            answer: 'Use a clear, well-lit photo of the body area where you want the tattoo. Avoid blurry or dark images for best results. Natural lighting works great, and make sure the area is clearly visible.',
        },
        {
            id: 'item-5',
            question: 'Can I try different placements?',
            answer: 'Yes! You can generate unlimited variations with different body parts, sizes, rotations, and styles using your credits. Try your design on your arm, back, chest, shoulder, leg, ankle, wrist, hand, or neck.',
        },
        {
            id: 'item-6',
            question: 'What\'s the difference between style options?',
            answer: 'Black & Gray gives you classic monochrome tattoo style. Full Color provides vibrant, colorful rendering. Fine Line creates delicate, thin-line tattoo style. Watercolor produces an artistic, paint-like effect.',
        },
        {
            id: 'item-7',
            question: 'What are credits?',
            answer: 'Each preview generation uses 1 credit. New users get 3 free credits to try the service. If the AI fails to generate your preview, your credit is automatically refunded.',
        },
        {
            id: 'item-8',
            question: 'Do credits expire?',
            answer: 'No, purchased credits never expire. Use them whenever you need. You can buy more credits through our pricing page, with bulk purchases including discounts.',
        },
        {
            id: 'item-9',
            question: 'Are my photos safe?',
            answer: 'Yes! All images are securely stored on Vercel\'s encrypted servers and are only used for generating your previews. Images are stored for 30 days for your convenience, then automatically deleted.',
        },
        {
            id: 'item-10',
            question: 'Can others see my previews?',
            answer: 'Only if you share the link. By default, all previews are private to your account. You can delete your account and all associated data at any time from your dashboard.',
        },
    ]

    return (
        <section className="py-20 px-4">
            <div className="container mx-auto max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">
                        Everything you need to know about our service
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {faqItems.map((item) => (
                        <AccordionItem
                            key={item.id}
                            value={item.id}>
                            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                            <AccordionContent>
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>

                <div className="mt-12 text-center">
                    <p className="text-muted-foreground">
                        Still have questions? {' '}
                        <Link
                            href="/contact"
                            className="text-primary font-medium hover:underline">
                            Contact our support team
                        </Link>
                        {' '} or {' '}
                        <Link
                            href="/help"
                            className="text-primary font-medium hover:underline">
                            visit our help center
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    )
}
