import React from "react";
import { Modal, Button, Card } from "react-bootstrap";
import { FaStar, FaMapMarkerAlt, FaTimes } from "react-icons/fa";

const SeleccionarBusquedaModal = ({
  show,
  onHide,
  onSeleccionarFavoritas,
  onSeleccionarBarrio,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered className="modern-modal">
      <Modal.Header className="border-0 pb-0">
        <div className="w-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Modal.Title className="h4 mb-0 text-primary">
              ¿Cómo quieres buscar?
            </Modal.Title>
            <Button variant="link" onClick={onHide} className="text-muted p-0">
              <FaTimes size={20} />
            </Button>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body className="pt-0">
        <div className="row g-3">
          <div className="col-md-6">
            <Card
              className="border-0 shadow-sm h-100 text-center hover-card"
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={onSeleccionarFavoritas}
            >
              <Card.Body className="p-4">
                <div
                  className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "60px", height: "60px" }}
                >
                  <FaStar className="text-warning" size={24} />
                </div>
                <h5 className="text-warning">Mis Favoritas</h5>
                <p className="text-muted mb-0">
                  Buscar en todas mis sucursales favoritas a la vez y comparar
                  precios entre ellas.
                </p>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-6">
            <Card
              className="border-0 shadow-sm h-100 text-center hover-card"
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={onSeleccionarBarrio}
            >
              <Card.Body className="p-4">
                <div
                  className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: "60px", height: "60px" }}
                >
                  <FaMapMarkerAlt className="text-primary" size={24} />
                </div>
                <h5 className="text-primary">Por Barrio</h5>
                <p className="text-muted mb-0">
                  Buscar en un barrio específico, seleccionando comercio y
                  sucursal paso a paso.
                </p>
              </Card.Body>
            </Card>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancelar
        </Button>
      </Modal.Footer>

      <style jsx>{`
        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
        }
      `}</style>
    </Modal>
  );
};

export default SeleccionarBusquedaModal;
