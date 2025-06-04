import { ReactNode, useCallback, useState } from 'react'
import { PopoverContext } from './popover-contexts'
import { CoreMessage } from 'ai'

export const PopoverProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<CoreMessage[]>([])
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [isPaused, setIsPaused] = useState<boolean>(false)

  const pauseAutoProcessing = useCallback(() => {
    setIsPaused(true)
  }, [])

  const resumeAutoProcessing = useCallback(() => {
    setIsPaused(false)
  }, [])

  return (
    <PopoverContext.Provider
      value={{
        setMessages: setMessages,
        messages: messages,
        isProcessing: isProcessing,
        setIsProcessing: setIsProcessing,
        isPaused: isPaused,
        pauseAutoProcessing,
        resumeAutoProcessing
      }}
    >
      {children}
    </PopoverContext.Provider>
  )
}
