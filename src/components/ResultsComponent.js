import React, { useState, useEffect } from "react";
import { Dropdown, Spinner, Alert, Card, Row, Col, Tooltip, OverlayTrigger   } from "react-bootstrap";
import api from '../api';
import { 
  FaStore, 
  FaDollarSign, 
  FaMapMarkerAlt,
  FaSortAlphaDown, 
  FaSortAlphaDownAlt,
  FaSortNumericDown,
  FaSortNumericDownAlt,
  FaArrowDown,
  FaArrowUp,
  FaBuilding,
  FaMap,
  FaWalking
} from 'react-icons/fa';

// Función para calcular la distancia entre dos coordenadas (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  // Convertir grados a radianes
  const radLat1 = (lat1 * Math.PI) / 180;
  const radLat2 = (lat2 * Math.PI) / 180;
  const radLon1 = (lon1 * Math.PI) / 180;
  const radLon2 = (lon2 * Math.PI) / 180;

  // Diferencia de coordenadas
  const dLat = radLat2 - radLat1;
  const dLon = radLon2 - radLon1;

  // Fórmula de Haversine
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(radLat1) *
      Math.cos(radLat2) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Radio de la Tierra en kilómetros
  const R = 6371;
  return R * c;
};

const formatDistance = (distance) => {
  if (distance === null) return "Distancia no disponible";
  if (distance < 1) return `${Math.round(distance * 1000)} m`;
  return `${distance.toFixed(1)} km`;
};

export const ResultsComponent = ({
  selectedProduct,
  selectedSucursales,
  userLocation,
}) => {
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortMethod, setSortMethod] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedSucursales.length === 0) {
        setSucursales([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let sucursalesData = selectedSucursales.map((sucursal) => ({
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
          precioError: null,
        }));
        setSucursales(sucursalesData);

        if (selectedProduct) {
          await fetchPreciosForSucursales(sucursalesData);
        }
      } catch (err) {
        setError("Error al cargar las sucursales");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const fetchPreciosForSucursales = async (sucursalesData) => {
      try {
        setSucursales((prev) =>
          prev.map((s) => ({ ...s, precioLoading: true }))
        );

const promises = sucursalesData.map((sucursal) =>
  api.get(`/productos/precios`, {
    params: {
                id_producto: selectedProduct.idProducto,
                id_comercio: sucursal.idComercio,
                id_bandera: sucursal.idBandera,
                id_sucursal: sucursal.idSucursal,
              },
            })
            .catch((err) => {
              console.error(
                `Error fetching price for sucursal ${sucursal.idSucursal}:`,
                err
              );
              return { data: null, error: "Error al obtener precio" };
            })
        );

        const responses = await Promise.all(promises);

        setSucursales((prev) =>
          prev.map((sucursal, index) => ({
            ...sucursal,
            precio: responses[index].data?.[0]?.productos_precio_lista || null,
            precioLoading: false,
            precioError: responses[index].error || null,
          }))
        );
      } catch (err) {
        console.error("Error fetching prices:", err);
        setSucursales((prev) =>
          prev.map((s) => ({
            ...s,
            precioLoading: false,
            precioError: "Error al obtener precio",
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
      case "comercio-asc":
        sorted.sort((a, b) =>
          a.comercioBanderaNombre.localeCompare(b.comercioBanderaNombre)
        );
        break;
      case "comercio-desc":
        sorted.sort((a, b) =>
          b.comercioBanderaNombre.localeCompare(a.comercioBanderaNombre)
        );
        break;
      case "precio-asc":
        sorted.sort((a, b) => (a.precio || Infinity) - (b.precio || Infinity));
        break;
      case "precio-desc":
        sorted.sort(
          (a, b) => (b.precio || -Infinity) - (a.precio || -Infinity)
        );
        break;
      case "distancia-asc":
        if (userLocation) {
          sorted.sort((a, b) => {
            const distA =
              calculateDistance(
                userLocation.lat,
                userLocation.lng,
                a.sucursalesLatitud,
                a.sucursalesLongitud
              ) || Infinity;
            const distB =
              calculateDistance(
                userLocation.lat,
                userLocation.lng,
                b.sucursalesLatitud,
                b.sucursalesLongitud
              ) || Infinity;
            return distA - distB;
          });
        }
        break;
      case "distancia-desc":
        if (userLocation) {
          sorted.sort((a, b) => {
            const distA =
              calculateDistance(
                userLocation.lat,
                userLocation.lng,
                a.sucursalesLatitud,
                a.sucursalesLongitud
              ) || -Infinity;
            const distB =
              calculateDistance(
                userLocation.lat,
                userLocation.lng,
                b.sucursalesLatitud,
                b.sucursalesLongitud
              ) || -Infinity;
            return distB - distA;
          });
        }
        break;
    }

    setSucursales(sorted);
  };

// Colores temáticos
const COLORS = {
  comercio: '#6f42c1', // Púrpura
  precio: '#28a745',   // Verde
  distancia: '#007bff' // Naranja
};

// Componente TooltipWrapper para simplificar
const TooltipWrapper = ({ children, text }) => (
  <Tooltip id={`tooltip-${text}`}>{text}</Tooltip>
);

// En tu renderButtonContent:
const renderButtonContent = () => {
  const getIcon = () => {
    switch(sortMethod) {
      case 'comercio-asc': return <FaSortAlphaDown style={{ color: COLORS.comercio }} />;
      case 'comercio-desc': return <FaSortAlphaDownAlt style={{ color: COLORS.comercio }} />;
      case 'precio-asc': return <FaSortNumericDown style={{ color: COLORS.precio }} />;
      case 'precio-desc': return <FaSortNumericDownAlt style={{ color: COLORS.precio }} />;
      case 'distancia-asc': return <FaArrowDown style={{ color: COLORS.distancia }} />;
      case 'distancia-desc': return <FaArrowUp style={{ color: COLORS.distancia }} />;
      default: return <FaStore />;
    }
  };
  if (!sortMethod || sortMethod === 'default') {
    return (
      <div className="d-flex align-items-center">
        <FaStore />
        <span className="ms-2">Ordenar por</span>
      </div>
    );
  }

    return (
    <div className="d-flex align-items-center">
      {getIcon()}
      <span className="ms-2">
        {sortMethod === 'comercio-asc' && 'Comercio (A-Z)'}
        {sortMethod === 'comercio-desc' && 'Comercio (Z-A)'}
        {sortMethod === 'precio-asc' && 'Menor precio'}
        {sortMethod === 'precio-desc' && 'Mayor precio'}
        {sortMethod === 'distancia-asc' && 'Más cercano'}
        {sortMethod === 'distancia-desc' && 'Más lejano'}
      </span>
    </div>
  );
};


  const formatPrecio = (precio) => {
    if (precio === null || precio === undefined) return "Sin existencias";
    return `$${precio.toFixed(2)}`;
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  return (
  
    <main className="col-lg-9">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">
            Sucursales disponibles en barrio{" "}
            {selectedSucursales[0]?.barrio?.barriosNombre}
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
          Seleccione un barrio y al menos un comercio para ver las sucursales
          disponibles
        </Alert>
      )}

      {sucursales.length > 0 && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="text-muted">
              Mostrando{" "}
              {
                sucursales.filter((s) => !selectedProduct || s.precio !== null)
                  .length
              }{" "}
              resultados
            </div>

            <Dropdown>
              <Dropdown.Toggle variant="outline-secondary" id="dropdown-sort">
                <div style={{ display: "flex", alignItems: "center" }}>
                  {renderButtonContent()}
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu>
  {/* Sección Comercio */}
  <Dropdown.Header>
    <FaStore style={{ color: COLORS.comercio }} className="me-2" />
    <span style={{ color: COLORS.comercio }}>Comercio</span>
  </Dropdown.Header>
  
  <OverlayTrigger overlay={<TooltipWrapper text="Orden alfabético A-Z" />}>
    <Dropdown.Item onClick={() => sortSucursales('comercio-asc')}>
      <FaSortAlphaDown style={{ color: COLORS.comercio }} className="me-2" />
      A-Z
    </Dropdown.Item>
  </OverlayTrigger>
  
  <OverlayTrigger overlay={<TooltipWrapper text="Orden alfabético Z-A" />}>
    <Dropdown.Item onClick={() => sortSucursales('comercio-desc')}>
      <FaSortAlphaDownAlt style={{ color: COLORS.comercio }} className="me-2" />
      Z-A
    </Dropdown.Item>
  </OverlayTrigger>

  {/* Sección Precio */}
  {selectedProduct && (
    <>
      <Dropdown.Divider />
      <Dropdown.Header>
        <FaDollarSign style={{ color: COLORS.precio }} className="me-2" />
        <span style={{ color: COLORS.precio }}>Precio</span>
      </Dropdown.Header>
      
      <OverlayTrigger overlay={<TooltipWrapper text="Menor precio primero" />}>
        <Dropdown.Item onClick={() => sortSucursales('precio-asc')}>
          <FaSortNumericDown style={{ color: COLORS.precio }} className="me-2" />
          Menor a mayor
        </Dropdown.Item>
      </OverlayTrigger>
      
      <OverlayTrigger overlay={<TooltipWrapper text="Mayor precio primero" />}>
        <Dropdown.Item onClick={() => sortSucursales('precio-desc')}>
          <FaSortNumericDownAlt style={{ color: COLORS.precio }} className="me-2" />
          Mayor a menor
        </Dropdown.Item>
      </OverlayTrigger>
    </>
  )}

  {/* Sección Distancia */}
  {userLocation && (
    <>
      <Dropdown.Divider />
      <Dropdown.Header>
        <FaMapMarkerAlt style={{ color: COLORS.distancia }} className="me-2" />
        <span style={{ color: COLORS.distancia }}>Distancia</span>
      </Dropdown.Header>
      
      <OverlayTrigger overlay={<TooltipWrapper text="Más cercano primero" />}>
        <Dropdown.Item onClick={() => sortSucursales('distancia-asc')}>
          <FaArrowDown style={{ color: COLORS.distancia }} className="me-2" />
          Más cercano
        </Dropdown.Item>
      </OverlayTrigger>
      
      <OverlayTrigger overlay={<TooltipWrapper text="Más lejano primero" />}>
        <Dropdown.Item onClick={() => sortSucursales('distancia-desc')}>
          <FaArrowUp style={{ color: COLORS.distancia }} className="me-2" />
          Más lejano
        </Dropdown.Item>
      </OverlayTrigger>
    </>
  )}
</Dropdown.Menu>
            </Dropdown>
          </div>

          <Row xs={1} md={2} lg={3} className="g-4">
            {sucursales
              .filter(
                (sucursal) => !selectedProduct || sucursal.precio !== null
              )
              .map((sucursal, index) => (
                <Col key={index}>
                  <Card
                    className="h-100 shadow border-0 rounded-4 card-hover"
                    style={{ transition: "all 0.3s ease-in-out" }}
                  >
                    <Card.Body className="d-flex flex-column">
                      <div className="d-flex align-items-center mb-3">
                        <img
                          src={sucursal.imagenUrl}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/80?text=No+Image";
                          }}
                          alt="Comercio"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                          className="me-3"
                        />
                        <div>
                          <h6 className="mb-0 text-truncate">
                            <FaStore className="me-1" />{" "}
                            {sucursal.comercioBanderaNombre}
                          </h6>
                          <small className="text-muted text-truncate">
                            <FaBuilding className="me-1" />{" "}
                            {sucursal.sucursalesNombre}
                          </small>
                        </div>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex align-items-center text-muted small mb-2">
                          <FaMapMarkerAlt className="me-2" />
                          {sucursal.sucursalesLocalidad}
                        </div>
                        {sucursal.sucursalesLatitud &&
                          sucursal.sucursalesLongitud && (
                            <>
                              <div
                                className="d-flex align-items-center text-primary small"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  openGoogleMaps(
                                    sucursal.sucursalesLatitud,
                                    sucursal.sucursalesLongitud
                                  )
                                }
                              >
                                <FaMap className="me-2" />
                                Ver en el mapa
                              </div>
                              {userLocation && (
                                <div className="d-flex align-items-center text-muted small mt-2">
                                  <FaWalking className="me-2" />
                                  {formatDistance(
                                    calculateDistance(
                                      userLocation.lat,
                                      userLocation.lng,
                                      sucursal.sucursalesLatitud,
                                      sucursal.sucursalesLongitud
                                    )
                                  )}{" "}
                                  de distancia
                                </div>
                              )}
                            </>
                          )}
                      </div>

                      {/* Imagen del producto entre mapa y precio */}
                      {selectedProduct && (
                        <div className="text-center mb-3">
                          <img
                            src={`https://imagenes.preciosclaros.gob.ar/productos/${selectedProduct.idProducto}.jpg`}
                            alt="Producto"
                            style={{
                              width: "100px",
                              height: "100px",
                              objectFit: "contain",
                              borderRadius: "12px",
                            }}
                            onError={(e) => {
                              e.target.src =
                                "https://imgs.search.brave.com/5tfvD1JAMAiur92B3F3QdOz-w0KzEIIeMUcg1UFrK88/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9zdGF0/aWMudmVjdGVlenku/Y29tL3N5c3RlbS9y/ZXNvdXJjZXMvcHJl/dmlld3MvMDA1Lzcy/MC80MDgvbm9uXzJ4/L2Nyb3NzZWQtaW1h/Z2UtaWNvbi1waWN0/dXJlLW5vdC1hdmFp/bGFibGUtZGVsZXRl/LXBpY3R1cmUtc3lt/Ym9sLWZyZWUtdmVj/dG9yLmpwZw";
                            }}
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
                              <small className="text-danger">
                                {sucursal.precioError}
                              </small>
                            ) : (
                              <h4 className="text-success mb-0">
                                {formatPrecio(sucursal.precio)}
                              </h4>
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
