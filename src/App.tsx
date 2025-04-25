import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./components/Game/Game";
import { usePlayer } from "./contexts/PlayerContext";

const App: React.FC = () => {
  const [mode, setMode] = useState<"environment" | "territory">("environment");
  const [warfogEnabled, setWarfogEnabled] = useState(true);
  const { currentTerritory, setCurrentTerritory } = usePlayer();

  useEffect(() => {
    console.log(`Territoire choisi : ${currentTerritory}`);
  }, [currentTerritory]);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "environment" ? "territory" : "environment"));
  };

  const toggleWarfog = () => {
    setWarfogEnabled(prev => !prev);
  };

  const territories = ["Attica", "Thessaly", "Pelopponesus", "Neutral"];

  return (
    <div className="App">
      <header className="App-header">
        <h1>Grèce Anatomie</h1>
        <h2>Commerces, guerres et conquêtes en 350 av. J.-C.</h2>
        <div className="territory-buttons">
          {territories.map((territory) => (
            <button
              key={territory}
              onClick={() => setCurrentTerritory(territory)}
              className={currentTerritory === territory ? "active" : ""}
            >
              {territory}
            </button>
          ))}
        </div>
      </header>

      <main>
        <div className="mode-switch">
          <button onClick={toggleMode}>
            Passer en mode {mode === "environment" ? "territory" : "environment"}
          </button>
          <button onClick={toggleWarfog}>
            {warfogEnabled ? "Désactiver" : "Activer"} le brouillard de guerre
          </button>
        </div>

        <div className="game-container" id="game-container">
          <Game mode={mode} warfogEnabled={warfogEnabled} />
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
