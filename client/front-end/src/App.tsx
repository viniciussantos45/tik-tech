import { initDB } from 'react-indexed-db-hook'
import { DBConfig } from './config/db'
import Home from './pages'
import { Providers } from './providers'

initDB(DBConfig)

function App() {
  return (
    <Providers>
      <Home />
    </Providers>
  )
}

export default App
