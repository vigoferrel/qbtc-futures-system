
import { QUANTUM_CONSTANTS } from '../config/constants.js';
import { EventEmitter } from 'events';
// Use real data ingestion only (no simulation)
import * as DataIngestion from '../analysis-engine/data-ingestion.js';

const logger = {
    info: (msg) => console.log(`[HarmonicTriangular] INFO: ${msg}`),
    warn: (msg) => console.warn(`[HarmonicTriangular] WARN: ${msg}`),
    error: (msg) => console.error(`[HarmonicTriangular] ERROR: ${msg}`)
};

function getSymbols() {
    return QUANTUM_CONSTANTS.QUANTUM_SYMBOLS || [];
}

function getStablecoins() {
    return ['USDT', 'USDC', 'BUSD', 'DAI'];
}

function getCryptoAssets() {
    const symbols = getSymbols();
    return symbols.map(s => s.replace('USDT', '')).filter(s => s !== '');
}

class HarmonicTriangularEngine extends EventEmitter {
    constructor() {
        super();
        this.symbols = getSymbols();
        this.stablecoins = getStablecoins();
        this.cryptoAssets = getCryptoAssets();
        // this.quantumLeverageEngine = new QuantumLeverageEngine(); // Disabled for now
        this.isScanning = false;
        this.scanInterval = 2000; // Scan every 2 seconds
        this.lastScanTime = 0;

        logger.info(`HarmonicTriangularEngine initialized.`);
    }

    generateCandidateAssetPairs() {
        const pairs = [];
        const baseAsset = 'USDT';
        const otherAssets = this.cryptoAssets;
        const symbolMap = new Set(this.symbols);
        const simplifiedPairs = [];

        for (let i = 0; i < otherAssets.length; i++) {
            for (let j = i + 1; j < otherAssets.length; j++) {
                const assetA = otherAssets[i];
                const assetB = otherAssets[j];
                const ausdt = `${assetA}${baseAsset}`;
                const busdt = `${assetB}${baseAsset}`;
                if (symbolMap.has(ausdt) && symbolMap.has(busdt)) {
                    simplifiedPairs.push({ assetA, assetB, ausdt, busdt });
                }
            }
        }

        logger.info(`Prepared ${simplifiedPairs.length} USDT leg pairs for on-the-fly cross validation.`);
        return simplifiedPairs;
    }

    async scanForOpportunities() {
        if (this.isScanning) {
            logger.warn('Scan is already in progress. Skipping.');
            return;
        }

        this.isScanning = true;
        this.lastScanTime = Date.now();
        logger.info('Starting triangular arbitrage scan...');

        const opportunities = [];
        const candidates = this.generateCandidateAssetPairs();

        for (const c of candidates) {
            try {
                // Try both cross directions: A/B and B/A
                const crossAB = `${c.assetA}${c.assetB}`;
                const crossBA = `${c.assetB}${c.assetA}`;

                // Attempt AB path first
                let tickers = null;
                try {
                    tickers = await Promise.all([
                        DataIngestion.getBookTicker(c.ausdt),
                        DataIngestion.getBookTicker(crossAB),
                        DataIngestion.getBookTicker(c.busdt)
                    ]);
                } catch {}

                // If AB failed or incomplete, try BA
                if (!tickers || tickers.some(t => !t || !t.bidPrice || !t.askPrice)) {
                    try {
                        tickers = await Promise.all([
                            DataIngestion.getBookTicker(c.busdt),
                            DataIngestion.getBookTicker(crossBA),
                            DataIngestion.getBookTicker(c.ausdt)
                        ]);
                    } catch {}

                    if (!tickers || tickers.some(t => !t || !t.bidPrice || !t.askPrice)) {
                        continue; // Cross not available; skip
                    }

                    // This is USDT -> B -> A -> USDT
                    const [bUsdt, crossBAData, aUsdt] = tickers;
                    const initialAmount = 100.0;
                    const amountB = initialAmount / parseFloat(bUsdt.askPrice);
                    const amountA = amountB * parseFloat(crossBAData.bidPrice);
                    const finalAmount = amountA * parseFloat(aUsdt.bidPrice);
                    const profit = finalAmount - initialAmount;
                    const profitPercentage = (profit / initialAmount) * 100;
                    if (profitPercentage > 0.1) {
                        opportunities.push({
                            path: `USDT -> ${c.assetB} -> ${c.assetA} -> USDT`,
                            pairs: [c.busdt, crossBA, c.ausdt],
                            profitPercentage: profitPercentage.toFixed(4),
                            profit: profit.toFixed(4),
                            timestamp: Date.now()
                        });
                    }
                    continue;
                }

                // This is USDT -> A -> B -> USDT
                const [aUsdt, crossABData, bUsdt] = tickers;
                const initialAmount = 100.0;
                const amountA = initialAmount / parseFloat(aUsdt.askPrice);
                const amountB = amountA * parseFloat(crossABData.bidPrice);
                const finalAmount = amountB * parseFloat(bUsdt.bidPrice);
                const profit = finalAmount - initialAmount;
                const profitPercentage = (profit / initialAmount) * 100;
                if (profitPercentage > 0.1) {
                    opportunities.push({
                        path: `USDT -> ${c.assetA} -> ${c.assetB} -> USDT`,
                        pairs: [c.ausdt, crossAB, c.busdt],
                        profitPercentage: profitPercentage.toFixed(4),
                        profit: profit.toFixed(4),
                        timestamp: Date.now()
                    });
                }

            } catch (error) {
                logger.error(`Error processing candidate ${c.assetA}/${c.assetB}: ${error.message}`);
            }
        }

        this.isScanning = false;
        if (opportunities.length > 0) {
            // Here you would integrate with the Merkaba protocol or execution engine
            // For now, we just log them.
            logger.info(`Scan complete. Found ${opportunities.length} triangular arbitrage opportunities.`);
            return opportunities;
        } else {
            // logger.info('Scan complete. No profitable opportunities found in this cycle.');
            return [];
        }
    }

    start() {
        logger.info('Starting Harmonic Triangular Engine scanner.');
        this.intervalId = setInterval(async () => {
            const opportunities = await this.scanForOpportunities();
            if (opportunities && opportunities.length > 0) {
                this.emit('opportunities-found', opportunities);
            }
        }, this.scanInterval);
    }



    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            logger.info('Stopped Harmonic Triangular Engine scanner.');
        }
    }
}

export { HarmonicTriangularEngine };

// Example usage (for testing or if this becomes a standalone service)
if (import.meta.url === `file://${process.argv[1]}`) {
    const engine = new HarmonicTriangularEngine();
    engine.start();

    process.on('SIGINT', () => {
        engine.stop();
        process.exit(0);
    });
}

