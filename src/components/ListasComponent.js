import React from 'react'

export const ListasComponent = () => {
  return (
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
  )
}
export default ListasComponent;