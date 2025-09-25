import React, { useState, useEffect } from 'react';
import api from '../api';
import axios from 'axios';

const SearchComponent = ({ onProductSelect, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [listasUsuario, setListasUsuario] = useState([]);
  const [mostrarListas, setMostrarListas] = useState(false);
  const [loadingListas, setLoadingListas] = useState(false);

  // Cargar listas del usuario cuando haya un producto seleccionado
  useEffect(() => {
    const cargarListasUsuario = async () => {
      if (selectedProduct && currentUser) {
        setLoadingListas(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(
            `http://localhost:8080/api/listas/usuario/${currentUser.idUsuario}`, 
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          setListasUsuario(response.data);
        } catch (error) {
          console.error('Error cargando listas:', error);
          setError('Error al cargar las listas');
        } finally {
          setLoadingListas(false);
        }
      }
    };

    cargarListasUsuario();
  }, [selectedProduct, currentUser]);

  // Función para limpiar la selección
  const clearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    setMostrarListas(false);
    if (onProductSelect) onProductSelect(null);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (selectedProduct) return;
      if (searchTerm.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/productos/buscar', {
          params: { 
            termino: searchTerm,
            limit: 15
          },
          signal: controller.signal
        });

        setResults(response.data);
      } catch (err) {
        if (!api.isCancel(err)) {
          setError('Error al buscar productos');
          console.error('Error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    const timerId = setTimeout(fetchResults, 300);

    return () => {
      controller.abort();
      clearTimeout(timerId);
    };
  }, [searchTerm, selectedProduct]);

  // Función para seleccionar un producto
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setResults([]);
    setMostrarListas(true); // Mostrar las listas al seleccionar producto
    if (onProductSelect) onProductSelect(product);
  };

  // Función para agregar producto a una lista
  const agregarALista = async (idLista) => {
    if (!selectedProduct || !currentUser) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/listas/${idLista}/productos/${selectedProduct.idProducto}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('✅ Producto agregado a la lista correctamente');
      
      // Recargar listas para actualizar contadores
      const listasResponse = await axios.get(
        `http://localhost:8080/api/listas/usuario/${currentUser.idUsuario}`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setListasUsuario(listasResponse.data);

    } catch (error) {
      console.error('Error agregando producto a lista:', error);
      if (error.response?.status === 400 && error.response?.data === "El producto ya está en la lista") {
        alert('⚠️ Este producto ya está en la lista seleccionada');
      } else {
        alert('❌ Error al agregar el producto a la lista');
      }
    }
  };

  return (
    <div className="row g-3 mt-4">
      <div className="col-md-12">
        <h5 className="card-title">Seleccionar Producto</h5>
        
        {/* Mostrar producto seleccionado o campo de búsqueda */}
        {selectedProduct ? (
          <div className="selected-product mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h6 className="card-title mb-0">Producto seleccionado:</h6>
                  <button 
                    onClick={clearSelection}
                    className="btn btn-sm btn-outline-danger"
                  >
                    <i className="fas fa-times me-1"></i> Cambiar
                  </button>
                </div>
                
                <div className="d-flex align-items-center border rounded p-3">
                  {/* Imagen del producto */}
                  <div className="flex-shrink-0 me-3" style={{width: '100px'}}>
                    <img
                      src={`https://imagenes.preciosclaros.gob.ar/productos/${selectedProduct.idProducto}.jpg`}
                      className="img-fluid rounded"
                      alt={selectedProduct.descripcion}
                      style={{maxHeight: '100px', objectFit: 'cover', width: '100px'}}
                      onError={(e) => e.target.src = 'https://imgs.search.brave.com/iZ5bRHWm5Be4PX36SU1WlpoGm0oZrBH25fySv3EV3_w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS8yOTM0NzY1/LzUzMTkyL3YvNDUw/L2RlcG9zaXRwaG90/b3NfNTMxOTIwODIw/LXN0b2NrLWlsbHVz/dHJhdGlvbi1waG90/by1hdmFpbGFibGUt/dmVjdG9yLWljb24t/ZGVmYXVsdC5qcGc'}
                    />
                  </div>
                  
                  {/* Información del producto */}
                  <div className="flex-grow-1">
                    <p className="mb-1 fw-bold">{selectedProduct.descripcion}</p>
                    {selectedProduct.marca && (
                      <small className="text-muted">Marca: {selectedProduct.marca}</small>
                    )}
                    <br />
                    <small className="text-muted">ID: {selectedProduct.idProducto}</small>
                  </div>
                </div>

                {/* Sección para agregar a listas - SOLO si el usuario está logueado */}
                {currentUser && mostrarListas && (
                  <div className="mt-3">
                    <h6 className="mb-2">
                      <i className="fas fa-list me-1"></i>
                      Agregar a mis listas:
                    </h6>
                    
                    {loadingListas ? (
                      <div className="text-center">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Cargando listas...</span>
                        </div>
                        <small className="text-muted">Cargando listas...</small>
                      </div>
                    ) : listasUsuario.length === 0 ? (
                      <div className="alert alert-warning py-2">
                        <small>
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          No tienes listas creadas. Crea una lista primero.
                        </small>
                      </div>
                    ) : (
                      <div className="list-group">
                        {listasUsuario.map((lista) => (
                          <div key={lista.idListas} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                              <span className="fw-medium">{lista.nombreLista}</span>
                              <br />
                              <small className="text-muted">
                                {lista.cantidadProductos || 0} productos
                              </small>
                            </div>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => agregarALista(lista.idListas)}
                              title={`Agregar a ${lista.nombreLista}`}
                            >
                              <i className="fas fa-plus me-1"></i>
                              Agregar
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!currentUser && (
                  <div className="alert alert-info mt-3">
                    <small>
                      <i className="fas fa-info-circle me-1"></i>
                      Inicia sesión para agregar productos a tus listas
                    </small>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Ej: coca 375, fanta 500..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!!selectedProduct}
            />
            {loading && (
              <span className="input-group-text">
                <div className="spinner-border spinner-border-sm" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
              </span>
            )}
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Resultados de búsqueda (solo si no hay producto seleccionado) */}
        {!selectedProduct && results.length > 0 && (
          <div className="list-group mt-3">
            {results.map(producto => (
              <button
                key={producto.idProducto}
                className="list-group-item list-group-item-action text-start p-0 border-0 mb-2"
                onClick={() => handleSelectProduct(producto)}
              >
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center">
                      {/* Imagen del producto */}
                      <div className="flex-shrink-0 me-3" style={{width: '80px'}}>
                        <img
                          src={`https://imagenes.preciosclaros.gob.ar/productos/${producto.idProducto}.jpg`}
                          className="img-fluid rounded"
                          alt={producto.descripcion}
                          style={{height: '80px', objectFit: 'cover', width: '80px'}}
                          onError={(e) => e.target.src = 'https://imgs.search.brave.com/iZ5bRHWm5Be4PX36SU1WlpoGm0oZrBH25fySv3EV3_w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS8yOTM0NzY1/LzUzMTkyL3YvNDUw/L2RlcG9zaXRwaG90/b3NfNTMxOTIwODIw/LXN0b2NrLWlsbHVz/dHJhdGlvbi1waG90/by1hdmFpbGFibGUt/dmVjdG9yLWljb24t/ZGVmYXVsdC5qcGc'}
                        />
                      </div>
                      
                      {/* Información del producto */}
                      <div className="flex-grow-1">
                        <p className="mb-1 fw-medium">{producto.descripcion}</p>
                        {producto.marca && (
                          <small className="text-muted">Marca: {producto.marca}</small>
                        )}
                        <br />
                        <small className="text-muted">ID: {producto.idProducto}</small>
                      </div>
                      
                      {/* Icono de selección */}
                      <div className="flex-shrink-0">
                        <i className="fas fa-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!selectedProduct && !loading && searchTerm.length >= 2 && results.length === 0 && (
          <div className="alert alert-warning mt-3">
            No se encontraron productos que coincidan con "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchComponent;