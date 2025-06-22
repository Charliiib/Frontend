import React, { useState, useEffect } from 'react';
import { Dropdown, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import { FaMapMarkerAlt, FaMap, FaStore, FaBuilding } from 'react-icons/fa';

export const ResultsComponent = ({ selectedProduct, selectedSucursales }) => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortMethod, setSortMethod] = useState('default');

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSucursales.length === 0) {
        setSucursales([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let sucursalesData = selectedSucursales.map(sucursal => ({
          idComercio: sucursal.idComercio,
          idBandera: sucursal.idBandera,
          idSucursal: sucursal.idSucursal,
          sucursalesNombre: sucursal.sucursalesNombre,
          comercioBanderaNombre: sucursal.comercio.comercioBanderaNombre,
          barrioNombre: sucursal.barrio.barriosNombre,
          sucursalesLatitud: sucursal.sucursalesLatitud,
          sucursalesLongitud: sucursal.sucursalesLongitud,
          sucursalesLocalidad: sucursal.sucursalesLocalidad,
          imagenUrl: `https://imagenes.preciosclaros.gob.ar/comercios/${sucursal.idComercio}-${sucursal.idBandera}.jpg`,
          precio: null,
          precioLoading: false,
          precioError: null
        }));
        setSucursales(sucursalesData);

        if (selectedProduct) {
          await fetchPreciosForSucursales(sucursalesData);
        }
      } catch (err) {
        setError('Error al cargar las sucursales');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPreciosForSucursales = async (sucursalesData) => {
      try {
        setSucursales(prev => prev.map(s => ({ ...s, precioLoading: true })));

        const promises = sucursalesData.map(sucursal =>
          axios.get(`http://localhost:8080/api/productos/precios`, {
            params: {
              id_producto: selectedProduct.idProducto,
              id_comercio: sucursal.idComercio,
              id_bandera: sucursal.idBandera,
              id_sucursal: sucursal.idSucursal
            }
          }).catch(err => {
            console.error(`Error fetching price for sucursal ${sucursal.idSucursal}:`, err);
            return { data: null, error: 'Error al obtener precio' };
          })
        );

        const responses = await Promise.all(promises);

        setSucursales(prev =>
          prev.map((sucursal, index) => ({
            ...sucursal,
            precio: responses[index].data?.[0]?.productos_precio_lista || null,
            precioLoading: false,
            precioError: responses[index].error || null
          }))
        );
      } catch (err) {
        console.error('Error fetching prices:', err);
        setSucursales(prev =>
          prev.map(s => ({
            ...s,
            precioLoading: false,
            precioError: 'Error al obtener precio'
          }))
        );
      }
    };

    fetchData();
  }, [selectedProduct, selectedSucursales]);

  const sortSucursales = (method) => {
    setSortMethod(method);
    const sorted = [...sucursales];

    switch (method) {
      case 'nombre-asc':
        sorted.sort((a, b) => a.sucursalesNombre.localeCompare(b.sucursalesNombre));
        break;
      case 'nombre-desc':
        sorted.sort((a, b) => b.sucursalesNombre.localeCompare(a.sucursalesNombre));
        break;
      case 'comercio-asc':
        sorted.sort((a, b) => a.comercioBanderaNombre.localeCompare(b.comercioBanderaNombre));
        break;
      case 'comercio-desc':
        sorted.sort((a, b) => b.comercioBanderaNombre.localeCompare(a.comercioBanderaNombre));
        break;
      case 'precio-asc':
        sorted.sort((a, b) => (a.precio || Infinity) - (b.precio || Infinity));
        break;
      case 'precio-desc':
        sorted.sort((a, b) => (b.precio || -Infinity) - (a.precio || -Infinity));
        break;
    }

    setSucursales(sorted);
  };

  const getButtonText = () => {
    switch (sortMethod) {
      case 'nombre-asc': return 'Nombre (A-Z)';
      case 'nombre-desc': return 'Nombre (Z-A)';
      case 'comercio-asc': return 'Comercio (A-Z)';
      case 'comercio-desc': return 'Comercio (Z-A)';
      case 'precio-asc': return 'Menor precio';
      case 'precio-desc': return 'Mayor precio';
      default: return 'Ordenar por';
    }
  };

  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return 'Sin existencias';
    return `$${precio.toFixed(2)}`;
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  return (
    <main className="col-lg-9">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">
            Sucursales disponibles en barrio {selectedSucursales[0]?.barrio?.barriosNombre}
          </h2>
          {selectedProduct && (
            <p className="text-muted mt-1">{selectedProduct.descripcion}</p>
          )}
        </div>
        {loading && <Spinner animation="border" variant="primary" />}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {selectedSucursales.length === 0 && (
        <Alert variant="info">
          Seleccione un barrio y al menos un comercio para ver las sucursales disponibles
        </Alert>
      )}

      {sucursales.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="text-muted">
              Mostrando {sucursales.filter(s => !selectedProduct || s.precio !== null).length} resultados
            </div>

            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort">
                {getButtonText()}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Nombre</Dropdown.Header>
                <Dropdown.Item onClick={() => sortSucursales('nombre-asc')}>Nombre (A-Z)</Dropdown.Item>
                <Dropdown.Item onClick={() => sortSucursales('nombre-desc')}>Nombre (Z-A)</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Header>Comercio</Dropdown.Header>
                <Dropdown.Item onClick={() => sortSucursales('comercio-asc')}>Comercio (A-Z)</Dropdown.Item>
                <Dropdown.Item onClick={() => sortSucursales('comercio-desc')}>Comercio (Z-A)</Dropdown.Item>
                {selectedProduct && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Header>Precio</Dropdown.Header>
                    <Dropdown.Item onClick={() => sortSucursales('precio-asc')}>Menor precio</Dropdown.Item>
                    <Dropdown.Item onClick={() => sortSucursales('precio-desc')}>Mayor precio</Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {sucursales
              .filter(sucursal => !selectedProduct || sucursal.precio !== null)
              .map((sucursal, index) => (
                <Col key={index}>
                  <Card className="h-100 shadow border-0 rounded-4 card-hover" style={{ transition: 'all 0.3s ease-in-out' }}>
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={sucursal.imagenUrl}
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No+Image'; }}
                          alt="Comercio"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                          className="me-3"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate"><FaStore className="me-1" /> {sucursal.comercioBanderaNombre}</h6>
                          <small className="text-muted text-truncate"><FaBuilding className="me-1" /> {sucursal.sucursalesNombre}</small>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <FaMapMarkerAlt className="me-2" />
                          {sucursal.sucursalesLocalidad}
                        </div>
                        {sucursal.sucursalesLatitud && sucursal.sucursalesLongitud && (
                          <div
                            className="d-flex align-items-center text-primary small"
                            style={{ cursor: 'pointer' }}
                            onClick={() => openGoogleMaps(sucursal.sucursalesLatitud, sucursal.sucursalesLongitud)}
                          >
                            <FaMap className="me-2" />
                            Ver en el mapa
                          </div>
                        )}
                      </div>

                      {/* Imagen del producto entre mapa y precio */}
                      {selectedProduct && (
                        <div className="text-center mb-3">
                          <img
                            src={`https://imagenes.preciosclaros.gob.ar/productos/${selectedProduct.idProducto}.jpg`}
                            alt="Producto"
                            style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '12px' }}
                            onError={(e) => { e.target.src = 'https://imgs.search.brave.com/5tfvD1JAMAiur92B3F3QdOz-w0KzEIIeMUcg1UFrK88/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvcHJl/dmlld3MvMDA1Lzcy/MC80MDgvbm9uXzJ4/L2Nyb3NzZWQtaW1h/Z2UtaWNvbi1waWN0/dXJlLW5vdC1hdmFp/bGFibGUtZGVsZXRl/LXBpY3R1cmUtc3lt/Ym9sLWZyZWUtdmVj/dG9yLmpwZw'; }}
                          />
                        </div>
                      )}

                      {selectedProduct && (
                        <div className="mt-auto">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="text-muted small">Precio:</span>
                            {sucursal.precioLoading ? (
                              <Spinner animation="border" size="sm" />
                            ) : sucursal.precioError ? (
                              <small className="text-danger">{sucursal.precioError}</small>
                            ) : (
                              <h4 className="text-success mb-0">{formatPrecio(sucursal.precio)}</h4>
                            )}
                          </div>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        </>
      )}
    </main>
  );
};

export default ResultsComponent;
