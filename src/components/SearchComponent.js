import React, { useState, useEffect } from 'react';

export const SearchComponent = () => {
  const [comercios, setComercios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedComercio, setSelectedComercio] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para sucursales (se cargarían según el comercio seleccionado)
  const [sucursales, setSucursales] = useState([]);
  const [selectedSucursal, setSelectedSucursal] = useState('');

  // Obtener comercios al montar el componente
  useEffect(() => {
    const fetchComercios = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8080/api/comercios');
        if (!response.ok) {
          throw new Error('Error al obtener los comercios');
        }
        const data = await response.json();
        setComercios(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComercios();
  }, []);

  // Ejemplo: cargar sucursales cuando se selecciona un comercio
  useEffect(() => {
    if (selectedComercio) {
      // Aquí iría la llamada para obtener sucursales del comercio seleccionado
      // fetchSucursales(selectedComercio);
    }
  }, [selectedComercio]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica para manejar la búsqueda
    console.log({
      searchTerm,
      selectedComercio,
      selectedSucursal
    });
    // Aquí podrías hacer la llamada a tu API de búsqueda
  };

  return (
    <div className="row justify-content-center pt-5">
      <div className="col-lg-12">
        <div className="card search-card">
          <div className="card-body">
            <h5 className="card-title mb-4">Buscar productos</h5>
            <form id="searchForm" onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-search"></i></span>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Qué producto estás buscando?" 
                      id="productSearch"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <button type="submit" className="btn btn-primary w-100">Buscar</button>
                </div>
              </div>
              
              <div className="row mt-3">
                <div className="col-md-6">
                  <label htmlFor="comercio" className="form-label">Comercio</label>
                  <select 
                    className="form-select" 
                    id="comercio"
                    value={selectedComercio}
                    onChange={(e) => setSelectedComercio(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Todos los comercios</option>
                    {comercios.map((comercio) => (
                      <option 
                        key={`${comercio.id.idComercio}-${comercio.id.idBandera}`} 
                        value={`${comercio.id.idComercio}-${comercio.id.idBandera}`}
                      >
                        {comercio.nombre}
                      </option>
                    ))}
                  </select>
                  {loading && <small className="text-muted">Cargando comercios...</small>}
                  {error && <small className="text-danger">{error}</small>}
                </div>
                <div className="col-md-6">
                  <label htmlFor="sucursal" className="form-label">Sucursal</label>
                  <select 
                    className="form-select" 
                    id="sucursal"
                    value={selectedSucursal}
                    onChange={(e) => setSelectedSucursal(e.target.value)}
                    disabled={!selectedComercio}
                  >
                    <option value="">Sucursales mas cercanas</option>
                    {sucursales.map((sucursal) => (
                      <option key={sucursal.id} value={sucursal.id}>
                        {sucursal.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchComponent;