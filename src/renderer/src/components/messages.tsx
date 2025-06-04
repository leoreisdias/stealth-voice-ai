import { Box, Flex } from '@styled-system/jsx'
import { BoxMotion } from './ui/motion'
import ReactMarkdown from 'react-markdown'
import { Text } from './ui/text'
import { CoreMessage } from 'ai'

const MarkdownResponse = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <Text as="h1" fontSize="18px" fontWeight="700" color="black" mb="12px" mt="8px">
            {children}
          </Text>
        ),
        h2: ({ children }) => (
          <Text as="h2" fontSize="16px" fontWeight="600" color="black" mb="10px" mt="16px">
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
      {content}
    </ReactMarkdown>
  )
}

export const Messages = ({ messages }: { messages: CoreMessage[] }) => {
  const aiMessages = messages.filter((msg) => msg.role === 'assistant')

  return (
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
        {aiMessages.map((msg) => {
          if (typeof msg.content === 'string') {
            return <MarkdownResponse key={msg.content} content={msg.content} />
          }

          return msg.content
            .filter((part) => part.type === 'text')
            .map((part, partIndex) => <MarkdownResponse key={partIndex} content={part.text} />)
        })}
      </Box>
    </BoxMotion>
  )
}
