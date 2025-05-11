import React from 'react'

export const UbicacionComponent = () => {
  return (
        <div class="sidebar-section">
            <h3 class="sidebar-title"><i class="fas fa-location-dot me-2"></i>Mi ubicación</h3>
            <div class="d-flex align-items-center">
                <i class="fas fa-location-crosshairs me-2"></i>
                <span>Av. Corrientes 1234, CABA</span>
            </div>
            <button class="btn btn-sm btn-outline-primary mt-2 w-100">Cambiar ubicación</button>
        </div>
  )
}

export default UbicacionComponent;