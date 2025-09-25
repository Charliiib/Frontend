import React, { useState, useEffect } from 'react';
import api from '../api';

const SearchComponent = ({ onProductSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  

  // Función para limpiar la selección
  const clearSelection = () => {
    setSelectedProduct(null);
    setSearchTerm('');
    if (onProductSelect) onProductSelect(null);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchResults = async () => {
      if (selectedProduct) return; // No buscar si ya hay un producto seleccionado
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
    setResults([]); // Limpiar otros resultados
    if (onProductSelect) onProductSelect(product);
  };

  return (
      <div className="row g-3 mt-4">
        <div className="col-md-12">
              <h5 className="card-title">Seleccionar Producto</h5>
              
              {/* Mostrar producto seleccionado o campo de búsqueda */}
              {selectedProduct ? (
                <div className="selected-product mb-3 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      
                      <div className="d-flex align-items-center border rounded p-3">
                        {/* Imagen a la izquierda */}
                        <div className="flex-shrink-0 me-3" style={{width: '150px'}}>
                          <img
                            src={`https://imagenes.preciosclaros.gob.ar/productos/${selectedProduct.idProducto}.jpg`}
                            className="img-fluid rounded"
                            alt={`Producto ${selectedProduct.nombre || selectedProduct.idProducto}`}
                            style={{maxHeight: '150px', objectFit: 'cover'}}
                            onError={(e) => e.target.src = 'https://imgs.search.brave.com/5tfvD1JAMAiur92B3F3QdOz-w0KzEIIeMUcg1UFrK88/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvcHJl/dmlld3MvMDA1Lzcy/MC80MDgvbm9uXzJ4/L2Nyb3NzZWQtaW1h/Z2UtaWNvbi1waWN0/dXJlLW5vdC1hdmFp/bGFibGUtZGVsZXRl/LXBpY3R1cmUtc3lt/Ym9sLWZyZWUtdmVj/dG9yLmpwZw'}
                          />
                        </div>
                        
                        {/* Contenido a la derecha */}
                        <div className="flex-grow-1">
                          <div className="h-100 d-flex flex-column justify-content-center">
                            <p className="mb-2">{selectedProduct.descripcion || 'Descripción no disponible'}</p>
                            <small className="text-muted">ID: {selectedProduct.idProducto}</small>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={clearSelection}
                      className="btn btn-sm btn-outline-danger"
                    >
                      <i className="fas fa-times"></i> Cambiar
                    </button>
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
                      className="list-group-item list-group-item-action text-start"
                      onClick={() => handleSelectProduct(producto)}
                    >
                      <div className="d-flex align-items-center border rounded p-3">
                        {/* Imagen a la izquierda */}
                        <div className="flex-shrink-0 me-3" style={{width: '150px'}}>
                          <img
                            src={`https://imagenes.preciosclaros.gob.ar/productos/${producto.idProducto}.jpg`}
                            className="product-img rounded"
                            alt={`Producto ${producto.nombre || producto.idProducto}`}
                            style={{maxHeight: '150px', objectFit: 'cover'}}
                            onError={(e) => e.target.src = 'https://static.vecteezy.com/system/resources/previews/010/302/093/non_2x/oops-web-error-line-icon-illustration-vector.jpg'}
                          />
                        </div>
                        
                        {/* Contenido a la derecha */}
                        <div className="flex-grow-1">
                          <div className="h-100 d-flex flex-column justify-content-center">
                            <p className="mb-2">{producto.descripcion || 'Descripción no disponible'}</p>
                            <small className="text-muted">ID: {producto.idProducto}</small>
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