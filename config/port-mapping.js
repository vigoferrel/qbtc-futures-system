// ========================================================
// QBTC FUTURES SYSTEM - MAPEO COMPLETO DE PUERTOS
// Sistema Anti-Conflicto en Rango Reservado 14000-14999
// ========================================================

export const QBTC_PORT_MAPPING = {
    // =====================================
    // CORE SERVICES (14000-14099)
    // =====================================
    CORE: {
        MASTER_CONTROL_HUB: 14001,
        MESSAGE_BUS: 14002,
        CONFIG_SERVICE: 14003,
        HEALTH_MONITOR: 14004,
        LLM_QUANTUM_ORCHESTRATOR: 50001 // Puerto del LLM Orchestrator (completamente nuevo)
    },

    // =====================================
    // ANALYSIS ENGINE (14100-14199)  
    // =====================================
    ANALYSIS: {
        CONSCIOUSNESS_ENGINE: 14102,
        QUANTUM_ANALYSIS_SERVER: 14103,
        DATA_INGESTION: 14104,
        QUANTUM_CORE: 50002, // Puerto completamente nuevo
        FEYNMAN_QUANTUM_SERVICE: 14107, // Puerto reasignado para evitar conflictos
        QUANTUM_LEVERAGE_ENGINE: 14108, // Puerto reasignado para evitar conflictos
        QUANTUM_OPPORTUNITY_SERVICE: 14109 // Puerto reasignado para evitar conflictos
    },

    // =====================================
    // EXECUTION ENGINE (14200-14299)
    // =====================================
    EXECUTION: {
        TRADING_EXECUTOR: 14201,
        POSITION_MANAGER: 14202,
        FUTURES_EXECUTION_SERVER: 50003, // Puerto completamente nuevo
        RISK_MANAGER: 14205, // Puerto reasignado para evitar conflictos
        ORDER_MANAGER: 14206 // Puerto reasignado para evitar conflictos
    },

    // =====================================
    // MONITORING & OBSERVABILITY (14300-14399)
    // =====================================
    MONITORING: {
        QUANTUM_STATE_MONITOR: 14301,
        METRICS_COLLECTOR: 14302,
        LOG_AGGREGATOR: 14303,
        ALERT_MANAGER: 14304,
        PERFORMANCE_MONITOR: 14305
    },

    // =====================================
    // DIMENSIONAL & HERMETIC (14400-14499)
    // =====================================
    DIMENSIONAL: {
        MERKABA_PROTOCOL: 14401,
        AKASHIC_ADAPTER: 14402,
        AKASHIC_PREDICTION: 14403,
        CONSCIOUSNESS_EVOLUTION: 14404,
        HERMETIC_DATA: 14405
    },

    // =====================================
    // QUANTUM ENGINES (14500-14599)
    // =====================================
    QUANTUM: {
        LEVERAGE_ENTROPY_ENGINE: 14501,
        QUANTUM_RESONANCE: 14502,
        CRYSTALLIZATION_ENGINE: 14503,
        BIG_BANG_CONTROLLER: 14504,
        COHERENCE_STABILIZER: 14505
    },

    // =====================================
    // FRONTEND & DASHBOARDS (14800-14899)
    // =====================================
    FRONTEND: {
        MAIN_DASHBOARD_SERVER: 14801,
        MULTIDIMENSIONAL_DASHBOARD: 14802,
        QUANTUM_UNIFIED_FRONTEND: 14803,
        API_GATEWAY: 14804,
        WEBSOCKET_SERVER: 14805
    },

    // =====================================
    // DATA & EXTERNAL (14900-14999)
    // =====================================
    DATA: {
        DATABASE_SERVER: 14901,
        CACHE_SERVER: 14902,
        BINANCE_PROXY: 14903,
        MARKET_DATA_FEED: 14904,
        BACKUP_SERVICE: 14905
    }
};

// =====================================
// UTILIDADES Y VALIDACIONES
// =====================================

/**
 * Obtener puerto por nombre de servicio
 */
export function getPortForService(serviceName) {
    for (const [category, services] of Object.entries(QBTC_PORT_MAPPING)) {
        if (services[serviceName]) {
            return services[serviceName];
        }
    }
    throw new Error(`Puerto no encontrado para servicio: ${serviceName}`);
}

/**
 * Validar que no hay puertos duplicados
 */
export function validatePortMapping() {
    const usedPorts = new Set();
    const conflicts = [];

    for (const [category, services] of Object.entries(QBTC_PORT_MAPPING)) {
        for (const [serviceName, port] of Object.entries(services)) {
            if (usedPorts.has(port)) {
                conflicts.push(`Puerto ${port} duplicado: ${category}.${serviceName}`);
            }
            usedPorts.add(port);
        }
    }

    if (conflicts.length > 0) {
        throw new Error(`Conflictos de puerto detectados:\n${conflicts.join('\n')}`);
    }

    console.log(`[CHECK] Validación exitosa: ${usedPorts.size} puertos únicos asignados`);
    return true;
}

/**
 * Obtener todos los puertos en uso
 */
export function getAllPorts() {
    const ports = [];
    for (const [category, services] of Object.entries(QBTC_PORT_MAPPING)) {
        for (const [serviceName, port] of Object.entries(services)) {
            ports.push({
                category,
                service: serviceName,
                port,
                url: `http://localhost:${port}`
            });
        }
    }
    return ports.sort((a, b) => a.port - b.port);
}

/**
 * Generar documentación de puertos
 */
export function generatePortDocumentation() {
    console.log('\n[GALAXY] ===== QBTC SYSTEM PORT MAPPING =====');
    console.log(`[CALENDAR] Generado: ${new Date().toISOString()}`);
    console.log('[CHART] Rango reservado: 14000-14999\n');
    
    for (const [category, services] of Object.entries(QBTC_PORT_MAPPING)) {
        console.log(`📂 ${category}:`);
        for (const [serviceName, port] of Object.entries(services)) {
            console.log(`   ${port} → ${serviceName.toLowerCase().replace(/_/g, '-')}`);
        }
        console.log('');
    }
    
    console.log(`[TREND_UP] Total de servicios: ${getAllPorts().length}`);
    console.log('🔒 Puertos garantizados sin conflictos\n');
}

// Ejecutar validación al importar
try {
    validatePortMapping();
    console.log('[TARGET] Port mapping validado exitosamente');
} catch (error) {
    console.error('[X] Error en port mapping:', error.message);
    process.exit(1);
}

// Valores por defecto para compatibilidad
export default QBTC_PORT_MAPPING;
