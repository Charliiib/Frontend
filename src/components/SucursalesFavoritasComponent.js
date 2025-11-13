import React, { useState, useEffect } from "react";
import { Card, Button, Spinner, Alert, Row, Col } from "react-bootstrap";
import {
  FaStar,
  FaMapMarkerAlt,
  FaStore,
  FaTrash,
  FaMap,
} from "react-icons/fa";
import { FaArrowsRotate } from "react-icons/fa6";

const SucursalesFavoritasComponent = ({ currentUser }) => {
  const [sucursalesFavoritas, setSucursalesFavoritas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      } else {
        setError("Error al cargar sucursales favoritas");
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar sucursales favoritas");
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorita = async (sucursalFavorita) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar ${sucursalFavorita.sucursalNombre} de tus favoritos?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:8080/api/sucursales-favoritas/eliminar`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            idUsuario: currentUser.idUsuario,
            idComercio: sucursalFavorita.idComercio,
            idBandera: sucursalFavorita.idBandera,
            idSucursal: sucursalFavorita.idSucursal,
          }),
        }
      );

      if (response.ok) {
        cargarSucursalesFavoritas();
      } else {
        alert("Error al eliminar la sucursal favorita");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error de red al intentar eliminar la sucursal");
    }
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=$${lat},${lng}`, "_blank");
  };

  useEffect(() => {
    cargarSucursalesFavoritas();
  }, [currentUser]);
  
  // VISTA: No logueado
  if (!currentUser) {
    return (
      <div className="sidebar-section bg-light rounded-3 shadow-sm">
        <h3 className="sidebar-title fw-bold text-primary">
          <FaStar className="me-2" />
          Favoritas
        </h3>
        <div className="alert alert-info text-center border-0 rounded-3">
          Inicia sesión para guardar sucursales favoritas
        </div>
      </div>
    );
  }

  // VISTA: Principal (Refrescada)
  return (
    <div className="sidebar-section bg-light rounded-3 shadow-sm">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="sidebar-title fw-bold text-primary mb-0">
          <FaStar className="me-2 text-warning" />
          Mis Sucursales Favoritas
        </h3>
        <Button
          variant="outline-primary"
          size="sm"
          className="p-1 border-0 rounded-circle"
          onClick={cargarSucursalesFavoritas}
          disabled={loading}
          title="Actualizar lista"
        >
          <FaArrowsRotate />
        </Button>
      </div>

      {loading && (
        <div className="text-center py-3">
          <Spinner animation="border" size="sm" variant="primary" />
          <p className="text-muted small mt-2">Cargando...</p>
        </div>
      )}

      {error && <Alert variant="danger" className="small">{error}</Alert>}

      {!loading && !error && sucursalesFavoritas.length === 0 && (
        <div className="text-center py-3">
          <p className="text-muted small">No tienes sucursales favoritas.</p>
          <p className="text-secondary small">¡Marca algunas para verlas aquí!</p>
        </div>
      )}

      {!loading && sucursalesFavoritas.length > 0 && (
        <div className="sucursales-favoritas-list">
          {sucursalesFavoritas.map((sucursal) => (
            <Card
              key={`${sucursal.idComercio}-${sucursal.idBandera}-${sucursal.idSucursal}`}
              className="mb-3 shadow-sm list-card-hover"
              style={{ border: "1px solid #e9ecef", borderRadius: "10px" }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-center justify-content-between">
                  {/* Contenido de la Sucursal */}
                  <div className="flex-grow-1 me-3 overflow-hidden">
                    <h6 className="mb-1 text-primary fw-bold text-truncate" title={sucursal.comercioNombre}>
                      <FaStore className="me-1" />
                      {sucursal.comercioNombre} ({sucursal.banderaDescripcion})
                    </h6>
                    <p className="mb-1 small text-truncate" title={sucursal.sucursalNombre}>{sucursal.sucursalNombre}</p>
                    
                    <div className="d-flex align-items-center text-muted small mt-2">
                      <FaMapMarkerAlt className="me-1" />
                      <small className="text-truncate">{sucursal.barrioNombre}, {sucursal.localidadNombre}</small>
                    </div>

                    {/* Botón de Mapa (Estilizado como link limpio) */}
                    {sucursal.latitud && sucursal.longitud && (
                      <Button
                        variant="link"
                        className="p-0 small mt-1 text-decoration-none text-info fw-medium"
                        onClick={() =>
                          openGoogleMaps(sucursal.latitud, sucursal.longitud)
                        }
                        title="Ver ubicación exacta en Google Maps"
                      >
                        <FaMap className="me-1" />
                        Ver en mapa
                      </Button>
                    )}
                  </div>

                  {/* Botón de Eliminar */}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="flex-shrink-0 border-0 ms-2"
                    onClick={() => eliminarFavorita(sucursal)}
                    title="Eliminar de favoritos"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SucursalesFavoritasComponent;