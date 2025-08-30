'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'

export default function FAQsTwo() {
    const faqItems = [
        {
            id: 'item-1',
            question: 'How accurate are the tattoo previews?',
            answer: 'Our AI technology generates photorealistic previews with 95% accuracy. The system accounts for body contours, skin tone, and lighting to create previews that closely match the final tattoo result. Artists report that clients are consistently amazed by how accurate the previews are.',
        },
        {
            id: 'item-2',
            question: 'What file formats are supported?',
            answer: 'We support JPG, PNG, and WebP formats for both body photos and design uploads. Maximum file size is 10MB per image. For best results, use high-resolution images with good lighting. The clearer your images, the better the preview quality.',
        },
        {
            id: 'item-3',
            question: 'How does the credit system work?',
            answer: 'Each preview generation costs 1 credit. New users get 3 free credits to try the service. You can purchase credit packs starting at $4.99 for 10 credits, or subscribe to monthly plans for better value. Unused credits from packs never expire.',
        },
        {
            id: 'item-4',
            question: 'Can I cancel my subscription anytime?',
            answer: "Yes, you can cancel your subscription at any time from your account settings. You'll continue to have access until the end of your billing period. No questions asked, no cancellation fees. Credit packs are one-time purchases and don't require cancellation.",
        },
        {
            id: 'item-5',
            question: 'Is my client data secure?',
            answer: 'Absolutely. All uploads are encrypted using bank-level security. We never share or sell your data. Images are automatically deleted after 30 days unless saved to your gallery. We\'re GDPR compliant and follow industry best practices for data protection.',
        },
        {
            id: 'item-6',
            question: 'Do you offer team accounts for studios?',
            answer: 'Yes! Our Studio Unlimited plan ($99.99/month) includes team accounts. You can add multiple artists to your account and manage permissions. For larger studios with 10+ artists, contact us for custom enterprise solutions with volume pricing.',
        },
        {
            id: 'item-7',
            question: 'What\'s your refund policy?',
            answer: 'We offer a 7-day money-back guarantee on all credit pack purchases if you\'re not satisfied. For subscriptions, we provide a 14-day free trial so you can test the service risk-free. Simply contact support within the guarantee period for a full refund.',
        },
        {
            id: 'item-8',
            question: 'Can I use this for all tattoo styles?',
            answer: 'Yes! Our AI handles all major tattoo styles including black & gray, color, fine line, watercolor, traditional, neo-traditional, realism, and more. You can adjust parameters like opacity, size, and rotation to perfectly match your artistic vision.',
        },
        {
            id: 'item-9',
            question: 'How long does preview generation take?',
            answer: 'Most previews are generated in 3-5 seconds. Complex designs or high-demand periods might take up to 10 seconds. We use advanced AI infrastructure to ensure fast, consistent performance even during peak hours.',
        },
        {
            id: 'item-10',
            question: 'Can clients use this without an account?',
            answer: 'Artists can share preview links with clients who can view and comment without creating an account. However, to generate their own previews, users need to sign up. We offer a white-label option for studios who want a fully branded experience.',
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
