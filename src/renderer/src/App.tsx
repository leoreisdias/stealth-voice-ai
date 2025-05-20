import { token } from '@styled-system/tokens'
import { Recorder } from './components/recorder'
import { Waves } from './components/ui/wave'
import Versions from './components/Versions'
import { Box, Flex } from '@styled-system/jsx'
import { Hero } from './components/hero'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages'
import Popover from './pages/popover'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/popover" element={<Popover />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
