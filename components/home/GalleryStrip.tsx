'use client';

import ParallaxGallery from '@/components/ui/3d-parallax-unfurling-gallery';

const GALLERY_IMAGES = [
  '/_53A6975.jpg',
  '/DSCF1186.jpg',
  '/TYLA_DEFILE-28.jpg',
  '/TYLA-284.jpg',
  '/IMG_3252_log.jpg',
  '/images/DSC_7618.jpg',
  '/images/backstage-02.jpg',
  '/images/committee-award.jpg',
  '/images/DSCF1413-1-.jpg',
  '/images/IMG_25.jpeg',
  '/images/IMG_2522.JPEG',
  '/images/IMG_2532.JPEG',
];

export function GalleryStrip() {
  return (
    <ParallaxGallery
      images={GALLERY_IMAGES}
      title="L’émotion de nos évènements précédents"
      subtitle="Galerie"
    />
  );
}
