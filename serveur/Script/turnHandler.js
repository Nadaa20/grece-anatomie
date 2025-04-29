const fs = require('fs').promises;
const path = require('path');

async function ensureDirectoryExists(filePath) {
    const dirname = path.dirname(filePath);
    try {
        await fs.access(dirname);
    } catch (error) {
        // Le dossier n'existe pas, on le crée
        await fs.mkdir(dirname, { recursive: true });
    }
}

function setupTurnHandlers(io, socket) {
    console.log('[SERVER] setupTurnHandlers appelé pour socket.id =', socket.id);

    // Stockage temporaire pour les chunks de données
    const turnChunks = new Map();

    // Configuration des événements de tour
    socket.on('end_turn_chunk', (data) => {
        console.log('[SERVER] Événement end_turn_chunk reçu de', socket.id);
        const { turn, chunk_index, total_chunks, hexagons } = data;
        
        // Initialiser le stockage pour ce tour si nécessaire
        if (!turnChunks.has(turn)) {
            turnChunks.set(turn, {
                chunks: new Array(total_chunks).fill(null),
                receivedCount: 0
            });
            console.log(`[SERVER] Nouveau tour initialisé: ${turn}`);
        }

        const turnData = turnChunks.get(turn);
        turnData.chunks[chunk_index] = hexagons;
        turnData.receivedCount++;

        console.log(`[SERVER] Reçu chunk ${chunk_index + 1}/${total_chunks} pour le tour ${turn} (${hexagons.length} hexagones)`);
    });

    socket.on('end_turn_complete', async (data) => {
        console.log('[SERVER] Événement end_turn_complete reçu de', socket.id);
        const { turn, total_hexagons } = data;
        
        if (!turnChunks.has(turn)) {
            console.error('[SERVER] Données de tour non trouvées:', turn);
            return;
        }

        const turnData = turnChunks.get(turn);
        
        // Vérifier que tous les chunks sont reçus
        if (turnData.receivedCount === turnData.chunks.length) {
            console.log('[SERVER] Tous les chunks reçus, fusion des données...');
            
            // Fusionner tous les chunks
            const allHexagons = turnData.chunks.flat();
            
            // Vérifier que le nombre total d'hexagones correspond
            if (allHexagons.length !== total_hexagons) {
                console.error(`[SERVER] Nombre d'hexagones incorrect. Reçu: ${allHexagons.length}, Attendu: ${total_hexagons}`);
                return;
            }

            // Créer l'objet de données complet
            const jsonData = {
                turn,
                hexagons: allHexagons
            };

            // Utiliser un chemin absolu pour output.json
            const outputPath = path.resolve(__dirname, '../../output.json');
            console.log(`[SERVER] Chemin du fichier output.json: ${outputPath}`);

            try {
                // S'assurer que le dossier existe
                await ensureDirectoryExists(outputPath);

                // Écrire dans le fichier output.json de manière asynchrone
                await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
                console.log('[SERVER] Fichier output.json écrit avec succès');

                // Vérifier que le fichier a bien été créé
                try {
                    await fs.access(outputPath);
                    const stats = await fs.stat(outputPath);
                    console.log(`[SERVER] Fichier créé avec succès, taille: ${stats.size} octets`);
                } catch (error) {
                    console.error('[SERVER] Le fichier n\'a pas été créé:', error);
                }

                // Notifier que le tour est traité
                io.to(socket.gameId).emit('turn_processed', { turn });
                console.log('[SERVER] Tour traité avec succès');
            } catch (error) {
                console.error('[SERVER] Erreur lors du traitement du tour:', error);
                console.error('[SERVER] Stack trace:', error.stack);
                socket.emit('error', { message: 'Erreur lors du traitement du tour' });
            } finally {
                // Nettoyer les données temporaires
                turnChunks.delete(turn);
                console.log('[SERVER] Nettoyage des données temporaires effectué');
            }
        } else {
            console.log(`[SERVER] En attente de chunks (${turnData.receivedCount}/${turnData.chunks.length})`);
        }
    });

    // Log de confirmation
    console.log('[SERVER] Gestionnaires de tour configurés pour socket.id =', socket.id);
}

module.exports = setupTurnHandlers; 