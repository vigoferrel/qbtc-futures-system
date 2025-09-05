const fs = require('fs');

console.log('🔧 CORRECCIÓN DE STRINGS HTML MALFORMADOS - QBTC QUANTUM');
console.log('========================================================\n');

const htmlFile = 'monitor-quantum-intelligence-llm-debug.html';

try {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    console.log(`📖 Leyendo archivo: ${htmlFile}`);
    
    const originalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas originales: ${originalLines}`);
    
    // CORRECCIÓN 1: Strings HTML malformados en createGraphicalMonitor
    console.log('\n🔧 Corrigiendo strings HTML malformados...');
    
    // Corregir strings que empiezan con comillas dobles sin cerrar
    htmlContent = htmlContent.replace(
        /"           const sectors = Object\.keys\(data\.sectorAnalysis\);/g,
        '            const sectors = Object.keys(data.sectorAnalysis);'
    );
    
    htmlContent = htmlContent.replace(
        /"           // Gráfico de Profit por Sector/g,
        '            // Gráfico de Profit por Sector'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<h3>💰 Expected Profit por Sector<\/h3>';/g,
        '            html += \'<h3>💰 Expected Profit por Sector</h3>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graphical-monitor">';/g,
        '            html += \'<div class="graphical-monitor">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graph-container">';/g,
        '            html += \'<div class="graph-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           sectors\.forEach\(sector => \{/g,
        '            sectors.forEach(sector => {'
    );
    
    htmlContent = htmlContent.replace(
        /"               const sectorData = data\.sectorAnalysis\[sector\];/g,
        '                const sectorData = data.sectorAnalysis[sector];'
    );
    
    htmlContent = htmlContent.replace(
        /"               // Verificar que sectorData existe/g,
        '                // Verificar que sectorData existe'
    );
    
    htmlContent = htmlContent.replace(
        /"               if \(!sectorData\) \{/g,
        '                if (!sectorData) {'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="graph-bar">';/g,
        '                    html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                    html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-container">';/g,
        '                    html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"><\/div>';/g,
        '                    html += \'<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<span class="bar-value">0\.00%<\/span>';/g,
        '                    html += \'<span class="bar-value">0.00%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   return;/g,
        '                    return;'
    );
    
    htmlContent = htmlContent.replace(
        /"               \}/g,
        '                }'
    );
    
    htmlContent = htmlContent.replace(
        /"               const profitOpt = calculateProfitOptimization\(sectorData, null\);/g,
        '                const profitOpt = calculateProfitOptimization(sectorData, null);'
    );
    
    htmlContent = htmlContent.replace(
        /"               const profitPercent = profitOpt\?\.expectedReturn \|\| 0;/g,
        '                const profitPercent = profitOpt?.expectedReturn || 0;'
    );
    
    htmlContent = htmlContent.replace(
        /"               const barColor = profitPercent > 10 \? '#00ff88' : profitPercent > 5 \? '#ffaa00' : '#ff4444';/g,
        '                const barColor = profitPercent > 10 ? \'#00ff88\' : profitPercent > 5 ? \'#ffaa00\' : \'#ff4444\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="graph-bar">';/g,
        '                html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-container">';/g,
        '                html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-fill" style="width: \$\{profitPercent\}%; background-color: \$\{barColor\};"><\/div>';/g,
        '                html += \'<div class="bar-fill" style="width: ${profitPercent}%; background-color: ${barColor};"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="bar-value">\$\{profitPercent\.toFixed\(2\)\}%<\/span>';/g,
        '                html += \'<span class="bar-value">${profitPercent.toFixed(2)}%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           \}\);/g,
        '            });'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<\/div><\/div>';/g,
        '            html += \'</div></div>\';'
    );
    
    // CORRECCIÓN 2: Continuar con el resto de strings malformados
    htmlContent = htmlContent.replace(
        /"           // Gráfico de Leverage por Sector/g,
        '            // Gráfico de Leverage por Sector'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<h3>⚡ Max Leverage por Sector<\/h3>';/g,
        '            html += \'<h3>⚡ Max Leverage por Sector</h3>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graphical-monitor">';/g,
        '            html += \'<div class="graphical-monitor">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graph-container">';/g,
        '            html += \'<div class="graph-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           sectors\.forEach\(sector => \{/g,
        '            sectors.forEach(sector => {'
    );
    
    htmlContent = htmlContent.replace(
        /"               const sectorData = data\.sectorAnalysis\[sector\];/g,
        '                const sectorData = data.sectorAnalysis[sector];'
    );
    
    htmlContent = htmlContent.replace(
        /"               const maxLeverage = calculateMaxLeverage\(sectorData, null\);/g,
        '                const maxLeverage = calculateMaxLeverage(sectorData, null);'
    );
    
    htmlContent = htmlContent.replace(
        /"               const leveragePercent = \(maxLeverage / 125\) \* 100;/g,
        '                const leveragePercent = (maxLeverage / 125) * 100;'
    );
    
    htmlContent = htmlContent.replace(
        /"               const barColor = leveragePercent > 80 \? '#00ff88' : leveragePercent > 50 \? '#ffaa00' : '#ff4444';/g,
        '                const barColor = leveragePercent > 80 ? \'#00ff88\' : leveragePercent > 50 ? \'#ffaa00\' : \'#ff4444\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="graph-bar">';/g,
        '                html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-container">';/g,
        '                html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-fill" style="width: \$\{leveragePercent\}%; background-color: \$\{barColor\};"><\/div>';/g,
        '                html += \'<div class="bar-fill" style="width: ${leveragePercent}%; background-color: ${barColor};"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="bar-value">\$\{maxLeverage\.toFixed\(0\)\}x<\/span>';/g,
        '                html += \'<span class="bar-value">${maxLeverage.toFixed(0)}x</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           \}\);/g,
        '            });'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<\/div><\/div>';/g,
        '            html += \'</div></div>\';'
    );
    
    // CORRECCIÓN 3: Continuar con el resto de strings malformados
    htmlContent = htmlContent.replace(
        /"           // Gráfico de Oportunidades por Sector/g,
        '            // Gráfico de Oportunidades por Sector'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<h3>🎯 Opportunity Score por Sector<\/h3>';/g,
        '            html += \'<h3>🎯 Opportunity Score por Sector</h3>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graphical-monitor">';/g,
        '            html += \'<div class="graphical-monitor">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graph-container">';/g,
        '            html += \'<div class="graph-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           sectors\.forEach\(sector => \{/g,
        '            sectors.forEach(sector => {'
    );
    
    htmlContent = htmlContent.replace(
        /"               const sectorData = data\.sectorAnalysis\[sector\];/g,
        '                const sectorData = data.sectorAnalysis[sector];'
    );
    
    htmlContent = htmlContent.replace(
        /"               // Verificar que sectorData existe/g,
        '                // Verificar que sectorData existe'
    );
    
    htmlContent = htmlContent.replace(
        /"               if \(!sectorData\) \{/g,
        '                if (!sectorData) {'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="graph-bar">';/g,
        '                    html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                    html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-container">';/g,
        '                    html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"><\/div>';/g,
        '                    html += \'<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<span class="bar-value">0\.0%<\/span>';/g,
        '                    html += \'<span class="bar-value">0.0%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                   return;/g,
        '                    return;'
    );
    
    htmlContent = htmlContent.replace(
        /"               \}/g,
        '                }'
    );
    
    htmlContent = htmlContent.replace(
        /"               const profitOpt = calculateProfitOptimization\(sectorData, null\);/g,
        '                const profitOpt = calculateProfitOptimization(sectorData, null);'
    );
    
    htmlContent = htmlContent.replace(
        /"               const opportunityPercent = \(profitOpt\?\.opportunity \|\| 0\) \* 100;/g,
        '                const opportunityPercent = (profitOpt?.opportunity || 0) * 100;'
    );
    
    htmlContent = htmlContent.replace(
        /"               const barColor = opportunityPercent > 70 \? '#00ff88' : opportunityPercent > 40 \? '#ffaa00' : '#ff4444';/g,
        '                const barColor = opportunityPercent > 70 ? \'#00ff88\' : opportunityPercent > 40 ? \'#ffaa00\' : \'#ff4444\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="graph-bar">';/g,
        '                html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-container">';/g,
        '                html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="bar-fill" style="width: \$\{opportunityPercent\}%; background-color: \$\{barColor\};"><\/div>';/g,
        '                html += \'<div class="bar-fill" style="width: ${opportunityPercent}%; background-color: ${barColor};"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="bar-value">\$\{opportunityPercent\.toFixed\(1\)\}%<\/span>';/g,
        '                html += \'<span class="bar-value">${opportunityPercent.toFixed(1)}%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           \}\);/g,
        '            });'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<\/div><\/div>';/g,
        '            html += \'</div></div>\';'
    );
    
    // CORRECCIÓN 4: Continuar con el resto de strings malformados
    htmlContent = htmlContent.replace(
        /"           // Resumen de Top Recomendaciones/g,
        '            // Resumen de Top Recomendaciones'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<h3>🏆 Top 3 Recomendaciones<\/h3>';/g,
        '            html += \'<h3>🏆 Top 3 Recomendaciones</h3>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graphical-monitor">';/g,
        '            html += \'<div class="graphical-monitor">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<div class="graph-container">';/g,
        '            html += \'<div class="graph-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           const recommendations = sectors\.map\(sector => \{/g,
        '            const recommendations = sectors.map(sector => {'
    );
    
    htmlContent = htmlContent.replace(
        /"               const sectorData = data\.sectorAnalysis\[sector\];/g,
        '                const sectorData = data.sectorAnalysis[sector];'
    );
    
    htmlContent = htmlContent.replace(
        /"               // Verificar que sectorData existe/g,
        '                // Verificar que sectorData existe'
    );
    
    htmlContent = htmlContent.replace(
        /"               if \(!sectorData\) \{/g,
        '                if (!sectorData) {'
    );
    
    htmlContent = htmlContent.replace(
        /"                   return \{/g,
        '                    return {'
    );
    
    htmlContent = htmlContent.replace(
        /"                       sector,/g,
        '                        sector,'
    );
    
    htmlContent = htmlContent.replace(
        /"                       score: 0,/g,
        '                        score: 0,'
    );
    
    htmlContent = htmlContent.replace(
        /"                       profit: 0,/g,
        '                        profit: 0,'
    );
    
    htmlContent = htmlContent.replace(
        /"                       leverage: 50,/g,
        '                        leverage: 50,'
    );
    
    htmlContent = htmlContent.replace(
        /"                       opportunity: 0/g,
        '                        opportunity: 0'
    );
    
    htmlContent = htmlContent.replace(
        /"                   \};/g,
        '                    };'
    );
    
    htmlContent = htmlContent.replace(
        /"               \}/g,
        '                }'
    );
    
    htmlContent = htmlContent.replace(
        /"               const profitOpt = calculateProfitOptimization\(sectorData, null\);/g,
        '                const profitOpt = calculateProfitOptimization(sectorData, null);'
    );
    
    htmlContent = htmlContent.replace(
        /"               const maxLeverage = calculateMaxLeverage\(sectorData, null\);/g,
        '                const maxLeverage = calculateMaxLeverage(sectorData, null);'
    );
    
    htmlContent = htmlContent.replace(
        /"               const expectedReturn = profitOpt\?\.expectedReturn \|\| 0;/g,
        '                const expectedReturn = profitOpt?.expectedReturn || 0;'
    );
    
    htmlContent = htmlContent.replace(
        /"               const opportunity = profitOpt\?\.opportunity \|\| 0;/g,
        '                const opportunity = profitOpt?.opportunity || 0;'
    );
    
    htmlContent = htmlContent.replace(
        /"               const score = \(expectedReturn \* 0\.4\) \+ \(maxLeverage \* 0\.3\) \+ \(opportunity \* 100 \* 0\.3\);/g,
        '                const score = (expectedReturn * 0.4) + (maxLeverage * 0.3) + (opportunity * 100 * 0.3);'
    );
    
    htmlContent = htmlContent.replace(
        /"               return \{/g,
        '                return {'
    );
    
    htmlContent = htmlContent.replace(
        /"                   sector,/g,
        '                    sector,'
    );
    
    htmlContent = htmlContent.replace(
        /"                   score,/g,
        '                    score,'
    );
    
    htmlContent = htmlContent.replace(
        /"                   profit: expectedReturn,/g,
        '                    profit: expectedReturn,'
    );
    
    htmlContent = htmlContent.replace(
        /"                   leverage: maxLeverage,/g,
        '                    leverage: maxLeverage,'
    );
    
    htmlContent = htmlContent.replace(
        /"                   opportunity: opportunity \* 100/g,
        '                    opportunity: opportunity * 100'
    );
    
    htmlContent = htmlContent.replace(
        /"               \};/g,
        '                };'
    );
    
    htmlContent = htmlContent.replace(
        /"           \}\)\.sort\(\(a, b\) => b\.score - a\.score\)\.slice\(0, 3\);/g,
        '            }).sort((a, b) => b.score - a.score).slice(0, 3);'
    );
    
    htmlContent = htmlContent.replace(
        /"           recommendations\.forEach\(\(rec, index\) => \{/g,
        '            recommendations.forEach((rec, index) => {'
    );
    
    htmlContent = htmlContent.replace(
        /"               const medal = index === 0 \? '🥇' : index === 1 \? '🥈' : '🥉';/g,
        '                const medal = index === 0 ? \'🥇\' : index === 1 ? \'🥈\' : \'🥉\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="recommendation-item">';/g,
        '                html += \'<div class="recommendation-item">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="medal">\$\{medal\}<\/div>';/g,
        '                html += \'<div class="medal">${medal}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="rec-info">';/g,
        '                html += \'<div class="rec-info">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="rec-sector">\$\{rec\.sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                html += \'<div class="rec-sector">${rec.sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<div class="rec-metrics">';/g,
        '                html += \'<div class="rec-metrics">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="rec-metric">Profit: \$\{rec\.profit\.toFixed\(2\)\}%<\/span>';/g,
        '                html += \'<span class="rec-metric">Profit: ${rec.profit.toFixed(2)}%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="rec-metric">Leverage: \$\{rec\.leverage\.toFixed\(0\)\}x<\/span>';/g,
        '                html += \'<span class="rec-metric">Leverage: ${rec.leverage.toFixed(0)}x</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<span class="rec-metric">Opportunity: \$\{rec\.opportunity\.toFixed\(1\)\}%<\/span>';/g,
        '                html += \'<span class="rec-metric">Opportunity: ${rec.opportunity.toFixed(1)}%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"               html \+= '<\/div>';/g,
        '                html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"           \}\);/g,
        '            });'
    );
    
    htmlContent = htmlContent.replace(
        /"           html \+= '<\/div><\/div>';/g,
        '            html += \'</div></div>\';'
    );
    
    // CORRECCIÓN 5: Continuar con el resto de strings malformados
    htmlContent = htmlContent.replace(
        /"            // Gráfico de Confluencia Multi-Timeframe por Sector/g,
        '            // Gráfico de Confluencia Multi-Timeframe por Sector'
    );
    
    htmlContent = htmlContent.replace(
        /"            html \+= '<h3>⏰ Multi-Timeframe Confluence por Sector<\/h3>';/g,
        '            html += \'<h3>⏰ Multi-Timeframe Confluence por Sector</h3>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"            html \+= '<div class="graphical-monitor">';/g,
        '            html += \'<div class="graphical-monitor">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"            html \+= '<div class="graph-container">';/g,
        '            html += \'<div class="graph-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"             sectors\.forEach\(sector => \{/g,
        '             sectors.forEach(sector => {'
    );
    
    htmlContent = htmlContent.replace(
        /"                 const sectorData = data\.sectorAnalysis\[sector\];/g,
        '                 const sectorData = data.sectorAnalysis[sector];'
    );
    
    htmlContent = htmlContent.replace(
        /"                 // Verificar que sectorData existe/g,
        '                 // Verificar que sectorData existe'
    );
    
    htmlContent = htmlContent.replace(
        /"                if \(!sectorData\) \{/g,
        '                if (!sectorData) {'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<div class="graph-bar">';/g,
        '                    html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\}<\/div>';/g,
        '                    html += \'<div class="bar-label">${sector.replace(/_/g, \' \')}</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<div class="bar-container">';/g,
        '                    html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<div class="bar-fill" style="width: 0%; background-color: #ff4444;"><\/div>';/g,
        '                    html += \'<div class="bar-fill" style="width: 0%; background-color: #ff4444;"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<span class="bar-value">0\.0%<\/span>';/g,
        '                    html += \'<span class="bar-value">0.0%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    html \+= '<\/div>';/g,
        '                    html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                    return;/g,
        '                    return;'
    );
    
    htmlContent = htmlContent.replace(
        /"                \}/g,
        '                }'
    );
    
    htmlContent = htmlContent.replace(
        /"                 const confluenceAnalysis = calculateTimeframeConfluence\(sector, sectorData\);/g,
        '                 const confluenceAnalysis = calculateTimeframeConfluence(sector, sectorData);'
    );
    
    htmlContent = htmlContent.replace(
        /"                 const confluencePercent = confluenceAnalysis\.overall \* 100;/g,
        '                 const confluencePercent = confluenceAnalysis.overall * 100;'
    );
    
    htmlContent = htmlContent.replace(
        /"                 const barColor = confluenceAnalysis\.goldenConfluence \? '#00ff88' : confluencePercent > 60 \? '#ffaa00' : '#ff4444';/g,
        '                 const barColor = confluenceAnalysis.goldenConfluence ? \'#00ff88\' : confluencePercent > 60 ? \'#ffaa00\' : \'#ff4444\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<div class="graph-bar">';/g,
        '                 html += \'<div class="graph-bar">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<div class="bar-label">\$\{sector\.replace\(/_/g, \' \'\)\} \(\$\{confluenceAnalysis\.optimalTF\}\)<\/div>';/g,
        '                 html += \'<div class="bar-label">${sector.replace(/_/g, \' \')} (${confluenceAnalysis.optimalTF})</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<div class="bar-container">';/g,
        '                 html += \'<div class="bar-container">\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<div class="bar-fill" style="width: \$\{confluencePercent\}%; background-color: \$\{barColor\};"><\/div>';/g,
        '                 html += \'<div class="bar-fill" style="width: ${confluencePercent}%; background-color: ${barColor};"></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<span class="bar-value">\$\{confluencePercent\.toFixed\(1\)\}%<\/span>';/g,
        '                 html += \'<span class="bar-value">${confluencePercent.toFixed(1)}%</span>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<\/div>';/g,
        '                 html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"                 html \+= '<\/div>';/g,
        '                 html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"             \}\);/g,
        '             });'
    );
    
    htmlContent = htmlContent.replace(
        /"             html \+= '<\/div><\/div>';/g,
        '             html += \'</div></div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"             html \+= '<\/div>';/g,
        '             html += \'</div>\';'
    );
    
    htmlContent = htmlContent.replace(
        /"             return html;/g,
        '             return html;'
    );
    
    htmlContent = htmlContent.replace(
        /"         \}/g,
        '         }'
    );
    
    // Guardar el archivo corregido
    fs.writeFileSync(htmlFile, htmlContent, 'utf8');
    
    const finalLines = htmlContent.split('\n').length;
    console.log(`📊 Líneas finales: ${finalLines}`);
    console.log(`📊 Diferencia: ${finalLines - originalLines} líneas`);
    
    console.log('\n✅ CORRECCIÓN DE STRINGS HTML COMPLETADA');
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
}

console.log('\n🎯 CORRECCIÓN DE STRINGS HTML FINALIZADA');
console.log('========================================================');

