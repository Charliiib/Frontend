import React from "react";

export const SearchComponent = () => {
  return (
    <div>
      <h5 class="card-title mb-4 mt-4">Buscar productos</h5>
      <div class="row g-3 mb-3">
        <div class="col-md-8">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Qué producto estás buscando?"
              id="productSearch"
            />
          </div>
        </div>
        <div class="col-md-4">
          <button type="submit" class="btn btn-primary w-100">
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;
