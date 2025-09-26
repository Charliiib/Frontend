import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Spinner,
  Alert,
  Card,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import {
  FaSearch,
  FaStore,
  FaMapMarkerAlt,
  FaArrowLeft,
  FaShoppingCart,
  FaDollarSign,
  FaTimes,
} from "react-icons/fa";
import api from "../api";

const BuscarEnListaModal = ({ show, onHide, lista, currentUser }) => {
  const [paso, setPaso] = useState(1);
  const [barrios, setBarrios] = useState([]);
  const [comercios, setComercios] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [barrioSeleccionado, setBarrioSeleccionado] = useState(null);
  const [comercioSeleccionado, setComercioSeleccionado] = useState(null);
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null);

  useEffect(() => {
    if (show) {
      resetModal();
      cargarBarrios();
    }
  }, [show]);

  const resetModal = () => {
    setPaso(1);
    setBarrioSeleccionado(null);
    setComercioSeleccionado(null);
    setSucursalSeleccionada(null);
    setResultados([]);
    setError(null);
  };

  const cargarBarrios = async () => {
    setLoading(true);
    try {
      const response = await api.get("/barrios");
      setBarrios(response.data);
    } catch (error) {
      setError(
        "Error al cargar barrios: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarComerciosPorBarrio = async (barrio) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/sucursales/por-barrio/${barrio.idBarrios}`
      );
      const sucursalesBarrio = response.data;

      const comerciosUnicos = [];
      const comerciosIds = new Set();

      sucursalesBarrio.forEach((sucursal) => {
        const key = `${sucursal.idComercio}-${sucursal.idBandera}`;
        if (!comerciosIds.has(key) && sucursal.comercio) {
          comerciosIds.add(key);
          comerciosUnicos.push({
            idComercio: sucursal.idComercio,
            idBandera: sucursal.idBandera,
            comercioBanderaNombre:
              sucursal.comercio.comercioBanderaNombre || "Sin nombre",
            barrio: barrio,
            imageUrl: `https://imagenes.preciosclaros.gob.ar/comercios/${sucursal.idComercio}-${sucursal.idBandera}.jpg`,
          });
        }
      });

      setComercios(comerciosUnicos);
      setBarrioSeleccionado(barrio);
      setPaso(2);
    } catch (error) {
      setError(
        "Error al cargar comercios: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const cargarSucursalesPorComercio = async (comercio) => {
    setLoading(true);
    try {
      const response = await api.get(
        `/sucursales/por-barrio/${barrioSeleccionado.idBarrios}`
      );
      const todasSucursalesBarrio = response.data;

      const sucursalesFiltradas = todasSucursalesBarrio.filter(
        (sucursal) =>
          sucursal.idComercio === comercio.idComercio &&
          sucursal.idBandera === comercio.idBandera
      );

      setSucursales(sucursalesFiltradas);
      setComercioSeleccionado(comercio);
      setPaso(3);
    } catch (error) {
      setError(
        "Error al cargar sucursales: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const buscarProductosEnSucursal = async () => {
    if (!lista || !sucursalSeleccionada) return;

    setLoading(true);
    setError(null);

    try {
      const productosPromises = lista.productos.map(async (producto) => {
        try {
          const response = await api.get("/productos/precios", {
            params: {
              id_producto: producto.idProducto,
              id_comercio: sucursalSeleccionada.idComercio,
              id_bandera: sucursalSeleccionada.idBandera,
              id_sucursal: sucursalSeleccionada.idSucursal,
            },
          });

          return {
            producto: producto,
            precio: response.data[0]?.productos_precio_lista || null,
            sucursal: sucursalSeleccionada,
            error: null,
          };
        } catch (error) {
          return {
            producto: producto,
            precio: null,
            sucursal: sucursalSeleccionada,
            error: "Error al obtener precio",
          };
        }
      });

      const resultados = await Promise.all(productosPromises);
      setResultados(resultados);
      setPaso(4);
    } catch (error) {
      setError(
        "Error al buscar productos: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = () => {
    return resultados.reduce((total, item) => {
      return total + (item.precio || 0);
    }, 0);
  };

  const productosConPrecio = resultados.filter((item) => item.precio).length;
  const productosSinPrecio = resultados.filter((item) => !item.precio).length;

  const handleCerrar = () => {
    resetModal();
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleCerrar}
      size="lg"
      centered
      className="modern-modal"
    >
      <Modal.Header className="border-0 pb-0">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Modal.Title className="h4 mb-0 text-primary">
              <FaShoppingCart className="me-2" />
              {lista?.nombreLista}
            </Modal.Title>
            <Button
              variant="link"
              onClick={handleCerrar}
              className="text-muted p-0"
            >
              <FaTimes size={20} />
            </Button>
          </div>

          <div className="progress mb-3" style={{ height: "4px" }}>
            <div
              className="progress-bar bg-primary"
              style={{ width: `${paso * 25}%` }}
            ></div>
          </div>

          <div className="d-flex justify-content-between text-center small mb-3">
            <div
              className={`flex-fill ${
                paso >= 1 ? "text-primary fw-bold" : "text-muted"
              }`}
            >
              <FaMapMarkerAlt className="d-block mx-auto mb-1" />
              Barrio
            </div>
            <div
              className={`flex-fill ${
                paso >= 2 ? "text-primary fw-bold" : "text-muted"
              }`}
            >
              <FaStore className="d-block mx-auto mb-1" />
              Comercio
            </div>
            <div
              className={`flex-fill ${
                paso >= 3 ? "text-primary fw-bold" : "text-muted"
              }`}
            >
              <FaSearch className="d-block mx-auto mb-1" />
              Sucursal
            </div>
            <div
              className={`flex-fill ${
                paso >= 4 ? "text-primary fw-bold" : "text-muted"
              }`}
            >
              <FaDollarSign className="d-block mx-auto mb-1" />
              Resultados
            </div>
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

        {/* Selección de Barrio */}
        {paso === 1 && (
          <div>
            <h6 className="text-muted mb-3">¿En qué barrio querés buscar?</h6>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Cargando barrios...</p>
              </div>
            ) : (
              <Row className="g-2">
                {barrios.map((barrio) => (
                  <Col md={3} sm={6} key={barrio.idBarrios}>
                    <Card
                      className="h-100 border-0 shadow-sm hover-card"
                      onClick={() => cargarComerciosPorBarrio(barrio)}
                      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                    >
                      <Card.Body className="text-center p-2">
                        <div
                          className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-1"
                          style={{ width: "36px", height: "36px" }}
                        >
                          <FaMapMarkerAlt className="text-primary" size={14} />
                        </div>
                        <h6 className="mb-0 fw-semibold small">
                          {barrio.barriosNombre}
                        </h6>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Selección de Comercio */}
        {paso === 2 && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setPaso(1)}
                className="rounded-circle me-2"
                style={{ width: "36px", height: "36px" }}
              >
                <FaArrowLeft />
              </Button>
              <div>
                <h6 className="mb-0">
                  Comercios en {barrioSeleccionado?.barriosNombre}
                </h6>
                <small className="text-muted">Selecciona un comercio</small>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Cargando comercios...</p>
              </div>
            ) : (
              <Row className="g-2">
                {comercios.map((comercio) => (
                  <Col
                    md={6}
                    key={`${comercio.idComercio}-${comercio.idBandera}`}
                  >
                    <Card
                      className="border-0 shadow-sm hover-card"
                      onClick={() => cargarSucursalesPorComercio(comercio)}
                      style={{ cursor: "pointer", transition: "all 0.3s ease" }}
                    >
                      <Card.Body className="p-2">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0 me-2">
                            <img
                              src={comercio.imageUrl}
                              alt={comercio.comercioBanderaNombre}
                              className="rounded"
                              style={{
                                width: "40px",
                                height: "40px",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZThlOGU4Ii8+CjxwYXRoIGQ9Ik0yMCAxMkMxNi42OSAxMiAxNCAxNC42OSAxNCAxOEMxNCAyMS4zMSAxNi42OSAyNCAyMCAyNEMyMy4zMSAyNCAyNiAyMS4zMSAyNiAxOEMyNiAxNC42OSAyMy4zMSAxMiAyMCAxMlpNMjAgMjJDMThuOSAyMiAxOCAyMS4xIDE4IDIwQzE4IDE4Ljg5IDE4LjkgMTggMjAgMThDMjEuMSAxOCAyMiAxOC44OSAyMiAyMEMyMiAyMS4xIDIxLjEgMjIgMjAgMjJaTTIwIDZDMTMuMzcgNiA4IDExLjM3IDggMThDOCAyNC42MyAxMy4zNyAzMCAyMCAzMEMyNi42MyAzMCAzMiAyNC42MyAzMiAxOEMzMiAxMS4zNyAyNi42MyA2IDIwIDZaIiBmaWxsPSIjOTk5Ii8+Cjwvc3ZnPgo=";
                              }}
                            />
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-0 fw-semibold small">
                              {comercio.comercioBanderaNombre}
                            </h6>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        )}

        {/* Selección de Sucursal */}
        {paso === 3 && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setPaso(2)}
                className="rounded-circle me-2"
                style={{ width: "36px", height: "36px" }}
              >
                <FaArrowLeft />
              </Button>
              <div>
                <h6 className="mb-0">
                  {comercioSeleccionado?.comercioBanderaNombre}
                </h6>
                <small className="text-muted">Selecciona una sucursal</small>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Cargando sucursales...</p>
              </div>
            ) : (
              <Row className="g-2">
                {sucursales.length === 0 ? (
                  <Col md={12}>
                    <Alert
                      variant="light"
                      className="border-0 text-center py-4"
                    >
                      <FaStore className="text-muted mb-2" size={32} />
                      <p className="text-muted mb-0">
                        No hay sucursales disponibles
                      </p>
                    </Alert>
                  </Col>
                ) : (
                  sucursales.map((sucursal) => (
                    <Col md={6} lg={3} key={sucursal.idSucursal}>
                      <Card
                        className={`border-0 shadow-sm h-100 ${
                          sucursalSeleccionada?.idSucursal ===
                          sucursal.idSucursal
                            ? "border-primary border-2"
                            : ""
                        }`}
                        style={{
                          cursor: "pointer",
                          transition: "all 0.3s ease",
                          transform:
                            sucursalSeleccionada?.idSucursal ===
                            sucursal.idSucursal
                              ? "translateY(-2px)"
                              : "none",
                        }}
                        onClick={() => setSucursalSeleccionada(sucursal)}
                      >
                        <Card.Body className="p-2">
                          <div className="text-center">
                            <h6 className="mb-1 fw-semibold small">
                              {sucursal.sucursalesNombre}
                            </h6>
                            <small className="text-muted d-block">
                              {sucursal.sucursalesDireccion}
                            </small>
                            {sucursalSeleccionada?.idSucursal ===
                              sucursal.idSucursal && (
                              <Badge
                                bg="primary"
                                className="rounded-pill mt-1 small"
                              >
                                Seleccionada
                              </Badge>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                )}
              </Row>
            )}
          </div>
        )}

        {/* Resultados */}
        {paso === 4 && (
          <div>
            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setPaso(3)}
                className="rounded-circle me-2"
                style={{ width: "36px", height: "36px" }}
              >
                <FaArrowLeft />
              </Button>
              <div>
                <h6 className="mb-0">
                  Resultados en {sucursalSeleccionada?.sucursalesNombre}
                </h6>
                <small className="text-muted">
                  {lista.productos.length} productos buscados
                </small>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="text-muted mt-2">Buscando precios...</p>
              </div>
            ) : (
              <div>
                {/* Resumen */}
                <Card className="border-0 bg-light mb-3">
                  <Card.Body className="p-3">
                    <div className="row text-center">
                      <div className="col">
                        <div className="h4 mb-0 text-primary">
                          ${calcularTotal().toFixed(2)}
                        </div>
                        <small className="text-muted">Total estimado</small>
                      </div>
                      <div className="col">
                        <div className="h4 mb-0 text-success">
                          {productosConPrecio}
                        </div>
                        <small className="text-muted">Con precio</small>
                      </div>
                      <div className="col">
                        <div className="h4 mb-0 text-warning">
                          {productosSinPrecio}
                        </div>
                        <small className="text-muted">Sin stock</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                {/* Lista de productos */}
                <div className="space-y-2">
                  {resultados.map((item, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-semibold">
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
                              <div>
                                <Badge bg="success" className="fs-6">
                                  ${item.precio.toFixed(2)}
                                </Badge>
                              </div>
                            ) : (
                              <Badge bg="warning" text="dark">
                                Sin stock
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={handleCerrar}>
          Cerrar
        </Button>
        {paso === 3 && sucursalSeleccionada && (
          <Button
            variant="primary"
            onClick={buscarProductosEnSucursal}
            disabled={loading}
            className="px-4"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Buscando...
              </>
            ) : (
              <>
                <FaSearch className="me-2" />
                Buscar Precios
              </>
            )}
          </Button>
        )}
      </Modal.Footer>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
        .space-y-2 > * + * {
          margin-top: 0.5rem;
        }
        .modern-modal .modal-content {
          border-radius: 12px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </Modal>
  );
};

export default BuscarEnListaModal;
