import React from 'react'

export const SearchComponent = () => {
  return (

        <div class="row justify-content-center pt-5">
            <div class="col-lg-12">
                <div class="card search-card">
                    <div class="card-body">
                        <h5 class="card-title mb-4">Buscar productos</h5>
                        <form id="searchForm">
                            <div class="row g-3">
                                <div class="col-md-8">
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="fas fa-search"></i></span>
                                        <input type="text" class="form-control" placeholder="Qué producto estás buscando?" id="productSearch"/>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <button type="submit" class="btn btn-primary w-100">Buscar</button>
                                </div>
                            </div>
                            
                            <div class="row mt-3">
                                <div class="col-md-6">
                                    <label for="comercio" class="form-label">Comercio</label>
                                    <select class="form-select" id="comercio">
                                        <option selected value="">Todos los comercios</option>
                                        <option>Carrefour</option>
                                        <option>Coto</option>
                                        <option>Jumbo</option>
                                        <option>Disco</option>
                                        <option>Día</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label for="sucursal" class="form-label">Sucursal</label>
                                    <select class="form-select" id="sucursal">
                                        <option selected value="">Sucursales mas cercanas</option>
                                        <option>a</option>
                                        <option>b</option>
                                        <option>c</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
  )
}


export default SearchComponent;