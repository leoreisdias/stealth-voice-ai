import { Messages } from '@renderer/components/messages'
import { Recorder } from '@renderer/components/recorder'
import { Ripple } from '@renderer/components/ripple'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { PopoverContext } from '@renderer/contexts/popover'
import { Flex, Box, Divider } from '@styled-system/jsx'
import { CoreMessage } from 'ai'
import { Cog, Eraser, GripVertical } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

export default function Popover() {
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [inputValue, setInputValue] = useState<string>('')
  const [askingAI, setAskingAI] = useState<boolean>(false)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  const isLoadingFirstResponse = messages.length <= 1 && isProcessing

  const onAskAI = async () => {
    if (!inputValue.trim()) return

    setAskingAI(true)

    const prompt: CoreMessage[] = [
      ...messages,
      {
        role: 'user',
        content: `User comment to you (assistant): ${inputValue}`
      }
    ]

    setInputValue('')

    const newMsgs = await window.api.tips.generate({
      messages: prompt
    })

    setAskingAI(false)

    setMessages(newMsgs)
  }

  return (
    <Flex
      w="screen"
      h="screen"
      alignItems="flex-start"
      justifyContent="flex-start"
      flexDirection="column"
      gap="8px"
      style={{
        // @ts-ignore electron needs this
        WebkitAppRegion: 'no-drag'
      }}
    >
      <Flex
        w="100%"
        borderRadius="12px"
        paddingLeft="16px"
        paddingRight="1"
        py="8px"
        alignItems="center"
        gap="12px"
        border="1px solid rgba(255, 255, 255, 0.3)"
        background="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(20px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        style={{
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <PopoverContext.Provider value={{ setMessages, isProcessing, setIsProcessing, messages }}>
          <Recorder />
        </PopoverContext.Provider>

        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

        <Flex alignItems="center" gap="6px" flex="1">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            size="sm"
            border="none"
            flex="1"
            _focus={{
              borderColor: 'transparent',
              boxShadow: 'none'
            }}
          />
          <Button
            variant="ghost"
            color="fg.muted"
            size="sm"
            fontSize="14px"
            fontWeight="500"
            fontFamily="system-ui, -apple-system, sans-serif"
            onClick={onAskAI}
            loading={askingAI}
          >
            Ask AI
          </Button>
          <Flex alignItems="center" gap="2px">
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              ⌘
            </Box>
            <Box color="rgba(0, 0, 0, 0.5)" fontSize="12px" fontWeight="500">
              ⌥
            </Box>
          </Flex>
        </Flex>

        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

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

        <Flex align="center">
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
          {/* Reset Icon */}
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
      </Flex>

      <AnimatePresence>
        {isLoadingFirstResponse && (
          <Box w="100%" h="400px" position="relative" bg="rgba(255, 255, 255, 0.2)" rounded="md">
            <Ripple />
          </Box>
        )}
        {!isLoadingFirstResponse && messages.length > 0 && !!messages[messages.length - 1] && (
          <Messages messages={messages} />
        )}
      </AnimatePresence>
    </Flex>
  )
}
