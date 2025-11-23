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
  FaImage,
  FaChartLine
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
  const [preciosPromedio, setPreciosPromedio] = useState({});

  useEffect(() => {
    if (show && lista) {
      cargarSucursalesFavoritas();
    }
  }, [show, lista]);

  useEffect(() => {
    if (Object.keys(resultados).length > 0) {
      calcularPreciosPromedio();
      calcularSucursalMasBarata();
    }
  }, [resultados]);

  // Calcular precios promedio para productos sin stock
  const calcularPreciosPromedio = () => {
    const promedios = {};
    
    if (!lista || !lista.productos) return;

    // Para cada producto en la lista
    lista.productos.forEach(producto => {
      const preciosEncontrados = [];
      
      // Recolectar todos los precios de este producto en todas las sucursales
      Object.values(resultados).forEach(resultado => {
        if (!resultado.loading) {
          const itemProducto = resultado.productos.find(p => 
            p.producto.idProducto === producto.idProducto && p.precio
          );
          if (itemProducto && itemProducto.precio) {
            preciosEncontrados.push(itemProducto.precio);
          }
        }
      });

      // Si hay precios encontrados, calcular promedio
      if (preciosEncontrados.length > 0) {
        const suma = preciosEncontrados.reduce((total, precio) => total + precio, 0);
        promedios[producto.idProducto] = Math.round(suma / preciosEncontrados.length);
      }
    });

    setPreciosPromedio(promedios);
  };

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
        buscarPreciosPorComercio(data);
      } else {
        setError("Error al cargar sucursales favoritas");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar sucursales favoritas");
    }
  };

  const buscarPreciosPorComercio = async (sucursales) => {
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
            let esPrecioReal = false;

            // USAR DIRECTAMENTE EL ENDPOINT DE RESPALDO (que busca por comercio)
            const response = await fetch(
              `http://localhost:8080/api/productos/precios-con-respaldo?id_producto=${producto.idProducto}&id_comercio=${sucursal.idComercio}&id_bandera=${sucursal.idBandera}&id_sucursal=${sucursal.idSucursal}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (response.ok) {
              const data = await response.json();
              precioEncontrado = data[0]?.productos_precio_lista || null;
              esPrecioReal = precioEncontrado !== null;
            }

            return {
              producto: producto,
              precio: precioEncontrado,
              esPrecioReal: esPrecioReal,
              error: null,
            };
          } catch (error) {
            return {
              producto: producto,
              precio: null,
              esPrecioReal: false,
              error: "Error al obtener precio",
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

  // Calcular total incluyendo precios promedio para productos sin stock
  const calcularTotalSucursal = (productos) => {
    return productos.reduce((total, item) => {
      if (item.precio) {
        return total + item.precio;
      } else if (preciosPromedio[item.producto.idProducto]) {
        // Usar precio promedio si no hay precio real
        return total + preciosPromedio[item.producto.idProducto];
      }
      return total;
    }, 0);
  };

  const productosConPrecioReal = (productos) => {
    return productos.filter((item) => item.precio && item.esPrecioReal).length;
  };

  const productosConPrecioPromedio = (productos) => {
    return productos.filter((item) => 
      !item.precio && preciosPromedio[item.producto.idProducto]
    ).length;
  };

  const productosSinPrecio = (productos) => {
    return productos.filter((item) => 
      !item.precio && !preciosPromedio[item.producto.idProducto]
    ).length;
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
        const conPrecio = productosConPrecioReal(resultado.productos) + productosConPrecioPromedio(resultado.productos);
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

  // Obtener el precio a mostrar (real o promedio)
  const getPrecioAMostrar = (item) => {
    if (item.precio) {
      return {
        precio: item.precio,
        esReal: true
      };
    } else if (preciosPromedio[item.producto.idProducto]) {
      return {
        precio: preciosPromedio[item.producto.idProducto],
        esReal: false
      };
    }
    return null;
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
              Buscando precios en comercios favoritos...
            </p>
          </div>
        ) : (
          <>
            <Row className="g-3">
              {sucursalesFavoritas.map((sucursal) => {
                const resultado = resultados[sucursal.idSucursal];
                const productos = resultado?.productos || [];
                const total = calcularTotalSucursal(productos);
                const conPrecioReal = productosConPrecioReal(productos);
                const conPrecioPromedio = productosConPrecioPromedio(productos);
                const sinPrecio = productosSinPrecio(productos);
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
                              <small>Total estimado</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-success">
                                {conPrecioReal}
                              </div>
                              <small>Sucursal</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-info">
                                {conPrecioPromedio}
                              </div>
                              <small>Comercio</small>
                            </div>
                            <div className="col-3">
                              <div className="fw-bold text-warning">
                                {sinPrecio}
                              </div>
                              <small>Sin datos</small>
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
                            productos.map((item, index) => {
                              const precioAMostrar = getPrecioAMostrar(item);
                              
                              return (
                                <div key={index} className="border-bottom p-2">
                                  <div className="d-flex align-items-start">
                                    {/* Imagen del producto */}
                                    <div className="me-2 flex-shrink-0">
                                      <img
                                        src={`https://imagenes.preciosclaros.gob.ar/productos/${item.producto.idProducto}.jpg`}
                                        alt={item.producto.descripcion}
                                        style={{
                                          width: "40px",
                                          height: "40px",
                                          objectFit: "cover",
                                          borderRadius: "4px",
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = "none";
                                          e.target.nextSibling.style.display = "flex";
                                        }}
                                      />
                                      <div 
                                        className="d-none align-items-center justify-content-center bg-light rounded"
                                        style={{
                                          width: "40px",
                                          height: "40px",
                                        }}
                                      >
                                        <FaImage className="text-muted" size={16} />
                                      </div>
                                    </div>
                                    
                                    <div className="flex-grow-1">
                                      <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1 me-2">
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
                                        <div className="text-end flex-shrink-0">
                                          {precioAMostrar ? (
                                            <div>
                                              <Badge 
                                                bg={precioAMostrar.esReal ? "success" : "info"} 
                                                className="fs-6"
                                              >
                                                ${precioAMostrar.precio.toFixed(0)}
                                                {!precioAMostrar.esReal && <FaChartLine className="ms-1" />}
                                              </Badge>
                                              {!precioAMostrar.esReal && (
                                                <div>
                                                  <small className="text-muted">
                                                    Otra sucursal
                                                  </small>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <Badge bg="warning" text="dark">
                                              Sin stock
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>

            {/* Leyenda explicativa */}
            <Row className="mt-3">
              <Col>
                <Alert variant="light" className="border-0 small">
                  <div className="row text-center">
                    <div className="col-4">
                      <Badge bg="success" className="me-1">$</Badge>
                      <span>Precio en stock</span>
                    </div>
                    <div className="col-4">
                      <Badge bg="info" className="me-1">
                        $<FaChartLine className="ms-1" />
                      </Badge>
                      <span>Precio tomado de otra sucursal</span>
                    </div>
                    <div className="col-4">
                      <Badge bg="warning" text="dark" className="me-1">Sin stock</Badge>
                      <span>Sin información disponible</span>
                    </div>
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
