import { Routes, Route } from "react-router-dom";

import Header from './components/Header';
import Footer from './components/Footer';

import ListadoVacantes from './pages/ListadoVacantes';

function App() {
  return (
    <>
      <Header />

      <main id="principal" className="main">
        <Routes>
          <Route path="/" element={<ListadoVacantes />} />
          <Route path="/vacantes" element={<ListadoVacantes />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;