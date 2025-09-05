#!/usr/bin/env node

/**
 * [WRENCH] QBTC EMOJI CONFLICTS FIXER
 * =============================
 * 
 * Script para corregir todos los emojis que causan problemas de codificación
 * en PowerShell y entornos Windows, reemplazándolos con texto simple.
 */

import { promises as fs } from 'fs';
import path from 'path';

const EMOJI_REPLACEMENTS = {
    // Emojis comunes que causan problemas
    '[ROCKET]': '[ROCKET]',
    '[STAR]': '[STAR]',
    '[CLIPBOARD]': '[CLIPBOARD]',
    '[CLAPPER]': '[CLAPPER]',
    '[HOURGLASS]': '[HOURGLASS]',
    '[WRENCH]': '[WRENCH]',
    '[LINK]': '[LINK]',
    '[CHECK]': '[CHECK]',
    '[CHART]': '[CHART]',
    '[PARTY]': '[PARTY]',
    '[GLOBE]': '[GLOBE]',
    '[BULB]': '[BULB]',
    '[STOP]': '[STOP]',
    '[BROOM]': '[BROOM]',
    '[WAVE]': '[WAVE]',
    '[X]': '[X]',
    '[WARNING]': '[WARNING]',
    '[MAGNIFY]': '[MAGNIFY]',
    '[DIAMOND]': '[DIAMOND]',
    '[OCEAN_WAVE]': '[WAVE]',
    '[SCALES]': '[SCALES]',
    '[GAMEPAD]': '[GAMEPAD]',
    '[HOSPITAL]': '[HOSPITAL]',
    '[TEST_TUBE]': '[TEST_TUBE]',
    '[PIN]': '[PIN]',
    '[TARGET]': '[TARGET]',
    '[REFRESH]': '[REFRESH]',
    '[BOOM]': '[BOOM]',
    '[ROBOT]': '[ROBOT]',
    '[TREND_UP]': '[TREND_UP]',
    '[GALAXY]': '[GALAXY]',
    '[CONTROL_KNOBS]': '[CONTROL_KNOBS]',
    '[ATOM]': '[ATOM]',
    '[EARTH]': '[EARTH]',
    '[RUNNER]': '[RUNNER]',
    '[CALENDAR]': '[CALENDAR]',
    '[CYCLONE]': '[CYCLONE]',
    '[LIGHTNING]': '[LIGHTNING]',
    '[MOON]': '[MOON]',
    '[CHART_TREND]': '[CHART_TREND]',
    '[CRYSTAL_BALL]': '[CRYSTAL_BALL]',
    '[WIZARD]': '[WIZARD]',
    '[BRAIN]': '[BRAIN]',
    '[SATELLITE]': '[SATELLITE]',
    '[TROPHY]': '[TROPHY]',
    '[MONEY]': '[MONEY]',
    '[PALETTE]': '[PALETTE]',
    '[TELESCOPE]': '[TELESCOPE]',
    '[OCEAN_WAVE]': '[OCEAN_WAVE]',
    '[FIRE]': '[FIRE]',
    '[MEMO]': '[MEMO]',
    '[SIREN]': '[SIREN]',
    '[COMPUTER]': '[COMPUTER]',
    '[MONITOR]': '[MONITOR]',
    '[FLOPPY_DISK]': '[FLOPPY_DISK]',
    '[STAR2]': '[STAR2]',
    '[SPARKLES]': '[SPARKLES]',
    '[COMET]': '[COMET]'
};

class EmojiConflictFixer {
    constructor() {
        this.filesFixed = 0;
        this.totalReplacements = 0;
        console.log('[EMOJI_FIXER] QBTC Emoji Conflict Fixer initialized');
    }

    async fixFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            let newContent = content;
            let replacements = 0;

            // Replace each emoji
            for (const [emoji, replacement] of Object.entries(EMOJI_REPLACEMENTS)) {
                const regex = new RegExp(emoji, 'g');
                const matches = (content.match(regex) || []).length;
                if (matches > 0) {
                    newContent = newContent.replace(regex, replacement);
                    replacements += matches;
                }
            }

            // Only write if changes were made
            if (replacements > 0) {
                await fs.writeFile(filePath, newContent, 'utf8');
                console.log(`[CHECK] Fixed ${replacements} emojis in ${path.basename(filePath)}`);
                this.filesFixed++;
                this.totalReplacements += replacements;
            }

            return replacements > 0;

        } catch (error) {
            console.log(`[X] Error processing ${filePath}: ${error.message}`);
            return false;
        }
    }

    async fixDirectory(dirPath = '.') {
        console.log(`[MAGNIFY] Scanning directory: ${dirPath}`);
        
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                
                if (entry.isDirectory()) {
                    // Skip node_modules and .git directories
                    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'logs') {
                        continue;
                    }
                    await this.fixDirectory(fullPath);
                    
                } else if (entry.isFile()) {
                    // Process JavaScript and PowerShell files
                    const ext = path.extname(entry.name).toLowerCase();
                    if (['.js', '.ps1', '.md', '.json', '.txt'].includes(ext)) {
                        await this.fixFile(fullPath);
                    }
                }
            }
            
        } catch (error) {
            console.log(`[X] Error reading directory ${dirPath}: ${error.message}`);
        }
    }

    async run() {
        console.log('[STAR] Starting QBTC Emoji Conflict Fix');
        console.log('========================================');
        
        const startTime = Date.now();
        await this.fixDirectory();
        const endTime = Date.now();
        
        console.log('\n[PARTY] Emoji Fix Completed');
        console.log('============================');
        console.log(`[CHART] Files processed: ${this.filesFixed}`);
        console.log(`[CHART] Total replacements: ${this.totalReplacements}`);
        console.log(`[CLOCK] Processing time: ${endTime - startTime}ms`);
        
        if (this.totalReplacements > 0) {
            console.log('\n[CHECK] Recommended next steps:');
            console.log('• Test the deployment: node deploy-qbtc-ecosystem.js');
            console.log('• Run health checks: node test-qbtc-deploy.js --health-check');
            console.log('• Check individual services: node test-qbtc-deploy.js --service temporal');
        } else {
            console.log('\n[CHECK] No emoji conflicts found. System is ready!');
        }
    }
}

// Run the fixer
const fixer = new EmojiConflictFixer();
fixer.run().catch(error => {
    console.error('[X] Fatal error:', error.message);
    process.exit(1);
});
