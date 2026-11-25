import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Encabezado from './components/Header';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Encabezado/>
      <main id='principal'>
        <Routes>
          
        </Routes>
      </main>
    </>
  )
}

export default App
