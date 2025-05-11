import React from 'react'

export const CercanasComponent = () => {
  return (
     <div class="sidebar-section">
            <h3 class="sidebar-title"><i class="fas fa-map-marker-alt me-2"></i>Sucursales cercanas</h3>
            <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Carrefour - Microcentro
                    <span class="text-muted">0.5 km</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Coto - Once
                    <span class="text-muted">0.8 km</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Día - Almagro
                    <span class="text-muted">1.2 km</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Jumbo - Palermo
                    <span class="text-muted">1.5 km</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Disco - Recoleta
                    <span class="text-muted">1.8 km</span>
                </li>
            </ul>
        </div>
  )
}
export default CercanasComponent;