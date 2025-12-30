"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { GalleryImage, getAllGalleryImages } from "@/services/galleryImageService"
import { Loader2 } from "lucide-react"

export function AboutGallerySection() {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const data = await getAllGalleryImages()
                setImages(data)
            } catch (error) {
                console.error("Failed to fetch gallery images:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchImages()
    }, [])

    return (
        <section className="py-16 md:py-24">
            <div className="container">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-block rounded-lg bg-pink-100 px-3 py-1 text-sm font-medium text-pink-800 dark:bg-pink-900/30 dark:text-pink-300">
                        Gallery
                    </div>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight">Moments of Joy</h2>
                    <p className="mt-4 text-muted-foreground">
                        Capturing the excitement, determination, and pure joy of our little champions
                    </p>
                </div>

                <div className="mt-12 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : images.length > 0 ? (
                        images.map((image) => (
                            <div key={image.id} className="relative aspect-square overflow-hidden rounded-lg group">
                                <Image
                                    src={image.image_path.startsWith('/') || image.image_path.startsWith('http') ? image.image_path : `${process.env.NEXT_PUBLIC_API_URL || ''}/${image.image_path}`}
                                    alt={`Gallery Image ${image.id}`}
                                    fill
                                    loading="lazy"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            {/* Fallback to static if no dynamic images? Or just show message? User implied replacement. I will show message if empty or fallback to static if user prefers, currently just empty message. */}
                            No images in gallery yet.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}
