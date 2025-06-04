import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages'
import PopoverPage from './pages/popover'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/popover" element={<PopoverPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
