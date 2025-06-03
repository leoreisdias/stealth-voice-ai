import { Hero } from '@renderer/components/hero'
import { Waves } from '@renderer/components/ui/wave'
import { Box, Flex } from '@styled-system/jsx'

export default function Home() {
  return (
    <Box position="relative">
      <Box
        zIndex={0}
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        bg="#1b1b1b"
      >
        <Waves
          lineColor={'#2b2536'}
          backgroundColor="rgba(27, 27, 27, 0.185)"
          waveSpeedX={0.02}
          waveSpeedY={0.01}
          waveAmpX={40}
          waveAmpY={20}
          friction={0.9}
          tension={0.01}
          maxCursorMove={120}
          xGap={12}
          yGap={36}
        />
      </Box>
      <Flex position="relative" zIndex={1} gap={4} flexDir="column" justify={'center'}>
        <Hero />
        {/* <Versions></Versions> */}
      </Flex>
    </Box>
  )
}
