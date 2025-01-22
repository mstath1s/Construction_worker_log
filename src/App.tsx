import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import DailyLog from './pages/DailyLog'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="daily-log" element={<DailyLog />} />
          <Route path="projects" element={<div className="text-center py-12">Projects Page Coming Soon</div>} />
          <Route path="workers" element={<div className="text-center py-12">Workers Page Coming Soon</div>} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
