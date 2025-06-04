import { ReactNode, useCallback, useState, useMemo } from 'react'
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

  const contextValue = useMemo(
    () => ({
      setMessages,
      messages,
      isProcessing,
      setIsProcessing,
      isPaused,
      pauseAutoProcessing,
      resumeAutoProcessing
    }),
    [messages, isProcessing, isPaused, pauseAutoProcessing, resumeAutoProcessing]
  )

  return <PopoverContext.Provider value={contextValue}>{children}</PopoverContext.Provider>
}
