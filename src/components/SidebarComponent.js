import React from 'react'

export const SidebarComponent = () => {


    
  return (


    <aside class="col-lg-3">
        <div class="sidebar-section">
            <h3 class="sidebar-title"><i class="fas fa-list me-2"></i>Listas</h3>
            <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Gaseosas
                    <span class="badge bg-primary rounded-pill">25</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Galletitas
                    <span class="badge bg-primary rounded-pill">18</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Lácteos
                    <span class="badge bg-primary rounded-pill">32</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Compra Jueves
                    <span class="badge bg-primary rounded-pill">12</span>
                </li>
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    Limpieza
                    <span class="badge bg-primary rounded-pill">15</span>
                </li>
            </ul>
        </div>
        
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
        
        <div class="sidebar-section">
            <h3 class="sidebar-title"><i class="fas fa-location-dot me-2"></i>Mi ubicación</h3>
            <div class="d-flex align-items-center">
                <i class="fas fa-location-crosshairs me-2"></i>
                <span>Av. Corrientes 1234, CABA</span>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2 w-100">Cambiar ubicación</button>
        </div>
    </aside>


  )
}

export default SidebarComponent;