import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaStore,
  FaMapMarkerAlt,
  FaDollarSign,
  FaTimes,
  FaShoppingCart,
  FaCrown,
  FaExclamationTriangle
} from "react-icons/fa";

const ResultadosSucursalesFavoritasModal = ({
  show,
  onHide,
  lista,
  currentUser,
}) => {
  const [sucursalesFavoritas, setSucursalesFavoritas] = useState([]);
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sucursalMasBarata, setSucursalMasBarata] = useState(null);

  useEffect(() => {
    if (show && lista) {
      cargarSucursalesFavoritas();
    }
  }, [show, lista]);

  useEffect(() => {
    calcularSucursalMasBarata();
  }, [resultados]);

  const cargarSucursalesFavoritas = async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/sucursales-favoritas/usuario/${currentUser.idUsuario}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSucursalesFavoritas(data);
        buscarPreciosEnSucursales(data);
      } else {
        setError("Error al cargar sucursales favoritas");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar sucursales favoritas");
    }
  };

  const buscarPreciosEnSucursales = async (sucursales) => {
    if (!lista || !lista.productos) return;

    setLoading(true);
    setError(null);

    try {
      const resultadosPorSucursal = {};

      for (const sucursal of sucursales) {
        resultadosPorSucursal[sucursal.idSucursal] = {
          sucursal: sucursal,
          productos: [],
          loading: true,
        };
const productosPromises = lista.productos.map(async (producto) => {
  try {
    const token = localStorage.getItem("token");
    let precioEncontrado = null;
    let esRespaldo = false;
    let esMismaSucursal = false;

    // PRIMERO: Intentar con el endpoint normal (sucursal específica)
    const responseNormal = await fetch(
      `http://localhost:8080/api/productos/precios?id_producto=${producto.idProducto}&id_comercio=${sucursal.idComercio}&id_bandera=${sucursal.idBandera}&id_sucursal=${sucursal.idSucursal}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (responseNormal.ok) {
      const data = await responseNormal.json();
      precioEncontrado = data[0]?.productos_precio_lista || null;
      esMismaSucursal = true; // Este precio SÍ es de esta sucursal específica
    }

    // SEGUNDO: Si no se encontró precio en la sucursal, usar el respaldo
    if (!precioEncontrado) {
      const responseRespaldo = await fetch(
        `http://localhost:8080/api/productos/precios-con-respaldo?id_producto=${producto.idProducto}&id_comercio=${sucursal.idComercio}&id_bandera=${sucursal.idBandera}&id_sucursal=${sucursal.idSucursal}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (responseRespaldo.ok) {
        const dataRespaldo = await responseRespaldo.json();
        precioEncontrado = dataRespaldo[0]?.productos_precio_lista || null;
        esRespaldo = precioEncontrado !== null;
        // NOTA: Los precios de respaldo son del MISMO comercio/bandera pero POSIBLEMENTE de otra sucursal
      }
    }

    return {
      producto: producto,
      precio: precioEncontrado,
      error: null,
      esRespaldo: esRespaldo,
      esMismaSucursal: esMismaSucursal,
    };
  } catch (error) {
    return {
      producto: producto,
      precio: null,
      error: "Error al obtener precio",
      esRespaldo: false,
      esMismaSucursal: false,
    };
  }
});

        const productosResultados = await Promise.all(productosPromises);
        resultadosPorSucursal[sucursal.idSucursal] = {
          sucursal: sucursal,
          productos: productosResultados,
          loading: false,
        };
      }

      setResultados(resultadosPorSucursal);
    } catch (error) {
      setError("Error al buscar precios: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalSucursal = (productos) => {
    return productos.reduce((total, item) => {
      return total + (item.precio || 0);
    }, 0);
  };

  const productosConPrecioSucursal = (productos) => {
    return productos.filter((item) => item.precio).length;
  };

  const productosConRespaldo = (productos) => {
    return productos.filter((item) => item.precio && item.esRespaldo).length;
  };

  const calcularSucursalMasBarata = () => {
    if (Object.keys(resultados).length === 0) {
      setSucursalMasBarata(null);
      return;
    }

    let menorTotal = Infinity;
    let sucursalMasBarataId = null;

    Object.values(resultados).forEach(resultado => {
      if (!resultado.loading) {
        const total = calcularTotalSucursal(resultado.productos);
        const conPrecio = productosConPrecioSucursal(resultado.productos);
        if (conPrecio > 0 && total < menorTotal) {
          menorTotal = total;
          sucursalMasBarataId = resultado.sucursal.idSucursal;
        }
      }
    });

    setSucursalMasBarata(sucursalMasBarataId);
  };

  const esSucursalMasBarata = (sucursalId) => {
    return sucursalMasBarata === sucursalId;
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="xl"
      centered
      className="modern-modal"
    >
      <Modal.Header className="border-0 pb-0">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Modal.Title className="h4 mb-0 text-primary">
              <FaShoppingCart className="me-2" />
              {lista?.nombreLista} - Sucursales Favoritas
            </Modal.Title>
            <Button variant="link" onClick={onHide} className="text-muted p-0">
              <FaTimes size={20} />
            </Button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="pt-0">
        {error && (
          <Alert variant="danger" className="border-0 rounded-3 shadow-sm">
            <div className="d-flex align-items-center">
              <FaTimes className="me-2" />
              {error}
            </div>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-2">
              Buscando precios en sucursales favoritas...
            </p>
          </div>
        ) : (
          <>
            <Row className="g-3">
              {sucursalesFavoritas.map((sucursal) => {
                const resultado = resultados[sucursal.idSucursal];
                const productos = resultado?.productos || [];
                const total = calcularTotalSucursal(productos);
                const conPrecio = productosConPrecioSucursal(productos);
                const conRespaldo = productosConRespaldo(productos);
                const sinPrecio = productos.length - conPrecio;
                const esMasBarata = esSucursalMasBarata(sucursal.idSucursal);

                return (
                  <Col md={6} lg={4} key={sucursal.idSucursal}>
                    <Card className={`border-0 shadow-sm h-100 ${esMasBarata ? 'border-warning border-3' : ''}`}>
                      <Card.Header className="bg-light border-0">
                        {/* Badge para la sucursal más barata */}
                        {esMasBarata && (
                          <div className="position-absolute top-0 start-50 translate-middle mt-1">
                            <Badge bg="warning" text="dark" className="px-3 py-2">
                              <FaCrown className="me-1" />
                              MEJOR PRECIO
                            </Badge>
                          </div>
                        )}
                        
                        <div className="d-flex justify-content-between align-items-start">
                          <div className={esMasBarata ? 'mt-4' : ''}>
                            <h6 className="mb-1">
                              <img
                                src={`https://imagenes.preciosclaros.gob.ar/comercios/${sucursal.idComercio}-${sucursal.idBandera}.jpg`}
                                alt={`Logo ${sucursal.comercioNombre}`}
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  objectFit: "cover",
                                  borderRadius: "2px",
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "block";
                                }}
                              />
                              <FaStore
                                className="text-muted"
                                size={12}
                                style={{
                                  display: "none",
                                  position: "absolute",
                                  left: "4px",
                                  top: "4px",
                                }}
                              />{" "}
                              {sucursal.comercioNombre}
                            </h6>
                            <small className="text-muted">
                              {sucursal.sucursalNombre}
                            </small>
                            <div className="d-flex align-items-center text-muted small mt-1">
                              <FaMapMarkerAlt className="me-1" />
                              {sucursal.barrioNombre}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 p-2 bg-white rounded">
                          <div className="row text-center small">
                            <div className="col-3">
                              <div className={`fw-bold ${esMasBarata ? 'text-warning' : 'text-primary'}`}>
                                ${total.toFixed(0)}
                              </div>
                              <small>Total</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-success">
                                {conPrecio - conRespaldo}
                              </div>
                              <small>En stock</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-info">
                                {conRespaldo}
                              </div>
                              <small>Con respaldo</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-warning">
                                {sinPrecio}
                              </div>
                              <small>Sin stock</small>
                            </div>
                          </div>
                        </div>
                      </Card.Header>

                      <Card.Body className="p-0">
                        <div
                          className="productos-sucursal"
                          style={{ maxHeight: "300px", overflowY: "auto" }}
                        >
                          {resultado?.loading ? (
                            <div className="text-center py-3">
                              <Spinner
                                animation="border"
                                size="sm"
                                variant="primary"
                              />
                              <small className="d-block mt-1">Cargando...</small>
                            </div>
                          ) : (
                            productos.map((item, index) => (
                              <div key={index} className="border-bottom p-2">
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1 small fw-semibold">
                                      {item.producto.descripcion}
                                    </h6>
                                    {item.producto.marca &&
                                      item.producto.marca !== "Sin marca" && (
                                        <small className="text-muted">
                                          {item.producto.marca}
                                        </small>
                                      )}
                                  </div>
                                  <div className="text-end">
                                    {item.precio ? (
                                      <Badge 
                                        bg={item.esRespaldo ? "info" : "success"} 
                                        className="fs-6"
                                        title={item.esRespaldo ? "Precio de respaldo (no confirmado en esta sucursal)" : "Precio confirmado en sucursal"}
                                      >
                                        ${item.precio.toFixed(0)}
                                        {item.esRespaldo && <FaExclamationTriangle className="ms-1" />}
                                      </Badge>
                                    ) : (
                                      <Badge bg="warning" text="dark">
                                        Sin stock
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Leyenda de precios con respaldo */}
            <Row className="mt-3">
              <Col>
                <Alert variant="light" className="border-0 small">
                  <div className="d-flex align-items-center">
                    <FaExclamationTriangle className="text-info me-2" />
                    <span>
                      Los precios marcados con <Badge bg="info" className="ms-1 me-1">!</Badge> 
                      son de respaldo, de otra sucursal, y pueden no estar disponibles en esta sucursal específica
                    </span>
                  </div>
                </Alert>
              </Col>
            </Row>
          </>
        )}

        {sucursalesFavoritas.length === 0 && !loading && (
          <div className="text-center py-5">
            <FaStore className="text-muted mb-3" size={48} />
            <h5 className="text-muted">No tienes sucursales favoritas</h5>
            <p className="text-muted">
              Agrega algunas sucursales a tus favoritos para ver los precios
              aquí.
            </p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ResultadosSucursalesFavoritasModal;