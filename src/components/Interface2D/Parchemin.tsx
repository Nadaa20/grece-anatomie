import React, { useState } from 'react';
import './Parchemin.css';

interface ParcheminsData {
    Batiments: { [key: string]: number };
    Troupes: { [key: string]: number };
    Quetes: { [key: string]: string };
}

interface ParcheminProps {
    onClose: () => void;
    data: ParcheminsData | null;
}

const tabs = ['Batiments', 'Troupes', 'Quetes'] as const;
type TabType = typeof tabs[number];

export const Parchemin: React.FC<ParcheminProps> = ({ onClose, data }) => {
    const [activeTab, setActiveTab] = useState<TabType>('Batiments');

    const renderBatiments = () => {
        if (!data?.Batiments || Object.keys(data.Batiments).length === 0) {
            return <p>Aucun bâtiment présent sur cette case</p>;
        }

        return (
            <div className="batiments-list">
                {Object.entries(data.Batiments).map(([batiment, quantite]) => (
                    <div key={batiment} className="batiment-item">
                        <span className="batiment-nom">{batiment}</span>
                        <span className="batiment-quantite">x{quantite}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderTroupes = () => {
        if (!data?.Troupes || Object.keys(data.Troupes).length === 0) {
            return <p>Aucune troupe présente sur cette case</p>;
        }

        return (
            <div className="troupes-list">
                {Object.entries(data.Troupes).map(([troupe, quantite]) => (
                    <div key={troupe} className="troupe-item">
                        <span className="troupe-nom">{troupe}</span>
                        <span className="troupe-quantite">x{quantite}</span>
                    </div>
                ))}
            </div>
        );
    };

    const renderQuetes = () => {
        if (!data?.Quetes || Object.keys(data.Quetes).length === 0) {
            return <p>Aucune quête disponible sur cette case</p>;
        }

        return (
            <div className="quetes-list">
                {Object.entries(data.Quetes).map(([quete, description]) => (
                    <div key={quete} className="quete-item">
                        <h3 className="quete-titre">{quete}</h3>
                        <p className="quete-description">{description}</p>
                    </div>
                ))}
            </div>
        );
    };

    const getTabContent = (tab: TabType): JSX.Element => {
        if (!data) {
            return <p>Chargement des données...</p>;
        }

        switch (tab) {
            case 'Batiments':
                return renderBatiments();
            case 'Troupes':
                return renderTroupes();
            case 'Quetes':
                return renderQuetes();
        }
    };

    const getTabPosition = (tab: TabType): number => {
        const activeIndex = tabs.indexOf(activeTab);
        const currentIndex = tabs.indexOf(tab);

        if (tab === activeTab) return 0;
        if (activeIndex === 2 && currentIndex === 0) {return 1;}
        if (activeIndex === 0 && currentIndex === 2) {return 2;}
        if (currentIndex < activeIndex) {return currentIndex + 1;}
        return currentIndex;
    };

    return (
        <div className="parchemins-container">
            {tabs.map((tab) => {
                const position = getTabPosition(tab);
                return (
                    <div
                        key={tab}
                        className={`parchemin ${tab === activeTab ? 'active' : ''}`}
                        style={{
                            zIndex: tab === activeTab ? 30 : 20 - position,
                            transform: `translate(${position * 20}px, ${-position * 20}px)`,
                        }}
                    >
                        <div className={`marque-page marque-page-${tab.toLowerCase()}`} onClick={() => setActiveTab(tab)}>
                            {tab}
                        </div>
                        <button className="close-button" onClick={onClose}>×</button>
                        <div className="parchemin-content">
                            <h2>{tab}</h2>
                            {getTabContent(tab)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Parchemin; 