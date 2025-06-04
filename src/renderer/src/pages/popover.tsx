import { Configs } from '@renderer/components/popover/configs'
import { Assistant } from '@renderer/components/popover/messages'
import { Recorder } from '@renderer/components/popover/recorder'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { ErrorBoundary } from '@renderer/components/error-boundary'
import { usePopoverAI } from '@renderer/contexts/popover-contexts'
import { PopoverProvider } from '@renderer/contexts/popover-provider'
import { Flex, Box, Divider } from '@styled-system/jsx'
import { useState } from 'react'

const ChatInput = () => {
  const { messages, setMessages, pauseAutoProcessing, resumeAutoProcessing } = usePopoverAI()

  const [inputValue, setInputValue] = useState<string>('')

  const [askingAI, setAskingAI] = useState<boolean>(false)

  const onAskAI = async () => {
    if (!inputValue.trim()) return
    setInputValue('')

    setAskingAI(true)
    pauseAutoProcessing()

    const prompt = messages

    // const { systemTranscript, userTranscript } = await processLastSegment()
    // if (!!systemTranscript || !!userTranscript) {
    //   prompt.push({
    //     role: 'user',
    //     content: `Last audio captured (user): ${userTranscript}; system: ${systemTranscript}`
    //   })
    // }

    prompt.push({
      role: 'user',
      content: `The user added the following message for you: ${inputValue}`
    })

    const newMsgs = await window.api.tips.generate({
      messages: prompt
    })

    setAskingAI(false)
    setTimeout(resumeAutoProcessing, 5000)

    setMessages(newMsgs)
  }

  return (
    <Flex alignItems="center" gap="6px" flex="1">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onAskAI()
          }
        }}
        p={0}
        size="sm"
        fontSize="xs"
        border="1px dashed rgba(0, 0, 0, 0.1)"
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
  )
}

function Popover() {
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
        <ErrorBoundary>
          <Recorder />
        </ErrorBoundary>

        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

        <ChatInput />

        <Divider orientation="vertical" borderColor="rgba(0, 0, 0, 0.1)" h="20px" />

        <Configs />
      </Flex>

      <ErrorBoundary>
        <Assistant />
      </ErrorBoundary>
    </Flex>
  )
}

export default function PopoverPage() {
  return (
    <PopoverProvider>
      <Popover />
    </PopoverProvider>
  )
}
