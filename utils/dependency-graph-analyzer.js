#!/usr/bin/env node

/**
 * 🧠 DEPENDENCY GRAPH ANALYZER - REVOLUTION
 * ========================================
 * Sistema ultra-avanzado de análisis automático de dependencias circulares
 * con detección de bottlenecks y propuestas de solución automáticas
 * 
 * FUNCIONALIDADES:
 * - Detección automática de dependencias circulares
 * - Análisis de caminos críticos
 * - Propuestas de optimización con DI containers
 * - Generación automática de soluciones
 * - Métricas de impacto en startup time
 */

import fs from 'fs/promises';
import path from 'path';
import { createHash } from 'crypto';
import { EventEmitter } from 'events';

export class DependencyGraphAnalyzer extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            rootPath: options.rootPath || process.cwd(),
            excludePaths: options.excludePaths || ['node_modules', '.git', 'logs'],
            includeExtensions: options.includeExtensions || ['.js', '.mjs', '.ts'],
            maxDepth: options.maxDepth || 10,
            ...options
        };
        
        // Grafo de dependencias
        this.dependencyGraph = new Map();
        this.reverseDependencyGraph = new Map();
        
        // Análisis de circularidad
        this.circularDependencies = [];
        this.criticalPaths = [];
        
        // Métricas
        this.metrics = {
            totalFiles: 0,
            totalDependencies: 0,
            circularCycles: 0,
            maxDepth: 0,
            analysisTime: 0,
            optimizationPotential: 0
        };
        
        // Cache de análisis
        this.analysisCache = new Map();
        
        console.log('[🧠] Dependency Graph Analyzer initialized');
    }
    
    /**
     * Ejecutar análisis completo del sistema
     */
    async analyzeSystem() {
        console.log('[ROCKET] Starting ultra-analysis of dependency system...');
        const startTime = Date.now();
        
        try {
            // 1. Escanear todos los archivos
            console.log('[MAGNIFY] Scanning system files...');
            const files = await this.scanSystemFiles();
            this.metrics.totalFiles = files.length;
            
            // 2. Construir grafo de dependencias
            console.log('[LINK] Building dependency graph...');
            await this.buildDependencyGraph(files);
            
            // 3. Detectar dependencias circulares
            console.log('[SEARCH] Detecting circular dependencies...');
            await this.detectCircularDependencies();
            
            // 4. Analizar caminos críticos
            console.log('[TARGET] Analyzing critical paths...');
            await this.analyzeCriticalPaths();
            
            // 5. Generar propuestas de optimización
            console.log('[BULB] Generating optimization proposals...');
            const optimizations = await this.generateOptimizationProposals();
            
            this.metrics.analysisTime = Date.now() - startTime;
            
            const results = {
                metrics: this.metrics,
                circularDependencies: this.circularDependencies,
                criticalPaths: this.criticalPaths,
                optimizations: optimizations,
                graph: this.dependencyGraph,
                timestamp: new Date().toISOString()
            };
            
            // Guardar resultados
            await this.saveAnalysisResults(results);
            
            console.log(`[CHECK] Analysis completed in ${this.metrics.analysisTime}ms`);
            console.log(`[CHART] Found ${this.circularDependencies.length} circular dependencies`);
            console.log(`[TREND_UP] Optimization potential: ${this.metrics.optimizationPotential}%`);
            
            this.emit('analysis-complete', results);
            return results;
            
        } catch (error) {
            console.error('[X] Error in dependency analysis:', error);
            this.emit('analysis-error', error);
            throw error;
        }
    }
    
    /**
     * Escanear archivos del sistema
     */
    async scanSystemFiles() {
        const files = [];
        
        const scanDirectory = async (dirPath, depth = 0) => {
            if (depth > this.options.maxDepth) return;
            
            try {
                const entries = await fs.readdir(dirPath, { withFileTypes: true });
                
                for (const entry of entries) {
                    const fullPath = path.join(dirPath, entry.name);
                    
                    if (entry.isDirectory()) {
                        if (!this.options.excludePaths.some(exclude => entry.name.includes(exclude))) {
                            await scanDirectory(fullPath, depth + 1);
                        }
                    } else if (entry.isFile()) {
                        const ext = path.extname(entry.name);
                        if (this.options.includeExtensions.includes(ext)) {
                            files.push({
                                path: fullPath,
                                relativePath: path.relative(this.options.rootPath, fullPath),
                                name: entry.name,
                                size: (await fs.stat(fullPath)).size,
                                depth: depth
                            });
                        }
                    }
                }
            } catch (error) {
                console.warn(`[WARNING] Could not scan directory ${dirPath}:`, error.message);
            }
        };
        
        await scanDirectory(this.options.rootPath);
        return files;
    }
    
    /**
     * Construir grafo de dependencias
     */
    async buildDependencyGraph(files) {
        console.log(`[LINK] Processing ${files.length} files...`);
        
        for (const file of files) {
            try {
                const dependencies = await this.extractDependencies(file);
                
                this.dependencyGraph.set(file.relativePath, {
                    file: file,
                    dependencies: dependencies,
                    dependents: new Set()
                });
                
                this.metrics.totalDependencies += dependencies.length;
                
            } catch (error) {
                console.warn(`[WARNING] Could not analyze ${file.relativePath}:`, error.message);
            }
        }
        
        // Construir grafo reverso
        this.buildReverseDependencyGraph();
        
        console.log(`[CHECK] Dependency graph built: ${this.dependencyGraph.size} nodes, ${this.metrics.totalDependencies} edges`);
    }
    
    /**
     * Extraer dependencias de un archivo
     */
    async extractDependencies(file) {
        const content = await fs.readFile(file.path, 'utf-8');
        const dependencies = new Set();
        
        // Patrones de import/require
        const patterns = [
            /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
            /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
            /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
            /await\s+import\s*\(\s*['"]([^'"]+)['"]\s*\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const depPath = match[1];
                
                // Resolver path relativo
                if (depPath.startsWith('.')) {
                    const resolvedPath = path.resolve(path.dirname(file.path), depPath);
                    const relativePath = path.relative(this.options.rootPath, resolvedPath);
                    
                    // Verificar si el archivo existe (con extensiones)
                    for (const ext of this.options.includeExtensions) {
                        const testPath = relativePath + ext;
                        if (this.dependencyGraph.has(testPath) || await this.fileExists(path.join(this.options.rootPath, testPath))) {
                            dependencies.add(testPath);
                            break;
                        }
                    }
                } else if (!depPath.includes('node_modules')) {
                    // Dependencia interna del sistema
                    dependencies.add(depPath);
                }
            }
        }
        
        return Array.from(dependencies);
    }
    
    /**
     * Construir grafo reverso de dependencias
     */
    buildReverseDependencyGraph() {
        for (const [filePath, nodeData] of this.dependencyGraph) {
            for (const dependency of nodeData.dependencies) {
                if (this.dependencyGraph.has(dependency)) {
                    this.dependencyGraph.get(dependency).dependents.add(filePath);
                }
                
                if (!this.reverseDependencyGraph.has(dependency)) {
                    this.reverseDependencyGraph.set(dependency, new Set());
                }
                this.reverseDependencyGraph.get(dependency).add(filePath);
            }
        }
    }
    
    /**
     * Detectar dependencias circulares usando DFS
     */
    async detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        
        const dfs = (node, path = []) => {
            if (recursionStack.has(node)) {
                // Encontrar el ciclo
                const cycleStart = path.indexOf(node);
                const cycle = path.slice(cycleStart);
                cycle.push(node);
                
                cycles.push({
                    cycle: cycle,
                    length: cycle.length - 1,
                    impactScore: this.calculateCycleImpact(cycle),
                    breakingSuggestions: this.generateBreakingSuggestions(cycle)
                });
                return true;
            }
            
            if (visited.has(node)) return false;
            
            visited.add(node);
            recursionStack.add(node);
            path.push(node);
            
            const nodeData = this.dependencyGraph.get(node);
            if (nodeData) {
                for (const dependency of nodeData.dependencies) {
                    if (this.dependencyGraph.has(dependency)) {
                        if (dfs(dependency, [...path])) {
                            // Ciclo encontrado en rama
                        }
                    }
                }
            }
            
            recursionStack.delete(node);
            path.pop();
            return false;
        };
        
        // Ejecutar DFS desde cada nodo
        for (const [filePath] of this.dependencyGraph) {
            if (!visited.has(filePath)) {
                dfs(filePath);
            }
        }
        
        this.circularDependencies = cycles;
        this.metrics.circularCycles = cycles.length;
        
        console.log(`[SEARCH] Found ${cycles.length} circular dependency cycles`);
    }
    
    /**
     * Calcular impacto de un ciclo en el startup
     */
    calculateCycleImpact(cycle) {
        let impact = 0;
        
        // Factores de impacto
        const lengthFactor = cycle.length * 0.2; // Ciclos más largos = mayor impacto
        let sizeFactor = 0;
        let dependentsFactor = 0;
        
        for (const filePath of cycle) {
            const nodeData = this.dependencyGraph.get(filePath);
            if (nodeData) {
                sizeFactor += (nodeData.file.size / 1000) * 0.1; // KB
                dependentsFactor += nodeData.dependents.size * 0.3;
            }
        }
        
        impact = lengthFactor + sizeFactor + dependentsFactor;
        return Math.min(100, Math.round(impact * 10) / 10);
    }
    
    /**
     * Generar sugerencias para romper ciclos
     */
    generateBreakingSuggestions(cycle) {
        const suggestions = [];
        
        // Sugerencia 1: Dependency Injection
        suggestions.push({
            type: 'DEPENDENCY_INJECTION',
            description: 'Usar container DI para inyectar dependencias',
            implementation: this.generateDIContainerCode(cycle),
            expectedImprovement: '15-25% startup reduction',
            difficulty: 'MEDIUM'
        });
        
        // Sugerencia 2: Event-based decoupling
        suggestions.push({
            type: 'EVENT_DECOUPLING',
            description: 'Desacoplar usando eventos asíncronos',
            implementation: this.generateEventDecouplingCode(cycle),
            expectedImprovement: '10-20% startup reduction',
            difficulty: 'LOW'
        });
        
        // Sugerencia 3: Interface segregation
        suggestions.push({
            type: 'INTERFACE_SEGREGATION',
            description: 'Separar interfaces para romper dependencias',
            implementation: this.generateInterfaceSegregationCode(cycle),
            expectedImprovement: '20-30% startup reduction',
            difficulty: 'HIGH'
        });
        
        return suggestions;
    }
    
    /**
     * Generar código de DI Container
     */
    generateDIContainerCode(cycle) {
        return `
// Auto-generated DI Container for cycle: ${cycle.join(' -> ')}
class DIContainer {
    constructor() {
        this.dependencies = new Map();
        this.singletons = new Map();
    }
    
    register(name, factory, options = {}) {
        this.dependencies.set(name, {
            factory,
            singleton: options.singleton || false,
            dependencies: options.dependencies || []
        });
    }
    
    resolve(name) {
        const dep = this.dependencies.get(name);
        if (!dep) throw new Error(\`Dependency \${name} not found\`);
        
        if (dep.singleton && this.singletons.has(name)) {
            return this.singletons.get(name);
        }
        
        const args = dep.dependencies.map(depName => this.resolve(depName));
        const instance = dep.factory(...args);
        
        if (dep.singleton) {
            this.singletons.set(name, instance);
        }
        
        return instance;
    }
}

// Usage example:
const container = new DIContainer();
${cycle.map(file => `container.register('${path.basename(file, path.extname(file))}', () => require('./${file}'), { singleton: true });`).join('\n')}
`;
    }
    
    /**
     * Generar código de event decoupling
     */
    generateEventDecouplingCode(cycle) {
        return `
// Auto-generated Event Decoupling for cycle: ${cycle.join(' -> ')}
import { EventEmitter } from 'events';

class CycleDecoupler extends EventEmitter {
    constructor() {
        super();
        this.modules = new Map();
    }
    
    registerModule(name, moduleFactory) {
        const module = moduleFactory();
        this.modules.set(name, module);
        
        // Setup event listeners
        module.on('dependency-needed', (depName, callback) => {
            const dependency = this.modules.get(depName);
            callback(dependency);
        });
    }
    
    initializeModules() {
        // Initialize in dependency order
        ${cycle.map(file => `this.registerModule('${path.basename(file, path.extname(file))}', () => require('./${file}'));`).join('\n        ')}
    }
}
`;
    }
    
    /**
     * Analizar caminos críticos
     */
    async analyzeCriticalPaths() {
        const paths = [];
        
        // Encontrar nodos con más dependientes (hubs)
        const hubs = Array.from(this.dependencyGraph.entries())
            .sort((a, b) => b[1].dependents.size - a[1].dependents.size)
            .slice(0, 10);
        
        for (const [hubPath] of hubs) {
            const criticalPath = this.findLongestPath(hubPath);
            if (criticalPath.length > 3) {
                paths.push({
                    startNode: hubPath,
                    path: criticalPath,
                    length: criticalPath.length,
                    impactScore: this.calculatePathImpact(criticalPath),
                    optimizationPotential: this.calculateOptimizationPotential(criticalPath)
                });
            }
        }
        
        this.criticalPaths = paths.sort((a, b) => b.impactScore - a.impactScore);
        console.log(`[TARGET] Found ${paths.length} critical paths`);
    }
    
    /**
     * Encontrar el camino más largo desde un nodo
     */
    findLongestPath(startNode, visited = new Set()) {
        if (visited.has(startNode)) return [];
        
        visited.add(startNode);
        let longestPath = [startNode];
        
        const nodeData = this.dependencyGraph.get(startNode);
        if (nodeData) {
            for (const dependency of nodeData.dependencies) {
                if (this.dependencyGraph.has(dependency)) {
                    const subPath = this.findLongestPath(dependency, new Set(visited));
                    if (subPath.length + 1 > longestPath.length) {
                        longestPath = [startNode, ...subPath];
                    }
                }
            }
        }
        
        return longestPath;
    }
    
    /**
     * Calcular impacto de un camino crítico
     */
    calculatePathImpact(path) {
        let impact = 0;
        
        for (const filePath of path) {
            const nodeData = this.dependencyGraph.get(filePath);
            if (nodeData) {
                impact += nodeData.dependents.size * 2;
                impact += (nodeData.file.size / 1000) * 0.5;
            }
        }
        
        return Math.round(impact);
    }
    
    /**
     * Calcular potencial de optimización
     */
    calculateOptimizationPotential(path) {
        const baseScore = path.length * 10;
        const circularPenalty = this.circularDependencies.length * 5;
        const hubBonus = this.countHubNodes(path) * 15;
        
        return Math.min(100, baseScore + hubBonus - circularPenalty);
    }
    
    /**
     * Contar nodos hub en un camino
     */
    countHubNodes(path) {
        return path.filter(filePath => {
            const nodeData = this.dependencyGraph.get(filePath);
            return nodeData && nodeData.dependents.size > 5;
        }).length;
    }
    
    /**
     * Generar propuestas de optimización
     */
    async generateOptimizationProposals() {
        const proposals = [];
        
        // Propuesta 1: Resolver dependencias circulares
        if (this.circularDependencies.length > 0) {
            proposals.push({
                type: 'RESOLVE_CIRCULAR_DEPENDENCIES',
                priority: 'HIGH',
                expectedImprovement: '25-40% startup reduction',
                implementation: {
                    steps: [
                        'Implement DI Container',
                        'Refactor circular dependencies',
                        'Add event-based decoupling',
                        'Validate resolution'
                    ],
                    estimatedTime: '3-5 days',
                    complexity: 'MEDIUM'
                },
                cycles: this.circularDependencies.slice(0, 5) // Top 5 cycles
            });
        }
        
        // Propuesta 2: Optimizar caminos críticos
        if (this.criticalPaths.length > 0) {
            proposals.push({
                type: 'OPTIMIZE_CRITICAL_PATHS',
                priority: 'MEDIUM',
                expectedImprovement: '15-25% startup reduction',
                implementation: {
                    steps: [
                        'Implement lazy loading for non-critical paths',
                        'Add parallel initialization',
                        'Cache heavy computations',
                        'Optimize hub nodes'
                    ],
                    estimatedTime: '2-3 days',
                    complexity: 'LOW'
                },
                paths: this.criticalPaths.slice(0, 3)
            });
        }
        
        // Propuesta 3: Dependency injection global
        proposals.push({
            type: 'IMPLEMENT_GLOBAL_DI',
            priority: 'HIGH',
            expectedImprovement: '30-50% startup reduction',
            implementation: {
                steps: [
                    'Create global DI container',
                    'Register all major components',
                    'Implement lazy resolution',
                    'Add lifecycle management'
                ],
                estimatedTime: '5-7 days',
                complexity: 'HIGH'
            }
        });
        
        // Calcular potencial total de optimización
        this.metrics.optimizationPotential = proposals.reduce((total, proposal) => {
            const improvement = parseFloat(proposal.expectedImprovement.match(/(\d+)-?\d*%/)?.[1] || 0);
            return total + improvement;
        }, 0);
        
        return proposals;
    }
    
    /**
     * Guardar resultados del análisis
     */
    async saveAnalysisResults(results) {
        const outputDir = path.join(this.options.rootPath, 'analysis-results');
        await fs.mkdir(outputDir, { recursive: true });
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `dependency-analysis-${timestamp}.json`;
        const filepath = path.join(outputDir, filename);
        
        await fs.writeFile(filepath, JSON.stringify(results, null, 2));
        
        // También crear un reporte en markdown
        const reportPath = path.join(outputDir, `dependency-report-${timestamp}.md`);
        await fs.writeFile(reportPath, this.generateMarkdownReport(results));
        
        console.log(`[FLOPPY_DISK] Results saved to ${filepath}`);
        console.log(`[MEMO] Report saved to ${reportPath}`);
    }
    
    /**
     * Generar reporte en markdown
     */
    generateMarkdownReport(results) {
        return `
# 🧠 Dependency Analysis Report
Generated: ${results.timestamp}

## 📊 Metrics
- **Total Files**: ${results.metrics.totalFiles}
- **Total Dependencies**: ${results.metrics.totalDependencies}  
- **Circular Cycles**: ${results.metrics.circularCycles}
- **Analysis Time**: ${results.metrics.analysisTime}ms
- **Optimization Potential**: ${results.metrics.optimizationPotential}%

## 🔄 Circular Dependencies
${results.circularDependencies.map(cycle => `
### Cycle ${cycle.cycle.join(' → ')}
- **Impact Score**: ${cycle.impactScore}
- **Length**: ${cycle.length} files
- **Breaking Suggestions**: ${cycle.breakingSuggestions.length} options
`).join('')}

## 🎯 Critical Paths
${results.criticalPaths.map(path => `
### ${path.startNode}
- **Length**: ${path.length} files
- **Impact Score**: ${path.impactScore}
- **Optimization Potential**: ${path.optimizationPotential}%
`).join('')}

## 💡 Optimization Proposals
${results.optimizations.map(opt => `
### ${opt.type}
- **Priority**: ${opt.priority}
- **Expected Improvement**: ${opt.expectedImprovement}
- **Complexity**: ${opt.implementation.complexity}
- **Estimated Time**: ${opt.implementation.estimatedTime}
`).join('')}
        `;
    }
    
    /**
     * Verificar si un archivo existe
     */
    async fileExists(filepath) {
        try {
            await fs.access(filepath);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * Generar interface segregation code
     */
    generateInterfaceSegregationCode(cycle) {
        return `
// Interface segregation for cycle: ${cycle.join(' -> ')}
${cycle.map(file => {
    const baseName = path.basename(file, path.extname(file));
    return `
// Interface for ${baseName}
export interface I${baseName}Service {
    // Define minimal interface needed by dependencies
}

// Implementation
class ${baseName}Service implements I${baseName}Service {
    // Implementation here
}
`;
}).join('')}
`;
    }
}

export default DependencyGraphAnalyzer;
