import { Component, ErrorInfo, ReactNode } from 'react'
import { Box, Flex } from '@styled-system/jsx'
import { Button } from './ui/button'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Log básico - logger pode ser implementado depois
    console.error('React Error Boundary', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Flex
          w="100%"
          h="200px"
          direction="column"
          align="center"
          justify="center"
          bg="rgba(255, 0, 0, 0.05)"
          border="1px solid rgba(255, 0, 0, 0.2)"
          borderRadius="12px"
          p="24px"
          gap="16px"
        >
          <Flex align="center" gap="8px" color="red.600">
            <AlertTriangle size={20} />
            <Box fontSize="16px" fontWeight="600">
              Erro no Sistema de Áudio
            </Box>
          </Flex>

          <Box fontSize="14px" color="gray.600" textAlign="center" maxW="300px">
            Ocorreu um erro inesperado. Tente reiniciar o componente ou recarregue a aplicação.
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Box
              fontSize="12px"
              color="red.500"
              bg="red.50"
              p="8px"
              borderRadius="4px"
              fontFamily="monospace"
              maxW="400px"
              overflow="auto"
            >
              {this.state.error.message}
            </Box>
          )}

          <Flex gap="8px">
            <Button size="sm" variant="outline" onClick={this.handleReset}>
              <RotateCcw size={14} style={{ marginRight: '4px' }} />
              Tentar Novamente
            </Button>
            <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>
              Recarregar App
            </Button>
          </Flex>
        </Flex>
      )
    }

    return this.props.children
  }
}

// Hook para uso funcional
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Error handled by useErrorHandler:', error)

    // Log básico - logger pode ser implementado depois
    console.error('Manual Error Handler', {
      error: error.message,
      stack: error.stack,
      info: errorInfo
    })
  }

  return { handleError }
}
