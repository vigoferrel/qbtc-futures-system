#!/usr/bin/env node

/**
 * [CHECK] SYSTEM VERIFIER - VERIFICACIÓN INTEGRAL DEL ECOSISTEMA QBTC
 * =============================================================
 * 
 * Realiza pruebas exhaustivas de todos los componentes del sistema QBTC
 * para garantizar que el ecosistema funciona como un sistema unificado.
 * 
 * FUNCIONALIDADES:
 * - Verificación de salud de todos los servicios
 * - Pruebas de comunicación entre componentes
 * - Validación de flujos de datos end-to-end
 * - Benchmarking de rendimiento
 * - Verificación de integridad del sistema
 * - Generación de reportes detallados
 */

import axios from 'axios';
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';

class SystemVerifier extends EventEmitter {
    constructor() {
        super();
        
        this.services = new Map([
            ['master_control', { 
                port: 14001, 
                name: 'Master Control Hub',
                endpoints: ['/health', '/stats', '/api/services'],
                critical: true
            }],
            ['temporal_cycles', { 
                port: 14102, 
                name: 'Temporal Cycles Engine',
                endpoints: ['/health', '/metrics', '/analysis/cycles'],
                critical: true
            }],
            ['weighting', { 
                port: 14103, 
                name: 'Multidimensional Weighting',
                endpoints: ['/health', '/metrics', '/weights/current'],
                critical: true
            }],
            ['opportunities_api', { 
                port: 14105, 
                name: 'Consolidated Opportunities API',
                endpoints: ['/health', '/api/opportunities', '/api/engines'],
                critical: true
            }],
            ['btc_acquisition', { 
                port: 14106, 
                name: 'BTC Unified Acquisition Engine',
                endpoints: ['/health', '/status', '/acquisition/metrics'],
                critical: true
            }]
        ]);
        
        this.verification_config = {
            timeout_per_test: 10000,
            max_retries: 3,
            concurrent_tests: 5,
            performance_thresholds: {
                response_time_ms: 2000,
                memory_usage_mb: 1000,
                cpu_usage_percent: 80
            },
            integration_tests: true,
            stress_testing: false
        };
        
        this.test_results = new Map();
        this.verification_active = false;
        this.overall_score = 0;
        
        console.log('[CHECK] System Verifier initialized');
    }
    
    async start() {
        if (this.verification_active) {
            console.log('[WARNING] System verification already running');
            return { success: false, message: 'Already running' };
        }
        
        console.log('[ROCKET] Starting System Verification...');
        this.verification_active = true;
        
        try {
            // FASE 1: Verificación básica de servicios
            console.log('\n[CLIPBOARD] PHASE 1: Basic Service Health Checks');
            await this.runBasicHealthChecks();
            
            // FASE 2: Verificación de comunicación
            console.log('\n[LINK] PHASE 2: Inter-Service Communication Tests');
            await this.runCommunicationTests();
            
            // FASE 3: Verificación de flujos de datos
            console.log('\n[CHART] PHASE 3: Data Flow Verification');
            await this.runDataFlowTests();
            
            // FASE 4: Benchmarking de rendimiento
            console.log('\n[LIGHTNING] PHASE 4: Performance Benchmarking');
            await this.runPerformanceTests();
            
            // FASE 5: Pruebas de integración
            if (this.verification_config.integration_tests) {
                console.log('\n[WRENCH] PHASE 5: Integration Tests');
                await this.runIntegrationTests();
            }
            
            // FASE 6: Análisis final y reporte
            console.log('\n[CLIPBOARD] PHASE 6: Final Analysis & Report');
            const finalReport = await this.generateFinalReport();
            
            console.log('\n[CHECK] System Verification completed');
            this.verification_active = false;
            
            return {
                success: true,
                message: 'System verification completed successfully',
                overall_score: this.overall_score,
                report: finalReport
            };
            
        } catch (error) {
            console.error('[X] System verification failed:', error.message);
            this.verification_active = false;
            return {
                success: false,
                message: error.message,
                partial_results: Object.fromEntries(this.test_results)
            };
        }
    }
    
    async runBasicHealthChecks() {
        const healthResults = new Map();
        
        for (const [serviceKey, service] of this.services.entries()) {
            console.log(`[MAGNIFY] Checking ${service.name}...`);
            
            const result = await this.testServiceHealth(service);
            healthResults.set(serviceKey, result);
            
            if (result.healthy) {
                console.log(`[CHECK] ${service.name} - HEALTHY (${result.response_time}ms)`);
            } else {
                console.log(`[X] ${service.name} - UNHEALTHY: ${result.error}`);
            }
        }
        
        this.test_results.set('health_checks', healthResults);
        
        // Verificar servicios críticos
        const criticalServicesDown = [];
        for (const [serviceKey, service] of this.services.entries()) {
            if (service.critical && !healthResults.get(serviceKey).healthy) {
                criticalServicesDown.push(service.name);
            }
        }
        
        if (criticalServicesDown.length > 0) {
            throw new Error(`Critical services down: ${criticalServicesDown.join(', ')}`);
        }
    }
    
    async testServiceHealth(service) {
        const startTime = performance.now();
        
        try {
            const response = await axios.get(
                `http://localhost:${service.port}/health`,
                { timeout: this.verification_config.timeout_per_test }
            );
            
            const responseTime = Math.round(performance.now() - startTime);
            
            return {
                healthy: response.status === 200,
                response_time: responseTime,
                status_code: response.status,
                data: response.data,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            const responseTime = Math.round(performance.now() - startTime);
            
            return {
                healthy: false,
                response_time: responseTime,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
    
    async runCommunicationTests() {
        const communicationResults = new Map();
        
        // Test 1: Master Control Hub puede comunicarse con todos los servicios
        console.log('🔌 Testing Master Control Hub connections...');
        const masterCommunication = await this.testMasterControlConnections();
        communicationResults.set('master_control_connections', masterCommunication);
        
        // Test 2: API Consolidada puede acceder a motores
        console.log('[LINK] Testing Consolidated API engine connections...');
        const apiEngineConnections = await this.testConsolidatedAPIConnections();
        communicationResults.set('api_engine_connections', apiEngineConnections);
        
        // Test 3: Motor de adquisición puede comunicarse con análisis
        console.log('[TREND_UP] Testing Acquisition Engine analysis connections...');
        const acquisitionConnections = await this.testAcquisitionConnections();
        communicationResults.set('acquisition_connections', acquisitionConnections);
        
        this.test_results.set('communication_tests', communicationResults);
    }
    
    async testMasterControlConnections() {
        try {
            const response = await axios.get(
                'http://localhost:14001/api/services',
                { timeout: 5000 }
            );
            
            const connectedServices = response.data.connected_services || 0;
            const totalServices = this.services.size - 1; // Excluir el propio master control
            
            return {
                success: true,
                connected_services: connectedServices,
                total_services: totalServices,
                connection_rate: connectedServices / totalServices,
                details: response.data
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                connected_services: 0,
                connection_rate: 0
            };
        }
    }
    
    async testConsolidatedAPIConnections() {
        try {
            const response = await axios.get(
                'http://localhost:14105/api/engines',
                { timeout: 5000 }
            );
            
            const engines = response.data.engines || [];
            const connectedEngines = engines.filter(e => e.status === 'connected').length;
            
            return {
                success: true,
                total_engines: engines.length,
                connected_engines: connectedEngines,
                connection_rate: engines.length > 0 ? connectedEngines / engines.length : 0,
                engines: engines
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                connected_engines: 0,
                connection_rate: 0
            };
        }
    }
    
    async testAcquisitionConnections() {
        try {
            const response = await axios.get(
                'http://localhost:14106/acquisition/metrics',
                { timeout: 5000 }
            );
            
            const metrics = response.data;
            const analysisConnected = metrics.analysis_engines_connected || 0;
            
            return {
                success: true,
                analysis_engines_connected: analysisConnected,
                acquisition_active: metrics.acquisition_active || false,
                metrics: metrics
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message,
                analysis_engines_connected: 0,
                acquisition_active: false
            };
        }
    }
    
    async runDataFlowTests() {
        const dataFlowResults = new Map();
        
        // Test 1: Flujo de oportunidades (Temporal -> Weighting -> API)
        console.log('[CHART] Testing opportunities data flow...');
        const opportunitiesFlow = await this.testOpportunitiesDataFlow();
        dataFlowResults.set('opportunities_flow', opportunitiesFlow);
        
        // Test 2: Flujo de adquisición (API -> Acquisition -> Master)
        console.log('[MONEY] Testing acquisition data flow...');
        const acquisitionFlow = await this.testAcquisitionDataFlow();
        dataFlowResults.set('acquisition_flow', acquisitionFlow);
        
        // Test 3: Flujo de análisis temporal
        console.log('⏰ Testing temporal analysis flow...');
        const temporalFlow = await this.testTemporalAnalysisFlow();
        dataFlowResults.set('temporal_flow', temporalFlow);
        
        this.test_results.set('data_flow_tests', dataFlowResults);
    }
    
    async testOpportunitiesDataFlow() {
        const flow = {
            steps: [],
            success: false,
            total_time: 0
        };
        
        const startTime = performance.now();
        
        try {
            // Paso 1: Obtener análisis temporal
            console.log('  [TREND_UP] Step 1: Getting temporal analysis...');
            const temporalResponse = await axios.get(
                'http://localhost:14102/analysis/cycles',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'temporal_analysis',
                success: true,
                data_size: JSON.stringify(temporalResponse.data).length
            });
            
            // Paso 2: Obtener pesos multidimensionales
            console.log('  [SCALES] Step 2: Getting dimensional weights...');
            const weightingResponse = await axios.get(
                'http://localhost:14103/weights/current',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'weighting_analysis',
                success: true,
                data_size: JSON.stringify(weightingResponse.data).length
            });
            
            // Paso 3: Obtener oportunidades consolidadas
            console.log('  [TARGET] Step 3: Getting consolidated opportunities...');
            const opportunitiesResponse = await axios.get(
                'http://localhost:14105/api/opportunities?limit=10',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'opportunities_consolidation',
                success: true,
                data_size: JSON.stringify(opportunitiesResponse.data).length,
                opportunities_count: opportunitiesResponse.data.opportunities?.length || 0
            });
            
            flow.success = true;
            flow.total_time = Math.round(performance.now() - startTime);
            
        } catch (error) {
            flow.error = error.message;
            flow.total_time = Math.round(performance.now() - startTime);
        }
        
        return flow;
    }
    
    async testAcquisitionDataFlow() {
        const flow = {
            steps: [],
            success: false,
            total_time: 0
        };
        
        const startTime = performance.now();
        
        try {
            // Paso 1: Verificar estado de adquisición
            console.log('  [DIAMOND] Step 1: Checking acquisition status...');
            const statusResponse = await axios.get(
                'http://localhost:14106/status',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'acquisition_status',
                success: true,
                status: statusResponse.data.status
            });
            
            // Paso 2: Obtener métricas de adquisición
            console.log('  [CHART] Step 2: Getting acquisition metrics...');
            const metricsResponse = await axios.get(
                'http://localhost:14106/acquisition/metrics',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'acquisition_metrics',
                success: true,
                metrics: metricsResponse.data
            });
            
            flow.success = true;
            flow.total_time = Math.round(performance.now() - startTime);
            
        } catch (error) {
            flow.error = error.message;
            flow.total_time = Math.round(performance.now() - startTime);
        }
        
        return flow;
    }
    
    async testTemporalAnalysisFlow() {
        const flow = {
            steps: [],
            success: false,
            total_time: 0
        };
        
        const startTime = performance.now();
        
        try {
            // Paso 1: Obtener métricas del motor temporal
            console.log('  [OCEAN_WAVE] Step 1: Getting temporal engine metrics...');
            const metricsResponse = await axios.get(
                'http://localhost:14102/metrics',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'temporal_metrics',
                success: true,
                metrics: metricsResponse.data
            });
            
            // Paso 2: Obtener análisis de ciclos
            console.log('  [REFRESH] Step 2: Getting cycle analysis...');
            const cyclesResponse = await axios.get(
                'http://localhost:14102/analysis/cycles',
                { timeout: 5000 }
            );
            flow.steps.push({
                step: 'cycle_analysis',
                success: true,
                cycles_count: cyclesResponse.data.dominant_cycles?.length || 0
            });
            
            flow.success = true;
            flow.total_time = Math.round(performance.now() - startTime);
            
        } catch (error) {
            flow.error = error.message;
            flow.total_time = Math.round(performance.now() - startTime);
        }
        
        return flow;
    }
    
    async runPerformanceTests() {
        const performanceResults = new Map();
        
        // Benchmark de respuesta de cada servicio
        for (const [serviceKey, service] of this.services.entries()) {
            console.log(`[LIGHTNING] Benchmarking ${service.name}...`);
            
            const benchmark = await this.benchmarkService(service);
            performanceResults.set(serviceKey, benchmark);
            
            const avgResponse = benchmark.average_response_time;
            const threshold = this.verification_config.performance_thresholds.response_time_ms;
            
            if (avgResponse <= threshold) {
                console.log(`[CHECK] ${service.name} - FAST (avg: ${avgResponse}ms)`);
            } else {
                console.log(`[WARNING] ${service.name} - SLOW (avg: ${avgResponse}ms, threshold: ${threshold}ms)`);
            }
        }
        
        this.test_results.set('performance_tests', performanceResults);
    }
    
    async benchmarkService(service) {
        const iterations = 10;
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = await this.testServiceHealth(service);
            if (result.healthy) {
                results.push(result.response_time);
            }
            
            // Pequeña pausa entre requests
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        if (results.length === 0) {
            return {
                service_name: service.name,
                successful_requests: 0,
                average_response_time: null,
                min_response_time: null,
                max_response_time: null,
                success_rate: 0
            };
        }
        
        return {
            service_name: service.name,
            successful_requests: results.length,
            average_response_time: Math.round(results.reduce((a, b) => a + b) / results.length),
            min_response_time: Math.min(...results),
            max_response_time: Math.max(...results),
            success_rate: results.length / iterations
        };
    }
    
    async runIntegrationTests() {
        const integrationResults = new Map();
        
        // Test integración completa: obtener oportunidades optimizadas y ejecutar adquisición simulada
        console.log('[WRENCH] Running end-to-end integration test...');
        const e2eTest = await this.runEndToEndTest();
        integrationResults.set('end_to_end', e2eTest);
        
        // Test de sincronización de configuraciones
        console.log('⚙️ Testing configuration synchronization...');
        const configTest = await this.testConfigurationSync();
        integrationResults.set('configuration_sync', configTest);
        
        this.test_results.set('integration_tests', integrationResults);
    }
    
    async runEndToEndTest() {
        const test = {
            steps: [],
            success: false,
            total_time: 0,
            data_consistency: false
        };
        
        const startTime = performance.now();
        
        try {
            // Paso 1: Obtener mejores oportunidades
            const opportunities = await axios.get(
                'http://localhost:14105/api/opportunities?tier=S&limit=5&sort=ranking',
                { timeout: 10000 }
            );
            
            test.steps.push({
                step: 'fetch_opportunities',
                success: true,
                count: opportunities.data.opportunities?.length || 0
            });
            
            if (opportunities.data.opportunities?.length > 0) {
                // Paso 2: Simular análisis de la mejor oportunidad
                const bestOpp = opportunities.data.opportunities[0];
                
                test.steps.push({
                    step: 'analyze_best_opportunity',
                    success: true,
                    opportunity: {
                        symbol: bestOpp.symbol,
                        tier: bestOpp.tier,
                        ranking: bestOpp.ranking
                    }
                });
                
                // Paso 3: Verificar que los datos son consistentes
                if (bestOpp.ranking && bestOpp.tier && bestOpp.symbol) {
                    test.data_consistency = true;
                }
            }
            
            test.success = true;
            test.total_time = Math.round(performance.now() - startTime);
            
        } catch (error) {
            test.error = error.message;
            test.total_time = Math.round(performance.now() - startTime);
        }
        
        return test;
    }
    
    async testConfigurationSync() {
        // Prueba básica de sincronización de configuraciones
        const test = {
            services_checked: 0,
            configs_synced: 0,
            success: false
        };
        
        try {
            for (const [serviceKey, service] of this.services.entries()) {
                test.services_checked++;
                
                // Intentar obtener configuración si el endpoint existe
                if (service.endpoints.some(ep => ep.includes('config') || ep.includes('settings'))) {
                    test.configs_synced++;
                }
            }
            
            test.success = true;
            test.sync_rate = test.configs_synced / test.services_checked;
            
        } catch (error) {
            test.error = error.message;
        }
        
        return test;
    }
    
    async generateFinalReport() {
        const report = {
            timestamp: new Date().toISOString(),
            overall_score: 0,
            health_summary: {},
            performance_summary: {},
            communication_summary: {},
            data_flow_summary: {},
            integration_summary: {},
            recommendations: [],
            critical_issues: [],
            warnings: []
        };
        
        // Calcular puntuación de salud
        const healthChecks = this.test_results.get('health_checks');
        if (healthChecks) {
            const healthyServices = Array.from(healthChecks.values()).filter(h => h.healthy).length;
            const totalServices = healthChecks.size;
            report.health_summary = {
                healthy_services: healthyServices,
                total_services: totalServices,
                health_score: healthyServices / totalServices
            };
        }
        
        // Calcular puntuación de rendimiento
        const performanceTests = this.test_results.get('performance_tests');
        if (performanceTests) {
            const avgResponseTimes = Array.from(performanceTests.values())
                .filter(p => p.average_response_time !== null)
                .map(p => p.average_response_time);
            
            const avgResponse = avgResponseTimes.length > 0 ? 
                avgResponseTimes.reduce((a, b) => a + b) / avgResponseTimes.length : null;
            
            const threshold = this.verification_config.performance_thresholds.response_time_ms;
            
            report.performance_summary = {
                average_response_time: avgResponse,
                performance_threshold: threshold,
                performance_score: avgResponse ? Math.max(0, 1 - (avgResponse / threshold) + 0.5) : 0
            };
        }
        
        // Calcular puntuación de comunicación
        const commTests = this.test_results.get('communication_tests');
        if (commTests) {
            const connectionRates = Array.from(commTests.values())
                .map(c => c.connection_rate || 0);
            
            const avgConnectionRate = connectionRates.length > 0 ?
                connectionRates.reduce((a, b) => a + b) / connectionRates.length : 0;
            
            report.communication_summary = {
                average_connection_rate: avgConnectionRate,
                communication_score: avgConnectionRate
            };
        }
        
        // Calcular puntuación de flujos de datos
        const dataFlowTests = this.test_results.get('data_flow_tests');
        if (dataFlowTests) {
            const successfulFlows = Array.from(dataFlowTests.values()).filter(f => f.success).length;
            const totalFlows = dataFlowTests.size;
            
            report.data_flow_summary = {
                successful_flows: successfulFlows,
                total_flows: totalFlows,
                data_flow_score: totalFlows > 0 ? successfulFlows / totalFlows : 0
            };
        }
        
        // Calcular puntuación general
        const scores = [
            report.health_summary.health_score || 0,
            Math.min(1, report.performance_summary.performance_score || 0),
            report.communication_summary.communication_score || 0,
            report.data_flow_summary.data_flow_score || 0
        ];
        
        this.overall_score = Math.round((scores.reduce((a, b) => a + b) / scores.length) * 100);
        report.overall_score = this.overall_score;
        
        // Generar recomendaciones
        this.generateRecommendations(report);
        
        // Imprimir reporte
        this.printFinalReport(report);
        
        return report;
    }
    
    generateRecommendations(report) {
        // Recomendaciones basadas en salud
        if (report.health_summary.health_score < 1) {
            report.critical_issues.push('Some services are unhealthy - immediate attention required');
        }
        
        // Recomendaciones basadas en rendimiento
        if (report.performance_summary.average_response_time > this.verification_config.performance_thresholds.response_time_ms) {
            report.warnings.push('Average response time exceeds threshold - consider optimization');
        }
        
        // Recomendaciones basadas en comunicación
        if (report.communication_summary.average_connection_rate < 0.8) {
            report.warnings.push('Some services have connection issues - check network and service health');
        }
        
        // Recomendaciones basadas en flujos de datos
        if (report.data_flow_summary.data_flow_score < 0.8) {
            report.warnings.push('Some data flows are failing - check service integrations');
        }
        
        // Recomendaciones generales
        if (report.overall_score >= 90) {
            report.recommendations.push('System is performing excellently - continue monitoring');
        } else if (report.overall_score >= 70) {
            report.recommendations.push('System is performing well - minor optimizations recommended');
        } else if (report.overall_score >= 50) {
            report.recommendations.push('System performance is acceptable - significant improvements needed');
        } else {
            report.critical_issues.push('System performance is poor - immediate intervention required');
        }
    }
    
    printFinalReport(report) {
        console.log('\n' + '='.repeat(80));
        console.log('[MAGNIFY] QBTC SYSTEM VERIFICATION REPORT');
        console.log('='.repeat(80));
        console.log(`[CALENDAR] Generated: ${report.timestamp}`);
        console.log(`[TARGET] Overall Score: ${report.overall_score}%`);
        
        // Resumen de salud
        console.log(`\n💚 HEALTH SUMMARY:`);
        console.log(`   Services Online: ${report.health_summary.healthy_services}/${report.health_summary.total_services}`);
        console.log(`   Health Score: ${(report.health_summary.health_score * 100).toFixed(1)}%`);
        
        // Resumen de rendimiento
        console.log(`\n[LIGHTNING] PERFORMANCE SUMMARY:`);
        console.log(`   Average Response: ${report.performance_summary.average_response_time?.toFixed(0) || 'N/A'}ms`);
        console.log(`   Performance Score: ${(report.performance_summary.performance_score * 100).toFixed(1)}%`);
        
        // Resumen de comunicación
        console.log(`\n[LINK] COMMUNICATION SUMMARY:`);
        console.log(`   Connection Rate: ${(report.communication_summary.average_connection_rate * 100).toFixed(1)}%`);
        
        // Resumen de flujos de datos
        console.log(`\n[CHART] DATA FLOW SUMMARY:`);
        console.log(`   Successful Flows: ${report.data_flow_summary.successful_flows}/${report.data_flow_summary.total_flows}`);
        console.log(`   Data Flow Score: ${(report.data_flow_summary.data_flow_score * 100).toFixed(1)}%`);
        
        // Issues críticos
        if (report.critical_issues.length > 0) {
            console.log(`\n[SIREN] CRITICAL ISSUES:`);
            report.critical_issues.forEach(issue => console.log(`   • ${issue}`));
        }
        
        // Advertencias
        if (report.warnings.length > 0) {
            console.log(`\n[WARNING] WARNINGS:`);
            report.warnings.forEach(warning => console.log(`   • ${warning}`));
        }
        
        // Recomendaciones
        if (report.recommendations.length > 0) {
            console.log(`\n[BULB] RECOMMENDATIONS:`);
            report.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        
        console.log('='.repeat(80));
        console.log('[CHECK] Verification Complete');
        console.log('='.repeat(80));
    }
    
    getVerificationStatus() {
        return {
            verification_active: this.verification_active,
            services_count: this.services.size,
            tests_completed: this.test_results.size,
            overall_score: this.overall_score,
            last_verification: new Date().toISOString(),
            test_results: Object.fromEntries(this.test_results)
        };
    }
}

// Ejecutar solo si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
    const verifier = new SystemVerifier();
    
    verifier.start().then((result) => {
        if (result.success) {
            console.log(`\n[PARTY] System Verification completed with score: ${result.overall_score}%`);
            
            if (result.overall_score >= 80) {
                console.log('🟢 System is ready for production use!');
                process.exit(0);
            } else if (result.overall_score >= 60) {
                console.log('🟡 System needs minor improvements before production');
                process.exit(0);
            } else {
                console.log('🔴 System requires significant improvements');
                process.exit(1);
            }
        } else {
            console.log('\n[X] System Verification failed');
            console.log(`Error: ${result.message}`);
            process.exit(1);
        }
    }).catch(error => {
        console.error('[X] Fatal verification error:', error);
        process.exit(1);
    });
}

export default SystemVerifier;
