import { Box, Flex } from '@styled-system/jsx'
import { Button } from '../ui/button'
import { Cog, Eraser, GripVertical } from 'lucide-react'
import { usePopoverAI } from '@renderer/contexts/popover-contexts'
import { memo } from 'react'

const EraseButton = () => {
  const { setMessages } = usePopoverAI()

  return (
    <Button
      variant="ghost"
      size="xs"
      onClick={() => {
        setMessages([])
      }}
      p={0}
      w="fit"
      cursor="pointer"
      style={{
        // @ts-ignore electron needs this
        WebkitAppRegion: 'no-drag'
      }}
    >
      <Box color="rgba(0, 0, 0, 0.6)">
        <Eraser size={18} />
      </Box>
    </Button>
  )
}

export const Configs = memo(() => {
  return (
    <Flex align="center">
      <Flex alignItems="center" gap="6px">
        <Button
          variant="link"
          color="fg.muted"
          fontSize="14px"
          fontWeight="500"
          fontFamily="system-ui, -apple-system, sans-serif"
          onClick={() => window.api.togglePopover()}
          _hover={{
            color: 'fg.default',
            textDecoration: 'underline'
          }}
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.api.openConfig()}
        p={1}
        cursor="pointer"
        style={{
          // @ts-ignore electron needs this
          WebkitAppRegion: 'no-drag'
        }}
      >
        <Box color="rgba(0, 0, 0, 0.6)">
          <Cog size={20} />
        </Box>
      </Button>
      {/* <EraseButton /> */}
      <Button
        variant="ghost"
        p={1}
        size="xs"
        cursor="move"
        style={{
          // @ts-ignore electron needs this
          WebkitAppRegion: 'drag'
        }}
      >
        <Box color="rgba(0, 0, 0, 0.4)">
          <GripVertical size={24} />
        </Box>
      </Button>
    </Flex>
  )
})
