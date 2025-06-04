import { CoreMessage } from 'ai'
import { createContext, Dispatch, SetStateAction, useContext } from 'react'

type ContextProps = {
  setMessages: Dispatch<SetStateAction<CoreMessage[]>>
  messages: CoreMessage[]
  isProcessing: boolean
  setIsProcessing: Dispatch<SetStateAction<boolean>>
  isPaused: boolean
  pauseAutoProcessing: () => void
  resumeAutoProcessing: () => void
}

export const PopoverContext = createContext({} as ContextProps)

export const usePopoverAI = () => {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error('usePopoverContext must be used within a PopoverProvider')
  }
  return context
}
