import { css } from '@styled-system/css'
import React, { ComponentPropsWithoutRef, CSSProperties } from 'react'

interface RippleProps extends ComponentPropsWithoutRef<'div'> {
  mainCircleSize?: number
  mainCircleOpacity?: number
  numCircles?: number
}

export const Ripple = React.memo(function Ripple({
  mainCircleSize = 100,
  mainCircleOpacity = 0.24,
  numCircles = 3,
  ...props
}: RippleProps) {
  return (
    <div
      className={css({
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        overflow: 'hidden',
        userSelect: 'none',
        maskImage: 'linear-gradient(to bottom, white, white)'
      })}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70
        const opacity = mainCircleOpacity - i * 0.03
        const animationDelay = `${i * 0.06}s`
        const borderStyle = 'solid'

        return (
          <div
            key={i}
            className={css({
              position: 'absolute',
              animationName: 'ripple',
              animation: 'ripple 1.2s ease-out infinite',
              borderRadius: 'full',
              border: '1px solid',
              borderColor: 'foreground',
              bg: '#000000/25',
              boxShadow: 'xl'
            })}
            style={
              {
                '--i': i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: '1px',
                borderColor: `rgba(255, 255, 255, 0.9)`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)'
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
})

Ripple.displayName = 'Ripple'
