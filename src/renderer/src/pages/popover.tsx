import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Flex, Box, Divider } from '@styled-system/jsx'
import { Cog, GripVertical, Play } from 'lucide-react'

// src/renderer/pages/Popover.tsx
export default function Popover() {
  return (
    <Flex
      w="screen"
      border="1px solid red"
      h="screen"
      alignItems="flex-start"
      justifyContent="center"
      style={{
        // @ts-ignore electron needs this
        WebkitAppRegion: 'no-drag'
      }}
    >
      <Flex
        w="100%"
        borderRadius="12px"
        px="16px"
        py="8px"
        alignItems="center"
        gap="12px"
        border="1px solid rgba(255, 255, 255, 0.3)"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          // @ts-ignore electron needs this
          // WebkitAppRegion: 'drag'
        }}
      >
        {/* Play/Pause Button */}
        <Box
          w="24px"
          h="24px"
          bg="#007AFF"
          borderRadius="50%"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="pointer"
          style={{
            // @ts-ignore electron needs this
            WebkitAppRegion: 'no-drag'
          }}
        >
          <Play size={12} color="white" fill="white" />
        </Box>

        {/* Timer */}
        <Box
          color="rgba(0, 0, 0, 0.8)"
          fontSize="14px"
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          00:00
        </Box>

        {/* Separator */}
        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

        {/* Ask AI Section */}
        <Flex alignItems="center" gap="6px" flex="1">
          <Input
            placeholder="Ask AI"
            size="sm"
            border="none"
            flex="1"
            _focus={{
              borderColor: 'transparent',
              boxShadow: 'none'
            }}
          />
          <Box
            color="rgba(0, 0, 0, 0.8)"
            fontSize="14px"
            fontWeight="500"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Ask AI
          </Box>
          <Flex alignItems="center" gap="2px">
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              ⌘
            </Box>
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              ⌥
            </Box>
          </Flex>
        </Flex>

        {/* Separator */}
        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

        {/* Show/Hide Section */}
        <Flex alignItems="center" gap="6px">
          <Button
            variant="link"
            color="rgba(0, 0, 0, 0.8)"
            fontSize="14px"
            fontWeight="500"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            Show/Hide
          </Button>
          <Flex alignItems="center" gap="2px">
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              ⌘
            </Box>
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              \
            </Box>
          </Flex>
        </Flex>

        {/* Settings Icon */}
        <Button
          variant="ghost"
          size="sm"
          p={1}
          cursor="pointer"
          style={{
            // @ts-ignore electron needs this
            WebkitAppRegion: 'no-drag'
          }}
        >
          <Box color="rgba(0, 0, 0, 0.6)" fontSize="16px">
            <Cog size={20} />
          </Box>
        </Button>
        {/* Settings Icon */}
        <Button
          variant="ghost"
          p={1}
          size="sm"
          cursor="move"
          style={{
            cursor: 'move',
            // @ts-ignore electron needs this
            WebkitAppRegion: 'drag'
          }}
        >
          <Box color="rgba(0, 0, 0, 0.4)">
            <GripVertical size={24} />
          </Box>
        </Button>
      </Flex>
    </Flex>
  )
}
