"use client";

import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export const DEFAULT_GALLERY_IMAGES = [
  "/_53A6975.jpg",
  "/DSCF1186.jpg",
  "/TYLA_DEFILE-28.jpg",
  "/TYLA-284.jpg",
  "/IMG_3252_log.jpg",
  "/images/DSC_7618.jpg",
  "/images/backstage-02.jpg",
  "/images/committee-award.jpg",
  "/images/DSCF1413-1-.jpg",
  "/images/IMG_25.jpeg",
  "/images/IMG_2522.JPEG",
  "/images/IMG_2532.JPEG",
];

export const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1550614000-4b95d4ed798a?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
];

interface ImageCardProps {
  src: string;
  onLoad?: () => void;
}

const ImageCard = ({ src, onLoad }: ImageCardProps) => {
  return (
    <div className="w-full h-[220px] sm:h-[320px] md:h-[420px] flex-shrink-0 bg-noir-soft transition-transform duration-300 hover:scale-[1.03] cursor-pointer relative will-change-transform backface-hidden preserve-3d rounded-sm overflow-hidden border border-taupe/30 shadow-lg">
      <img
        src={src}
        alt="Photo J'AFFIRME Fashion Week"
        loading="eager"
        decoding="async"
        onLoad={onLoad}
        className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-300"
      />
    </div>
  );
};

export interface ParallaxGalleryProps {
  images?: string[];
  standalone?: boolean;
  title?: string;
  subtitle?: string;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function Component({
  images = DEFAULT_GALLERY_IMAGES,
  standalone = false,
  title = "L’émotion de nos évènements précédents",
  subtitle = "Galerie",
}: ParallaxGalleryProps) {
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const loadedCountRef = useRef(0);

  const baseList = useMemo(() => {
    return images && images.length > 0 ? images : DEFAULT_GALLERY_IMAGES;
  }, [images]);

  // Mélange aléatoire (Shuffle) des photos choisies à chaque chargement/rechargement
  const [shuffledList, setShuffledList] = useState<string[]>(baseList);

  useEffect(() => {
    setShuffledList(shuffleArray(baseList));
  }, [baseList]);

  const handleItemLoad = useCallback(() => {
    loadedCountRef.current += 1;
    if (!isReady && loadedCountRef.current >= 1) setIsReady(true);
  }, [isReady]);

  useEffect(() => {
    const t = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(t);
  }, []);

  const colMedia = useMemo(() => {
    const list = shuffledList;
    const count = list.length;
    if (count === 0) return { col1: [], col2: [], col3: [], col4: [] };

    // Partition stricte : chaque image apparaît UNE SEULE FOIS dans TOUTE la galerie (zéro doublon)
    const col1: string[] = [];
    const col2: string[] = [];
    const col3: string[] = [];
    const col4: string[] = [];

    list.forEach((img, index) => {
      const colIndex = index % 4;
      if (colIndex === 0) col1.push(img);
      else if (colIndex === 1) col2.push(img);
      else if (colIndex === 2) col3.push(img);
      else col4.push(img);
    });

    return {
      col1,
      col2,
      col3,
      col4,
    };
  }, [shuffledList]);

  // LINKED SCROLL: tracks scroll container if standalone, or tracks page scroll if embedded in site
  const { scrollYProgress } = useScroll({
    target: containerRef,
    ...(standalone && scrollWrapperRef.current ? { container: scrollWrapperRef } : {}),
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 25,
    mass: 0.4,
  });

  // Banner animations
  const bannerWidth = useTransform(smoothProgress, [0, 0.15], ["92vw", "100vw"]);
  const bannerHeight = useTransform(smoothProgress, [0, 0.15], ["85vh", "100vh"]);
  const bannerRadius = useTransform(smoothProgress, [0, 0.15], ["24px", "0px"]);
  const bannerBorderWidth = useTransform(smoothProgress, [0, 0.15], ["2px", "0px"]);

  // 3D Matrix animations (clamped at [0, 0.15, 1] to prevent extreme out-of-bounds extrapolation)
  const rotateY = useTransform(smoothProgress, [0, 0.15, 1], [-40, -40, -6]);
  const rotateX = useTransform(smoothProgress, [0, 0.15, 1], [22, 22, 2]);
  const rotateZ = useTransform(smoothProgress, [0, 0.15, 1], [12, 12, 0]);
  const translateZ = useTransform(smoothProgress, [0, 0.15, 1], [-700, -700, 0]);

  // Track columns parallax animations (ajustés pour les 3 cartes par colonne sans doublon)
  const yCol1 = useTransform(smoothProgress, [0, 0.15, 1], ["0%", "0%", "-22%"]);
  const yCol2 = useTransform(smoothProgress, [0, 0.15, 1], ["-18%", "-18%", "8%"]);
  const yCol3 = useTransform(smoothProgress, [0, 0.15, 1], ["0%", "0%", "-22%"]);
  const yCol4 = useTransform(smoothProgress, [0, 0.15, 1], ["-14%", "-14%", "12%"]);

  // Header fade-out on deep scroll
  const headerOpacity = useTransform(smoothProgress, [0, 0.12, 0.3], [1, 0.9, 0]);
  const headerY = useTransform(smoothProgress, [0, 0.2], [0, -30]);

  const content = (
    <section
      ref={containerRef}
      className="relative w-full h-[320vh] md:h-[380vh] bg-noir text-white font-sans selection:bg-or selection:text-noir"
    >
      <div className="sticky top-0 h-screen w-full flex justify-center items-center overflow-hidden">
        {/* Floating title overlay */}
        <motion.div
          style={{ opacity: headerOpacity, y: headerY }}
          className="pointer-events-none absolute top-10 md:top-14 z-30 text-center px-6"
        >
          <p className="font-body text-xs uppercase tracking-[0.35em] text-or">{subtitle}</p>
          <h2 className="mt-2 font-display text-2xl font-semibold text-ivoire sm:text-4xl md:text-5xl drop-shadow-lg">
            {title}
          </h2>
          <p className="mt-2 text-[11px] tracking-[0.25em] text-ivoire/60 uppercase font-body">
            Faites défiler pour explorer l&apos;univers
          </p>
        </motion.div>

        <motion.div
          style={{
            width: bannerWidth,
            height: bannerHeight,
            borderRadius: bannerRadius,
            borderWidth: bannerBorderWidth,
            borderColor: "rgba(211, 159, 45, 0.25)",
          }}
          className="relative bg-noir overflow-hidden flex items-center justify-center max-w-[1920px] mx-auto will-change-transform backface-hidden preserve-3d"
        >
          <div
            className="absolute inset-0 flex justify-center items-center pointer-events-none"
            style={{ perspective: "1200px" }}
          >
            {/* Ambient Shadow Box Masking */}
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_0_100px_140px_-40px_rgba(10,10,10,1),inset_0_-100px_140px_-40px_rgba(10,10,10,1)]" />
            <div className="absolute inset-0 z-20 pointer-events-none shadow-[inset_140px_0_140px_-40px_rgba(10,10,10,1),inset_-140px_0_140px_-40px_rgba(10,10,10,1)]" />

            {/* Parallax Image Grid Matrix */}
            <motion.div
              style={{
                rotateX,
                rotateY,
                rotateZ,
                z: translateZ,
                transformStyle: "preserve-3d",
              }}
              className="flex gap-4 md:gap-6 justify-center items-center w-[130vw] h-[160vh] origin-center opacity-100 will-change-transform backface-hidden"
            >
              <motion.div style={{ y: yCol1 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[180px] pointer-events-auto">
                {colMedia.col1.map((src, index) => (
                  <ImageCard key={`col1-${index}`} src={src} onLoad={handleItemLoad} />
                ))}
              </motion.div>

              <motion.div style={{ y: yCol2 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[180px] pointer-events-auto">
                {colMedia.col2.map((src, index) => (
                  <ImageCard key={`col2-${index}`} src={src} onLoad={handleItemLoad} />
                ))}
              </motion.div>

              <motion.div style={{ y: yCol3 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[180px] pointer-events-auto">
                {colMedia.col3.map((src, index) => (
                  <ImageCard key={`col3-${index}`} src={src} onLoad={handleItemLoad} />
                ))}
              </motion.div>

              <motion.div style={{ y: yCol4 }} className="flex flex-col gap-4 md:gap-6 w-[22vw] min-w-[180px] pointer-events-auto">
                {colMedia.col4.map((src, index) => (
                  <ImageCard key={`col4-${index}`} src={src} onLoad={handleItemLoad} />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );

  if (standalone) {
    return (
      <div 
        ref={scrollWrapperRef}
        className="w-full h-screen overflow-y-auto overflow-x-hidden bg-[#0A0A0A]"
      >
        {content}
      </div>
    );
  }

  return content;
}
