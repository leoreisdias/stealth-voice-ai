import { forwardRef, ReactNode } from 'react'
import { Button as StyledButton, type ButtonProps as StyledButtonProps } from './styled/button'
import { Center, styled } from '@styled-system/jsx'
import { Spinner } from './spinner'
import { css } from '@styled-system/css'

interface ButtonLoadingProps {
  loading?: boolean
  loadingText?: React.ReactNode
}

export interface ButtonProps extends StyledButtonProps, ButtonLoadingProps {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { loading, disabled, loadingText, children, ...rest } = props

  const trulyDisabled = loading || disabled

  return (
    <StyledButton disabled={trulyDisabled} ref={ref} {...rest}>
      {loading && !loadingText ? (
        <>
          <ButtonSpinner />
          <styled.span opacity={0}>{children}</styled.span>
        </>
      ) : loadingText ? (
        loadingText
      ) : (
        children
      )}
    </StyledButton>
  )
})

Button.displayName = 'Button'

const ButtonSpinner = () => (
  <Center inline position="absolute" transform="translate(-50%, -50%)" top="50%" insetStart="50%">
    <Spinner
      width="1.1em"
      height="1.1em"
      borderWidth="1.5px"
      borderTopColor="fg.disabled"
      borderRightColor="fg.disabled"
    />
  </Center>
)

export const ButtonGlow = ({ children }: { children: ReactNode }) => {
  return (
    <button
      className={css({
        position: 'relative',
        display: 'inline-flex',
        h: '12', // h-12 → theme.space[12] = 3rem
        overflow: 'hidden',
        borderRadius: 'lg',
        p: '1px', // p-[1px]
        _focus: {
          outline: 'none',
          boxShadow: '0 0 0 2px var(--colors-slate-50), 0 0 0 2px var(--colors-slate-400)'
        }
      })}
    >
      <span
        className={css({
          position: 'absolute',
          inset: '-1000%',
          animation: 'spin 2s linear infinite',
          backgroundImage:
            'conic-gradient(from 90deg at 50% 50%, #E2CBFF 0%, #393BB2 50%, #E2CBFF 100%)'
        })}
      />
      <span
        className={css({
          display: 'inline-flex',
          w: 'full', // w-full → 100%
          h: 'full', // h-full → 100%
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'lg',
          bg: 'slate.950',
          px: '3', // px-3
          py: '1', // py-1
          fontSize: 'sm',
          fontWeight: 'medium',
          color: 'white',
          backdropFilter: 'blur(64px)' // aproxima blur-3xl
        })}
      >
        {children}
      </span>
    </button>
  )
}
