import { Recorder } from '@renderer/components/recorder'
import { Ripple } from '@renderer/components/ripple'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { BoxMotion } from '@renderer/components/ui/motion'
import { Text } from '@renderer/components/ui/text'
import { PopoverContext } from '@renderer/contexts/popover'
import { Flex, Box, Divider } from '@styled-system/jsx'
import { Cog, GripVertical } from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

// src/renderer/pages/Popover.tsx
export default function Popover() {
  const [currentTip, setCurrentTip] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState<boolean>(false)

  return (
    <Flex
      w="screen"
      h="screen"
      alignItems="flex-start"
      justifyContent="flex-start"
      flexDirection="column"
      gap="8px"
      p="8px"
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
        background="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(20px)"
        boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
        style={{
          WebkitBackdropFilter: 'blur(20px)'
        }}
      >
        <PopoverContext.Provider
          value={{ currentTip, setCurrentTip, isProcessing, setIsProcessing }}
        >
          {/* Play/Pause Button */}
          <Recorder />
        </PopoverContext.Provider>

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
            color="fg.muted"
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
            // @ts-ignore electron needs this
            WebkitAppRegion: 'drag'
          }}
        >
          <Box color="rgba(0, 0, 0, 0.4)">
            <GripVertical size={24} />
          </Box>
        </Button>
      </Flex>

      <AnimatePresence>
        {/* Markdown Content Popover */}

        {isProcessing && (
          <Box w="100%" h="400px" position="relative" bg="rgba(255, 255, 255, 0.2)" rounded="md">
            <Ripple />
          </Box>
        )}
        {!!currentTip && (
          <BoxMotion
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            w="100%"
            maxH="400px"
            borderRadius="12px"
            p="16px"
            border="1px solid rgba(255, 255, 255, 0.3)"
            overflowY="auto"
            backgroundColor="rgba(255, 255, 255, 0.8)"
            backdropFilter="blur(20px)"
            WebkitBackdropFilter="blur(20px)"
            boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
            scrollbarWidth="thin"
            scrollbarColor="rgba(0, 0, 0, 0.1) transparent"
            style={{
              // @ts-ignore electron needs this
              WebkitAppRegion: 'no-drag'
            }}
            css={{
              '&::-webkit-scrollbar': {
                width: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent'
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.1)',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: 'rgba(0, 0, 0, 0.2)'
              }
            }}
          >
            <Flex alignItems="center" gap="8px" mb="12px">
              <Box
                w="20px"
                h="20px"
                borderRadius="50%"
                bg="rgba(0, 0, 0, 0.1)"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Box fontSize="12px">🤖</Box>
              </Box>
              <Box
                color="rgba(0, 0, 0, 0.7)"
                fontSize="14px"
                fontWeight="600"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                AI Response
              </Box>
            </Flex>

            <Box
              color="rgba(0, 0, 0, 0.8)"
              fontSize="14px"
              lineHeight="1.6"
              fontFamily="system-ui, -apple-system, sans-serif"
              fontWeight={400}
            >
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <Text as="h1" fontSize="18px" fontWeight="700" color="black" mb="12px" mt="8px">
                      {children}
                    </Text>
                  ),
                  h2: ({ children }) => (
                    <Text
                      as="h2"
                      fontSize="16px"
                      fontWeight="600"
                      color="black"
                      mb="10px"
                      mt="16px"
                    >
                      {children}
                    </Text>
                  ),
                  h3: ({ children }) => (
                    <Text as="h3" fontSize="15px" fontWeight="600" color="black" mb="8px" mt="12px">
                      {children}
                    </Text>
                  ),
                  p: ({ children }) => (
                    <Text as="p" mb="12px" lineHeight="1.6">
                      {children}
                    </Text>
                  ),
                  ol: ({ children }) => (
                    <Text as="ol" ml="20px" mb="12px">
                      {children}
                    </Text>
                  ),
                  ul: ({ children }) => (
                    <Text as="ul" ml="20px" mb="12px">
                      {children}
                    </Text>
                  ),
                  li: ({ children }) => (
                    <Text as="li" mb="4px" lineHeight="1.5" listStyle={'disc'}>
                      {children}
                    </Text>
                  ),
                  strong: ({ children }) => (
                    <Text as="strong" fontWeight="600" color="black">
                      {children}
                    </Text>
                  )
                }}
              >
                {currentTip}
              </ReactMarkdown>
            </Box>
          </BoxMotion>
        )}
      </AnimatePresence>
    </Flex>
  )
}
