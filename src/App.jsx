import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CheatSheet from './components/CheatSheet';
import Welcome from './components/Welcome';
import TestValidator from './components/TestValidator';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/test" element={<TestValidator />} />
          <Route path="/:name" element={<CheatSheet />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

