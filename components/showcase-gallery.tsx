'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

type Photo = {
    src: string
    alt: string
    label: string
    width: number
    height: number
}

const photos: Photo[] = [
    {
        src: '/showcase/22_colorful_bird_arm_tattoo.jpg',
        alt: 'Colorful bird tattoo on an upper arm',
        label: 'Arm • Color',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/07_dragon_design_tattoo.jpg',
        alt: 'Dragon tattoo design on a hand',
        label: 'Hand • Dragon',
        width: 1200,
        height: 800,
    },
    {
        src: '/showcase/12_geometric_back_tattoos.jpg',
        alt: 'Geometric tattoo on an upper back',
        label: 'Back • Geometric',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/21_intricate_forearm_tattoo.jpg',
        alt: 'Intricate forearm tattoo in low light',
        label: 'Forearm • Detail',
        width: 1200,
        height: 800,
    },
    {
        src: '/showcase/11_tattooed_torso_bw.jpg',
        alt: 'Black and white tattooed torso',
        label: 'Chest • Black & gray',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/16_womans_back_tattoos.jpg',
        alt: 'Fine line tattoos on a woman’s back',
        label: 'Back • Fine line',
        width: 1200,
        height: 800,
    },
    {
        src: '/showcase/23_floral_geometric_arm_tattoos.jpg',
        alt: 'Floral and geometric tattoos on an arm',
        label: 'Arm • Floral',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/19_hand_dragon_tattoo.jpg',
        alt: 'Dragon tattoo across a hand',
        label: 'Hand • Fine line',
        width: 1200,
        height: 800,
    },
    {
        src: '/showcase/09_star_tattooed_arm.jpg',
        alt: 'Small star tattoos on an arm',
        label: 'Arm • Minimal',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/26_floral_woman_arm_tattoo.jpg',
        alt: 'Floral tattoo on a woman’s forearm',
        label: 'Forearm • Floral',
        width: 1200,
        height: 800,
    },
    {
        src: '/showcase/18_tattooed_hands_intertwined.jpg',
        alt: 'Two tattooed hands intertwined',
        label: 'Hands • Fine line',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/20_tattooed_legs_sidewalk.jpg',
        alt: 'Tattooed legs standing on a sidewalk',
        label: 'Leg • Color',
        width: 1200,
        height: 1600,
    },
    {
        src: '/showcase/04_tattooed_skin_closeup.jpg',
        alt: 'Script tattoo close-up on a shoulder',
        label: 'Shoulder • Script',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/13_suited_tattooed_arm.jpg',
        alt: 'Tattooed forearm under a rolled-up suit sleeve',
        label: 'Forearm • Black & gray',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/08_spiderweb_tattoo_process.jpg',
        alt: 'Spiderweb tattoo being inked on an elbow',
        label: 'Elbow • In progress',
        width: 1200,
        height: 1800,
    },
    {
        src: '/showcase/25_arm_tattoos_bracelets.jpg',
        alt: 'Ornamental wrist tattoos with bracelets',
        label: 'Wrist • Ornamental',
        width: 1200,
        height: 1800,
    },
]

export default function ShowcaseGallery() {
    return (
        <section className="py-20" aria-label="Tattoo inspiration gallery">
            <div className="mx-auto max-w-6xl px-4">
                <div className="text-center">
                    <span className="text-sm font-bold uppercase tracking-wider text-yellow-600">Ink Inspiration</span>
                    <h2 className="text-balance mt-2 text-4xl font-bold md:text-5xl">
                        Real Ink, <span className="text-yellow-500">Real Skin</span>
                    </h2>
                    <p className="mx-auto mt-4 max-w-3xl text-xl leading-relaxed text-gray-600">
                        Every placement below is one you can preview on your own skin — arms, hands, back, chest, and more
                    </p>
                </div>

                <div className="mt-12 columns-2 gap-4 sm:columns-3 lg:columns-4">
                    {photos.map((photo, i) => (
                        <motion.div
                            key={photo.src}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-40px' }}
                            transition={{ duration: 0.45, delay: (i % 4) * 0.08, ease: 'easeOut' }}
                            className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-black/10 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[8px_8px_0_0_theme(colors.yellow.400)]"
                        >
                            <Image
                                src={photo.src}
                                alt={photo.alt}
                                width={photo.width}
                                height={photo.height}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                className="h-auto w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div
                                aria-hidden
                                className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            />
                            <span className="absolute bottom-3 left-3 translate-y-2 rounded-full bg-black/70 px-3 py-1 text-xs font-bold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                                {photo.label}
                            </span>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <Link
                        href="/studio"
                        className="group inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_theme(colors.yellow.400)]"
                    >
                        See it on your skin
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
