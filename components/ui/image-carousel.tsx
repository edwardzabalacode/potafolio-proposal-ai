'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { BrutalistButton } from './brutalist-button'
import { cn } from '@/lib/utils'

interface ImageCarouselProps {
  images: string[]
  className?: string
  title?: string
}

export function ImageCarousel({
  images,
  className,
  title,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (!images || images.length === 0) {
    return null
  }

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const openModal = (index: number) => {
    setCurrentIndex(index)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Image Modal Component
  const ImageModal = () => (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={closeModal}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative h-auto w-auto"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex]}
                alt={
                  title
                    ? `${title} - Screenshot ${currentIndex + 1}`
                    : `Screenshot ${currentIndex + 1}`
                }
                width={1200}
                height={800}
                className="max-h-[90vh] w-auto object-contain"
              />

              {/* Close button */}
              <button
                onClick={closeModal}
                className="absolute right-4 top-4 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-70"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation buttons for modal */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={goToPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-70"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={goToNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2 text-white transition-opacity hover:bg-opacity-70"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                </>
              )}

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black bg-opacity-50 px-4 py-2 text-white">
                {currentIndex + 1} / {images.length}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  // Single image display
  if (images.length === 1) {
    return (
      <div className={cn('space-y-4', className)}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative h-96 w-full cursor-pointer border-4 border-border shadow-brutal-large transition-colors duration-300 hover:border-accent-green"
          onClick={() => openModal(0)}
        >
          <Image
            src={images[0]}
            alt={title ? `${title} - Screenshot` : 'Project screenshot'}
            fill
            className="object-cover"
          />
        </motion.div>
        {isModalOpen && <ImageModal />}
      </div>
    )
  }

  // Multiple images carousel
  return (
    <div className={cn('space-y-4', className)}>
      {/* Main carousel image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative h-96 w-full cursor-pointer border-4 border-border shadow-brutal-large transition-colors duration-300 hover:border-accent-green"
        onClick={() => openModal(currentIndex)}
      >
        <Image
          src={images[currentIndex]}
          alt={
            title
              ? `${title} - Screenshot ${currentIndex + 1}`
              : `Screenshot ${currentIndex + 1}`
          }
          fill
          className="object-cover"
        />

        {/* Navigation arrows */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 transition-opacity hover:opacity-100">
          <BrutalistButton
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              goToPrevious()
            }}
            className="bg-black/50 backdrop-blur-sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </BrutalistButton>
          <BrutalistButton
            variant="outline"
            size="sm"
            onClick={e => {
              e.stopPropagation()
              goToNext()
            }}
            className="bg-black/50 backdrop-blur-sm"
          >
            <ChevronRight className="h-4 w-4" />
          </BrutalistButton>
        </div>

        {/* Image counter overlay */}
        <div className="absolute bottom-4 right-4 rounded bg-black/50 px-2 py-1 font-mono text-xs text-white backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </motion.div>

      {/* Thumbnail navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              'relative h-16 w-16 flex-shrink-0 border-2 transition-all duration-300',
              currentIndex === index
                ? 'shadow-brutal-sm border-accent-green'
                : 'hover:border-accent-green/50 border-border'
            )}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </motion.button>
        ))}
      </div>

      {/* Modal */}
      <ImageModal />
    </div>
  )
}
