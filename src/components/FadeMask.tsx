import React, { useEffect, useRef, useState } from 'react'

import { cn } from '../utils/cn'

interface FadeMaskProps {
  children: React.ReactNode
  className?: string
  fadeHeight?: number | string
  showMask?: boolean
}

export const FadeMask: React.FC<FadeMaskProps> = ({ children, className = '', fadeHeight = 24, showMask = true }) => {
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scrollRef.current

    if (!el) return

    const handleScroll = () => {
      setShowTopFade(el.scrollTop > 0)
      setShowBottomFade(Math.ceil(el.scrollTop + el.clientHeight) < el.scrollHeight)
    }

    const handleResize = () => {
      handleScroll()
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', handleResize)

    return () => {
      el.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [children])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {showMask && (
        <div
          className="pointer-events-none absolute top-0 left-0 w-full z-10"
          style={{ height: fadeHeight, opacity: showTopFade ? 1 : 0, transition: 'opacity 0.1s' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-background to-transparent z-10" />
        </div>
      )}

      <div ref={scrollRef} className="overflow-y-auto max-h-full">
        {children}
      </div>

      {showMask && (
        <div
          className="pointer-events-none absolute bottom-0 left-0 w-full z-10"
          style={{ height: fadeHeight, opacity: showBottomFade ? 1 : 0, transition: 'opacity 0.1s' }}
        >
          <div className="w-full h-full bg-gradient-to-t from-background to-transparent z-10" />
        </div>
      )}
    </div>
  )
}
