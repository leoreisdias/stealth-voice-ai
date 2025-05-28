import { createContext, useContext } from 'react'

type ContextProps = {
  currentTip: string
  setCurrentTip: (tip: string) => void
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
