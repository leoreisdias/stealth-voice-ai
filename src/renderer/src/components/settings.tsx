// src/renderer/pages/OpenAISettings.tsx
import { useState, useEffect } from 'react'
const { ipcRenderer } = window.require('electron')

export default function OpenAISettings() {
  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    ipcRenderer.invoke('openai:get-key').then((key: string) => {
      setApiKey(key)
    })
  }, [])

  const handleSave = async () => {
    await ipcRenderer.invoke('openai:set-key', apiKey)
    alert('Chave salva com sucesso!')
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>🔐 Configurar OpenAI API Key</h2>
      <input
        type="password"
        value={apiKey}
        onChange={(e) => setApiKey(e.target.value)}
        placeholder="sk-..."
        style={{ width: '100%', padding: 8, fontSize: 14 }}
      />
      <button onClick={handleSave} style={{ marginTop: 12 }}>
        Salvar
      </button>
    </div>
  )
}
