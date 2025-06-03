import { CoreMessage } from 'ai'
import { createContext, Dispatch, SetStateAction, useContext } from 'react'

type ContextProps = {
  setMessages: Dispatch<SetStateAction<CoreMessage[]>>
  messages: CoreMessage[]
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export const PopoverContext = createContext({} as ContextProps)

export const usePopoverContext = () => {
  const context = useContext(PopoverContext)
  if (!context) {
    throw new Error('usePopoverContext must be used within a PopoverProvider')
  }
  return context
}
