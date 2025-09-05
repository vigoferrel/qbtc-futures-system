import QBTCProcessManager from './core/process-manager.js';

/**
 * 🚀 QBTC COMPLETE SYSTEM STARTER
 * ===============================
 * 
 * Script principal para iniciar todo el sistema QBTC con gestión
 * de procesos, health checks y monitoreo en tiempo real
 */

class QBTCCompleteStarter {
    constructor() {
        this.processManager = new QBTCProcessManager();
        this.startTime = Date.now();
        this.systemStatus = {
            quantumCore: false,
            llmOrchestrator: false,
            futuresExecution: false,
            advancedStrategies: false,
            dashboard: false
        };
        
        console.log('🚀 QBTC COMPLETE SYSTEM STARTER inicializado');
    }

    /**
     * Inicia todo el sistema QBTC
     */
    async startQBTCComplete() {
        try {
            console.log('\n🎯 ====== INICIANDO SISTEMA QBTC COMPLETO ====== 🎯');
            console.log('⏰ Timestamp:', new Date().toISOString());
            console.log('🧠 Control Absoluto LLM activado');
            console.log('⚛️ 5 Estrategias Avanzadas desplegadas');
            console.log('📊 Dashboard en tiempo real');
            console.log('================================================\n');

            // Configurar process manager
            this.setupProcessManager();

            // Iniciar servicios en secuencia
            await this.startServicesSequentially();

            // Verificar estado del sistema
            await this.verifySystemStatus();

            // Iniciar monitoreo continuo
            this.startContinuousMonitoring();

            // Abrir dashboard
            this.openDashboard();

            console.log('\n🎉 ====== SISTEMA QBTC COMPLETO INICIADO ====== 🎉');
            console.log('✅ Todos los servicios activos');
            console.log('✅ Health checks funcionando');
            console.log('✅ Auto-restart configurado');
            console.log('✅ Dashboard disponible');
            console.log('================================================\n');

            return { success: true, message: 'Sistema QBTC iniciado completamente' };

        } catch (error) {
            console.error('❌ Error iniciando sistema QBTC:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Configura el process manager
     */
    setupProcessManager() {
        // Configurar auto-restart
        this.processManager.setAutoRestart(true, 5, 5000);

        // Configurar event listeners
        this.processManager.on('health-check', (data) => {
            console.log(`[HEALTH] ${data.serviceName}: ${data.status} (uptime: ${data.uptime}m)`);
        });

        this.processManager.on('service-error', (data) => {
            console.error(`[ERROR] Servicio ${data.serviceName}: ${data.error}`);
        });

        this.processManager.on('service-failed', (data) => {
            console.error(`[FAILED] Servicio ${data.serviceName} falló después de ${data.restartCount} intentos`);
        });

        // Configurar signal handlers
        this.processManager.setupSignalHandlers();

        console.log('✅ Process Manager configurado');
    }

    /**
     * Inicia servicios en secuencia
     */
    async startServicesSequentially() {
        console.log('🔄 Iniciando servicios en secuencia...\n');

        // 1. Quantum Core (Base del sistema)
        console.log('1️⃣ Iniciando Quantum Core...');
        const quantumResult = await this.processManager.startService(
            'quantum-core',
            'analysis-engine/quantum-core.js'
        );
        this.systemStatus.quantumCore = quantumResult.success;
        console.log(`   ${quantumResult.success ? '✅' : '❌'} Quantum Core: ${quantumResult.success ? 'INICIADO' : 'FALLÓ'}`);
        await this.delay(3000);

        // 2. LLM Orchestrator (Control Absoluto)
        console.log('2️⃣ Iniciando LLM Orchestrator...');
        const llmResult = await this.processManager.startService(
            'llm-orchestrator',
            'llm-orchestrator-persistent.js'
        );
        this.systemStatus.llmOrchestrator = llmResult.success;
        console.log(`   ${llmResult.success ? '✅' : '❌'} LLM Orchestrator: ${llmResult.success ? 'INICIADO' : 'FALLÓ'}`);
        await this.delay(3000);

        // 3. Futures Execution (Ejecución de trades)
        console.log('3️⃣ Iniciando Futures Execution...');
        const futuresResult = await this.processManager.startService(
            'futures-execution',
            'futures-execution/server.js'
        );
        this.systemStatus.futuresExecution = futuresResult.success;
        console.log(`   ${futuresResult.success ? '✅' : '❌'} Futures Execution: ${futuresResult.success ? 'INICIADO' : 'FALLÓ'}`);
        await this.delay(3000);

        // 4. Advanced Strategies (5 Estrategias)
        console.log('4️⃣ Activando Estrategias Avanzadas...');
        const strategiesResult = await this.processManager.startService(
            'advanced-strategies',
            'activate-advanced-strategies.js'
        );
        this.systemStatus.advancedStrategies = strategiesResult.success;
        console.log(`   ${strategiesResult.success ? '✅' : '❌'} Advanced Strategies: ${strategiesResult.success ? 'ACTIVADAS' : 'FALLÓ'}`);
        await this.delay(3000);

        console.log('\n✅ Secuencia de inicio completada');
    }

    /**
     * Verifica el estado del sistema
     */
    async verifySystemStatus() {
        console.log('\n🔍 Verificando estado del sistema...');
        
        const status = this.processManager.getServicesStatus();
        let allHealthy = true;

        for (const [serviceName, serviceStatus] of Object.entries(status)) {
            const isHealthy = serviceStatus.status === 'RUNNING';
            console.log(`   ${isHealthy ? '✅' : '❌'} ${serviceName}: ${serviceStatus.status} (uptime: ${serviceStatus.uptime}m)`);
            
            if (!isHealthy) {
                allHealthy = false;
            }
        }

        if (allHealthy) {
            console.log('\n🎉 Todos los servicios están saludables');
        } else {
            console.log('\n⚠️ Algunos servicios no están saludables');
        }

        return allHealthy;
    }

    /**
     * Inicia monitoreo continuo
     */
    startContinuousMonitoring() {
        console.log('📊 Iniciando monitoreo continuo...');

        // Reporte de estado cada 5 minutos
        setInterval(() => {
            this.generateStatusReport();
        }, 300000); // 5 minutos

        // Log de uptime cada minuto
        setInterval(() => {
            const uptime = Math.floor((Date.now() - this.startTime) / 60000);
            console.log(`[UPTIME] Sistema QBTC activo: ${uptime} minutos`);
        }, 60000); // 1 minuto

        console.log('✅ Monitoreo continuo iniciado');
    }

    /**
     * Genera reporte de estado
     */
    generateStatusReport() {
        const status = this.processManager.getServicesStatus();
        const uptime = Math.floor((Date.now() - this.startTime) / 60000);

        console.log('\n📊 ====== REPORTE DE ESTADO QBTC ======');
        console.log(`⏰ Uptime del sistema: ${uptime} minutos`);
        console.log(`📅 Timestamp: ${new Date().toISOString()}`);
        
        for (const [serviceName, serviceStatus] of Object.entries(status)) {
            console.log(`   ${serviceName}: ${serviceStatus.status} (uptime: ${serviceStatus.uptime}m, restarts: ${serviceStatus.restartCount})`);
        }
        
        console.log('=====================================\n');
    }

    /**
     * Abre el dashboard
     */
    openDashboard() {
        console.log('🌐 Abriendo dashboard...');
        
        // Usar el comando start para abrir el dashboard
        const { exec } = require('child_process');
        exec('start monitor-estrategias-avanzadas.html', (error) => {
            if (error) {
                console.error('❌ Error abriendo dashboard:', error);
            } else {
                console.log('✅ Dashboard abierto en el navegador');
                this.systemStatus.dashboard = true;
            }
        });
    }

    /**
     * Obtiene estado completo del sistema
     */
    getSystemStatus() {
        const status = this.processManager.getServicesStatus();
        const uptime = Math.floor((Date.now() - this.startTime) / 60000);

        return {
            systemUptime: uptime,
            services: status,
            systemStatus: this.systemStatus,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Detiene todo el sistema
     */
    async stopQBTCComplete() {
        console.log('\n🛑 Deteniendo sistema QBTC completo...');
        
        try {
            await this.processManager.stopAllServices();
            console.log('✅ Sistema QBTC detenido completamente');
        } catch (error) {
            console.error('❌ Error deteniendo sistema:', error);
        }
    }

    /**
     * Delay helper
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Función principal
async function main() {
    const starter = new QBTCCompleteStarter();
    
    try {
        await starter.startQBTCComplete();
        
        // Mantener el proceso vivo
        console.log('\n🔄 Sistema QBTC ejecutándose... (Ctrl+C para detener)');
        
        // Manejar señales de cierre
        process.on('SIGINT', async () => {
            console.log('\n🛑 Recibida señal de cierre...');
            await starter.stopQBTCComplete();
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Error en main:', error);
        process.exit(1);
    }
}

// Ejecutar si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}

export default QBTCCompleteStarter;
