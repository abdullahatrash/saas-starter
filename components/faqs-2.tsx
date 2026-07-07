'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Link from 'next/link'
import { faqItems } from '@/lib/faq-data'

export default function FAQsTwo() {
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
