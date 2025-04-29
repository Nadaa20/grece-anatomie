import React, { useState, useEffect } from "react";
import "./App.css";
import Game from "./components/Game/Game";
import { MessageInputModal } from "./components/Interface2D/MessageInputModal";
import { HexCoordinates } from "./entities/Troop";
import { usePlayer, PlayerProvider } from "./contexts/PlayerContext";
import WaitingRoom from './WaitingRoom/WaitingRoom';

interface AppProps {
  currentGameId: number | null;
  onGameReady: (gameId: number) => void;
}

const AppContent: React.FC = () => {
  console.log('[CLIENT] AppContent monté');
  const [mode, setMode] = useState<"environment" | "territory">("environment");
  const [warfogEnabled, setWarfogEnabled] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const { currentTerritory } = usePlayer();
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [currentMessenger, setCurrentMessenger] = useState<{ id: string; target: HexCoordinates } | null>(null);
  const [showMessageRead, setShowMessageRead] = useState(false);
  const [currentMessageToRead, setCurrentMessageToRead] = useState<string | null>(null);

  useEffect(() => {
    console.log(`Territoire choisi dans AppContent : ${currentTerritory}`);
  }, [currentTerritory]);

  useEffect(() => {
    const handleTestMode = (event: CustomEvent<{ isTest: boolean }>) => {
      setIsTestMode(event.detail.isTest);
    };

    window.addEventListener('test-mode', handleTestMode as EventListener);

    return () => {
      window.removeEventListener('test-mode', handleTestMode as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleShowMessageInput = (event: CustomEvent<{ messengerId: string; target: HexCoordinates; initialMessage: string }>) => {
      setCurrentMessenger({
        id: event.detail.messengerId,
        target: event.detail.target
      });
      setShowMessageInput(true);
    };

    window.addEventListener('show-message-input', handleShowMessageInput as EventListener);

    return () => {
      window.removeEventListener('show-message-input', handleShowMessageInput as EventListener);
    };
  }, []);

  useEffect(() => {
    const handleShowMessageRead = (event: CustomEvent<{ message: string; messengerId: string }>) => {
      setCurrentMessageToRead(event.detail.message);
      setCurrentMessenger({ id: event.detail.messengerId, target: { row: 0, col: 0 } });
      setShowMessageRead(true);
    };
    window.addEventListener('show-message-read', handleShowMessageRead as EventListener);
    return () => {
      window.removeEventListener('show-message-read', handleShowMessageRead as EventListener);
    };
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === "environment" ? "territory" : "environment"));
  };

  const toggleWarfog = () => {
    setWarfogEnabled(prev => !prev);
  };

  const handleMessageConfirm = (message: string) => {
    if (currentMessenger) {
      window.dispatchEvent(new CustomEvent('messenger-message', {
        detail: {
          messengerId: currentMessenger.id,
          target: currentMessenger.target,
          message: message
        }
      }));

      // Déplacer le messager après l'envoi du message
      window.dispatchEvent(new CustomEvent('move-messenger', {
        detail: {
          messengerId: currentMessenger.id,
          target: currentMessenger.target
        }
      }));

      // Afficher le message stocké dans le messager
      window.dispatchEvent(new CustomEvent('get-messenger-message', {
        detail: {
          messengerId: currentMessenger.id
        }
      }));
    }
    setShowMessageInput(false);
    setCurrentMessenger(null);
  };

  const handleMessageInputClose = () => {
    setShowMessageInput(false);
    setCurrentMessenger(null);
  };

  const handleMessageReadClose = () => {
    if (currentMessenger) {
      window.dispatchEvent(new CustomEvent('message-read-close', {
        detail: { messengerId: currentMessenger.id }
      }));
    }
    setShowMessageRead(false);
    setCurrentMessageToRead(null);
    setCurrentMessenger(null);
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
          {isTestMode && (
            <button onClick={toggleWarfog}>
              {warfogEnabled ? "Désactiver" : "Activer"} le brouillard de guerre
            </button>
          )}
        </div>
        <div className="game-container" id="game-container">
          <Game mode={mode} warfogEnabled={warfogEnabled} />
        </div>
      </main>
      <footer className="App-footer">
        <p></p>
      </footer>

      {showMessageInput && (
        <MessageInputModal
          onConfirm={handleMessageConfirm}
          onClose={handleMessageInputClose}
        />
      )}

      {showMessageRead && currentMessageToRead !== null && (
        <MessageInputModal
          onConfirm={handleMessageReadClose}
          onClose={handleMessageReadClose}
          initialMessage={currentMessageToRead}
          readOnly={true}
        />
      )}
    </div>
  );
};

const App: React.FC<AppProps> = ({ currentGameId, onGameReady }) => {
  console.log('[CLIENT] App monté');

  const handleGameReady = (gameId: number) => {
    onGameReady(gameId);
  };

  return (
    <>
      {!currentGameId ? (
        <WaitingRoom onGameReady={handleGameReady} />
      ) : (
        <AppContent />
      )}
    </>
  );
};

export default App;
