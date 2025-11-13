import React from "react";
import { Modal, Button, Card, Row, Col } from "react-bootstrap";
import { FaMapMarkerAlt, FaHeart, FaSearch } from "react-icons/fa"; // Usando FaHeart y FaSearch para mejor claridad

const SeleccionarBusquedaModal = ({
  show,
  onHide,
  onSeleccionarFavoritas,
  onSeleccionarBarrio,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="modern-modal">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="h4 fw-bold text-primary">
          <FaSearch className="me-2" />
          ¿Cómo quieres buscar los precios de tu lista?
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-0">
        <p className="text-muted mb-4 small">
          Selecciona una de las dos opciones para continuar con la búsqueda de precios de tu lista de compras.
        </p>
        
        <Row className="g-4">
          <Col md={6}>
            <Card
              className="border-0 shadow-lg h-100 text-center hover-card"
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={onSeleccionarFavoritas}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div>
                  {/* Ícono grande y en círculo para Favoritas */}
                  <div
                    className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <FaHeart className="text-danger" size={30} />
                  </div>
                  <h5 className="text-danger fw-bold">Comparar en Favoritas</h5>
                  <p className="text-muted small mb-0">
                    Compara el precio total de tu lista en **todas** las sucursales que marcaste como favoritas. Ideal para encontrar el carrito más barato.
                  </p>
                </div>
                <Button 
                    variant="danger" 
                    className="mt-3 w-100 rounded-3" 
                    onClick={onSeleccionarFavoritas}
                >
                    Comparar Precios
                </Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card
              className="border-0 shadow-lg h-100 text-center hover-card"
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={onSeleccionarBarrio}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div>
                  {/* Ícono grande y en círculo para Búsqueda Específica */}
                  <div
                    className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                    style={{ width: "70px", height: "70px" }}
                  >
                    <FaMapMarkerAlt className="text-primary" size={30} />
                  </div>
                  <h5 className="text-primary fw-bold">Por Ubicación Específica</h5>
                  <p className="text-muted small mb-0">
                    Buscar en un barrio, comercio y sucursal específicos. Útil si ya sabes dónde quieres ir o necesitas un precio puntual.
                  </p>
                </div>
                <Button 
                    variant="primary" 
                    className="mt-3 w-100 rounded-3" 
                    onClick={onSeleccionarBarrio}
                >
                    Seleccionar Sucursal
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide} className="rounded-3 px-4">
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SeleccionarBusquedaModal;