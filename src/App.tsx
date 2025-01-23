import React, { useState } from "react";
import "./App.css";
import Game from "./components/Game/Game";

const App: React.FC = () => {
  const [mode, setMode] = useState<"environment" | "territory">("environment");

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "environment" ? "territory" : "environment"));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grèce Anatomie</h1>
        <h2>Commerces, guerres et conquêtes en 350 av. J.-C.</h2>
      </header>

      <main>
        <div className="mode-switch">
          <button onClick={toggleMode}>
            Passer en mode {mode === "environment" ? "territory" : "environment"}
          </button>
        </div>

        <div className="game-container" id="game-container">
          <Game mode={mode} />
        </div>
      </main>

      <footer className="App-footer">
        <p>
        </p>
      </footer>
    </div>
  );
};

export default App;
