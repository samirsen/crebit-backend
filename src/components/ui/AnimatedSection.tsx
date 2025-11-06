import React from 'react'
import { useScrollAnimation } from '@/hooks/useScrollAnimation'

interface AnimatedSectionProps {
  children: React.ReactNode
  animation?: 'slideUp' | 'slideLeft' | 'slideRight' | 'fadeIn' | 'scaleUp' | 'flipIn' | 'bounceIn'
  delay?: number
  duration?: number
  className?: string
}

const AnimatedSection: React.FC<AnimatedSectionProps> = ({
  children,
  animation = 'slideUp',
  delay = 0,
  duration = 0.8,
  className = ''
}) => {
  const { elementRef, isVisible } = useScrollAnimation({ threshold: 0.1 })

  const getAnimationClasses = () => {
    const baseClasses = `transition-all ease-out`
    const durationClass = `duration-[${Math.round(duration * 1000)}ms]`
    const delayClass = delay > 0 ? `delay-[${Math.round(delay * 1000)}ms]` : ''

    if (!isVisible) {
      switch (animation) {
        case 'slideUp':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-y-12`
        case 'slideLeft':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-x-12`
        case 'slideRight':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 -translate-x-12`
        case 'fadeIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0`
        case 'scaleUp':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 scale-95`
        case 'flipIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 rotate-y-90`
        case 'bounceIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 scale-50`
        default:
          return `${baseClasses} ${durationClass} ${delayClass} opacity-0 translate-y-12`
      }
    } else {
      switch (animation) {
        case 'slideUp':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 translate-y-0`
        case 'slideLeft':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 translate-x-0`
        case 'slideRight':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 translate-x-0`
        case 'fadeIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100`
        case 'scaleUp':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 scale-100`
        case 'flipIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 rotate-y-0`
        case 'bounceIn':
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 scale-100`
        default:
          return `${baseClasses} ${durationClass} ${delayClass} opacity-100 translate-y-0`
      }
    }
  }

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClasses()} ${className}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`
      }}
    >
      {children}
    </div>
  )
}

export default AnimatedSection
