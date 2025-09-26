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
        // Recargar la lista
        cargarSucursalesFavoritas();
      }
    } catch (error) {
      console.error("Error eliminando favorita:", error);
      alert("Error al eliminar la sucursal favorita");
    }
  };

  const openGoogleMaps = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  useEffect(() => {
    cargarSucursalesFavoritas();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="sidebar-section">
        <div className="sidebar-title">
          <FaStar className="me-2 text-warning" />
          Sucursales Favoritas
        </div>
        <div className="alert alert-info">
          <small>Inicia sesión para ver tus sucursales favoritas</small>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-section">
      <div className="sidebar-title d-flex justify-content-between align-items-center">
        <span>
          <FaStar className="me-2 text-warning" />
          Sucursales Favoritas
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={cargarSucursalesFavoritas}
          disabled={loading}
        >
          {loading ? (
            <Spinner animation="border" size="sm" />
          ) : (
            <FaArrowsRotate className="me-1" />
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="py-2">
          {error}
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-3">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2">
            <small>Cargando sucursales favoritas...</small>
          </div>
        </div>
      ) : sucursalesFavoritas.length === 0 ? (
        <div className="text-center py-3">
          <FaStar className="text-muted" size={32} />
          <p className="text-muted mt-2 mb-0">
            <small>No tienes sucursales favoritas</small>
          </p>
          <small className="text-muted">
            Haz clic en la estrella para agregar
          </small>
        </div>
      ) : (
        <div className="sucursales-favoritas-list">
          {sucursalesFavoritas.map((sucursal, index) => (
            <Card key={index} className="mb-2">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div className="flex-grow-1">
                    <h6 className="mb-1">
                      <FaStore className="me-1 text-primary" />
                      {sucursal.comercioNombre}
                    </h6>
                    <p className="mb-1 small">{sucursal.sucursalNombre}</p>
                    <div className="d-flex align-items-center text-muted small">
                      <FaMapMarkerAlt className="me-1" />
                      {sucursal.barrioNombre}
                    </div>
                    {sucursal.latitud && sucursal.longitud && (
                      <Button
                        variant="link"
                        className="p-0 small"
                        onClick={() =>
                          openGoogleMaps(sucursal.latitud, sucursal.longitud)
                        }
                      >
                        <FaMap className="me-1" />
                        Ver en mapa
                      </Button>
                    )}
                  </div>
                  <Button
                    variant="outline-danger"
                    size="sm"
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
