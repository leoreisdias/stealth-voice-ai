import { css } from '@styled-system/css'
import { Headphones, Mic, Settings } from 'lucide-react'
import { motion } from 'motion/react'
import { BoxMotion, FlexMotion } from './ui/motion'

export const Hero = () => {
  return (
    <BoxMotion className={css({ textAlign: 'center', h: 'fit-content', overflow: 'visible' })}>
      <div className={css({ position: 'relative', display: 'inline-block', mb: '0' })}>
        <BoxMotion
          animate={{
            y: ['0%', '-6%', '0%', '6%', '0%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear'
          }}
        >
          <div
            className={css({
              position: 'absolute',
              inset: '-1',
              bgGradient: 'to-r',
              gradientFrom: 'stealth.purple',
              gradientTo: 'stealth.blue',
              opacity: 0.75,
              borderRadius: 'full',
              blur: 'md'
            })}
          />
          <div
            className={css({
              position: 'relative',
              bg: 'stealth.dark',
              p: '2',
              borderRadius: 'full'
            })}
          >
            <Mic className={css({ h: '10', w: '10', color: 'white' })} />
          </div>
        </BoxMotion>
      </div>

      <h1
        className={css({
          fontSize: { base: '4xl', md: '6xl' },
          fontWeight: 'bold',
          mb: '2',
          bgGradient: 'to-r',
          gradientFrom: 'stealth.purple',
          gradientTo: 'stealth.blue',
          bgClip: 'text',
          color: 'transparent'
        })}
      >
        Stealth Audio
      </h1>

      <div
        className={css({
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2',
          mb: '6'
        })}
      >
        <Headphones className={css({ h: '5', w: '5', color: 'stealth.blue' })} />
        <p className={css({ fontSize: 'lg', color: 'gray.300' })}>Intelligent Audio Assistant</p>
        <Settings className={css({ h: '5', w: '5', color: 'stealth.blue', animation: 'pulse' })} />
      </div>

      <p className={css({ fontSize: 'xl', maxWidth: '2xl', mx: 'auto', color: 'gray.400' })}>
        Your personal audio companion that listens, transcribes, and enhances your conversations
        with AI-powered insights.
      </p>
    </BoxMotion>
  )
}
