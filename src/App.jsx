import { useState } from 'react'
import QuizApp from './components/QuizApp'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <QuizApp />
    </>
  )
}

export default App
