import { css } from '@styled-system/css'

// src/renderer/pages/Popover.tsx
export default function Popover() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        // @ts-ignore electron needs this
        WebkitAppRegion: 'drag' // 👈 esta linha torna o elemento arrastável
      }}
    >
      📢 Dica em tempo real!
    </div>
  )
}
