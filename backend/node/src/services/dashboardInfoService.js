// backend/node/src/services/dashboardInfoService.js

/**
 * Obtiene información de la DB para el dashboard.
 *
 * @param {Object} db - Instancia de conexión a la base de datos.
 * @param {String} info - Nombre de la info a obtener.
 * @returns {Promise<Array>} - JSON con todas las infos usadas en el dashboard.
 */
export async function getDashboardInfo(db, info) {
    const executable_functions = {
        "machine_type": () => db.getTotalMachineType(),
        "machine_faults": () => db.getTotalMachineFault(),
        "machine_reviews": () => db.getNextReviews(),
        "client_locations": () => db.getClientLocations(),
    }
    return await executable_functions[info]();
}