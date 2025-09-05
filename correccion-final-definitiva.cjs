const fs = require('fs');

console.log('🔧 CORRECCIÓN FINAL DEFINITIVA - QBTC QUANTUM MACRO-INTELLIGENCE');
console.log('================================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';
const backupFile = 'monitor-quantum-intelligence-llm-debug-backup.html';

try {
    // Crear backup antes de modificar
    if (fs.existsSync(htmlFile)) {
        fs.copyFileSync(htmlFile, backupFile);
        console.log('📁 Backup creado:', backupFile);
    }
    
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // CORRECCIÓN DEFINITIVA: Reemplazar completamente la función createGraphicalMonitor
    console.log('\n🔧 Reemplazando función createGraphicalMonitor...');
    
    // Buscar el inicio de la función createGraphicalMonitor
    const startMarker = '// MONITOR GRÁFICO: Crear visualización con barras';
    const endMarker = '// Cargar datos al iniciar';
    
    const startIndex = htmlContent.indexOf(startMarker);
    const endIndex = htmlContent.indexOf(endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        console.log('📍 Encontrada función createGraphicalMonitor');
        
        // Crear la nueva función corregida
        const newFunction = `
        // MONITOR GRÁFICO: Crear visualización con barras
        function createGraphicalMonitor(data) {
            if (!data.sectorAnalysis) return '❌ No hay datos para visualización';

            const sectors = Object.keys(data.sectorAnalysis);
            let html = '';

            // Gráfico de Profit por Sector
            html += '<h3>💰 Expected Profit por Sector</h3>';
            html += '<div class="graphical-monitor">';
            html += '<div class="graph-container">';

            sectors.forEach(sector => {
                const sectorData = data.sectorAnalysis[sector];

                // Verificar que sectorData existe
                if (!sectorData) {
                    html += '<div class="graph-bar">';
                    html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                    html += '<div class="bar-container">';
                    html += '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>';
                    html += '<span class="bar-value">0.00%</span>';
                    html += '</div>';
                    html += '</div>';
                    return;
                }

                const profitOpt = calculateProfitOptimization(sectorData, null);
                const profitPercent = profitOpt?.expectedReturn || 0;
                const barColor = profitPercent > 10 ? '#00ff88' : profitPercent > 5 ? '#ffaa00' : '#ff4444';

                html += '<div class="graph-bar">';
                html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                html += '<div class="bar-container">';
                html += '<div class="bar-fill" style="width: ' + profitPercent + '%; background-color: ' + barColor + ';"></div>';
                html += '<span class="bar-value">' + profitPercent.toFixed(2) + '%</span>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';

            // Gráfico de Leverage por Sector
            html += '<h3>⚡ Max Leverage por Sector</h3>';
            html += '<div class="graphical-monitor">';
            html += '<div class="graph-container">';

            sectors.forEach(sector => {
                const sectorData = data.sectorAnalysis[sector];
                const maxLeverage = calculateMaxLeverage(sectorData, null);
                const leveragePercent = (maxLeverage / 125) * 100;

                const barColor = leveragePercent > 80 ? '#00ff88' : leveragePercent > 50 ? '#ffaa00' : '#ff4444';

                html += '<div class="graph-bar">';
                html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                html += '<div class="bar-container">';
                html += '<div class="bar-fill" style="width: ' + leveragePercent + '%; background-color: ' + barColor + ';"></div>';
                html += '<span class="bar-value">' + maxLeverage.toFixed(0) + 'x</span>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';

            // Gráfico de Oportunidades por Sector
            html += '<h3>🎯 Opportunity Score por Sector</h3>';
            html += '<div class="graphical-monitor">';
            html += '<div class="graph-container">';

            sectors.forEach(sector => {
                const sectorData = data.sectorAnalysis[sector];

                // Verificar que sectorData existe
                if (!sectorData) {
                    html += '<div class="graph-bar">';
                    html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                    html += '<div class="bar-container">';
                    html += '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>';
                    html += '<span class="bar-value">0.0%</span>';
                    html += '</div>';
                    html += '</div>';
                    return;
                }

                const profitOpt = calculateProfitOptimization(sectorData, null);
                const opportunityPercent = (profitOpt?.opportunity || 0) * 100;
                const barColor = opportunityPercent > 70 ? '#00ff88' : opportunityPercent > 40 ? '#ffaa00' : '#ff4444';

                html += '<div class="graph-bar">';
                html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                html += '<div class="bar-container">';
                html += '<div class="bar-fill" style="width: ' + opportunityPercent + '%; background-color: ' + barColor + ';"></div>';
                html += '<span class="bar-value">' + opportunityPercent.toFixed(1) + '%</span>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';

            // Resumen de Top Recomendaciones
            html += '<h3>🏆 Top 3 Recomendaciones</h3>';
            html += '<div class="graphical-monitor">';
            html += '<div class="graph-container">';

            const recommendations = sectors.map(sector => {
                const sectorData = data.sectorAnalysis[sector];

                // Verificar que sectorData existe
                if (!sectorData) {
                    return {
                        sector,
                        score: 0,
                        profit: 0,
                        leverage: 50,
                        opportunity: 0
                    };
                }

                const profitOpt = calculateProfitOptimization(sectorData, null);
                const maxLeverage = calculateMaxLeverage(sectorData, null);
                const expectedReturn = profitOpt?.expectedReturn || 0;
                const opportunity = profitOpt?.opportunity || 0;
                const score = (expectedReturn * 0.4) + (maxLeverage * 0.3) + (opportunity * 100 * 0.3);

                return {
                    sector,
                    score,
                    profit: expectedReturn,
                    leverage: maxLeverage,
                    opportunity: opportunity * 100
                };
            }).sort((a, b) => b.score - a.score).slice(0, 3);

            recommendations.forEach((rec, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                html += '<div class="recommendation-item">';
                html += '<div class="medal">' + medal + '</div>';
                html += '<div class="rec-info">';
                html += '<div class="rec-sector">' + rec.sector.replace(/_/g, ' ') + '</div>';
                html += '<div class="rec-metrics">';
                html += '<span class="rec-metric">Profit: ' + rec.profit.toFixed(2) + '%</span>';
                html += '<span class="rec-metric">Leverage: ' + rec.leverage.toFixed(0) + 'x</span>';
                html += '<span class="rec-metric">Opportunity: ' + rec.opportunity.toFixed(1) + '%</span>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';

            // Gráfico de Confluencia Multi-Timeframe por Sector
            html += '<h3>⏰ Multi-Timeframe Confluence por Sector</h3>';
            html += '<div class="graphical-monitor">';
            html += '<div class="graph-container">';

            sectors.forEach(sector => {
                const sectorData = data.sectorAnalysis[sector];

                // Verificar que sectorData existe
                if (!sectorData) {
                    html += '<div class="graph-bar">';
                    html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + '</div>';
                    html += '<div class="bar-container">';
                    html += '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>';
                    html += '<span class="bar-value">0.0%</span>';
                    html += '</div>';
                    html += '</div>';
                    return;
                }

                const confluenceAnalysis = calculateTimeframeConfluence(sector, sectorData);
                const confluencePercent = confluenceAnalysis.overall * 100;
                const barColor = confluenceAnalysis.goldenConfluence ? '#00ff88' : confluencePercent > 60 ? '#ffaa00' : '#ff4444';

                html += '<div class="graph-bar">';
                html += '<div class="bar-label">' + sector.replace(/_/g, ' ') + ' (' + confluenceAnalysis.optimalTF + ')</div>';
                html += '<div class="bar-container">';
                html += '<div class="bar-fill" style="width: ' + confluencePercent + '%; background-color: ' + barColor + ';"></div>';
                html += '<span class="bar-value">' + confluencePercent.toFixed(1) + '%</span>';
                html += '</div>';
                html += '</div>';
            });

            html += '</div></div>';
            html += '</div>';

            return html;
        }`;

        // Reemplazar la función problemática
        const beforeFunction = htmlContent.substring(0, startIndex);
        const afterFunction = htmlContent.substring(endIndex);
        
        htmlContent = beforeFunction + newFunction + afterFunction;
        
        console.log('✅ Función createGraphicalMonitor reemplazada');
    } else {
        console.log('⚠️  No se encontró la función createGraphicalMonitor');
    }
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN DEFINITIVA COMPLETADA');
    console.log('📁 Archivo guardado:', htmlFile);
    
    // Verificar sintaxis después de la corrección
    console.log('\n🔍 Verificando sintaxis después de la corrección...');
    
    // Extraer JavaScript del HTML
    const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptMatches) {
        let scriptContent = '';
        scriptMatches.forEach(match => {
            const scriptTag = match.match(/<script[^>]*>([\s\S]*?)<\/script>/);
            if (scriptTag) {
                scriptContent += scriptTag[1] + '\n';
            }
        });
        
        try {
            // Intentar evaluar el JavaScript
            eval(scriptContent);
            console.log('✅ Sintaxis JavaScript válida');
        } catch (error) {
            console.log('❌ Error de sintaxis detectado:', error.message);
            console.log('📍 Línea aproximada:', error.lineNumber || 'N/A');
        }
    }
    
} catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    
    // Restaurar desde backup si hay error
    if (fs.existsSync(backupFile)) {
        console.log('🔄 Restaurando desde backup...');
        const backupContent = fs.readFileSync(backupFile, 'utf8');
        fs.writeFileSync(htmlFile, backupContent, 'utf8');
        console.log('✅ Restauración completada');
    }
}

console.log('\n🎯 CORRECCIÓN DEFINITIVA FINALIZADA');
console.log('================================================================');

