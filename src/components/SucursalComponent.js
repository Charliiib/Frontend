import React from 'react'

export const SucursalComponent = () => {
  return (
                                <div class="row mt-1">
                                <div class="col-md-4">
                                    <label for="comercio" class="form-label">Comercio</label>
                                    <select class="form-select" id="comercio">
                                        <option selected value="">Selecciona un comercio</option>
                                        <option>Carrefour</option>
                                        <option>Coto</option>
                                        <option>Jumbo</option>
                                        <option>Disco</option>
                                        <option>Día</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="barrio" class="form-label">Barrios</label>
                                    <select class="form-select" id="barrio">
                                        <option selected value="">Selecciona un barrio</option>
                                        <option>Palermo</option>
                                        <option>Villa Ortuzar</option>
                                        <option>Devoto</option>
                                        <option>Flores</option>
                                        <option>Floresta</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label for="sucursal" class="form-label">Sucursal</label>
                                    <select class="form-select" id="sucursal">
                                        <option selected value="">Selecciona una sucursal</option>
                                        <option>a</option>
                                        <option>b</option>
                                        <option>c</option>
                                    </select>
                                </div>
                            </div>
  )
}


export default SucursalComponent;