import React, { useState, useEffect } from "react";
import {
  Alert,
  Button,
  Modal,
  Badge,
  Form,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { direccionService } from "../services/direccionService";
import {
  FaMapMarkerAlt,
  FaMap,
  FaLocationArrow,
  FaSave,
  FaAddressBook ,
  FaTimes,
  FaInfoCircle,
} from "react-icons/fa";

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}


const UbicacionComponent = ({
  onLocationChange,
  selectedBarrio,
  currentUser,
}) => {
  const [location, setLocation] = useState({
    address: "Habilite la ubicación para calcular la distancia",
    direccionCompleta: "",
    coords: null,
    loading: false,
    error: null,
  });

  const [showLocationRequest, setShowLocationRequest] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [mapCoords, setMapCoords] = useState(null);
  const [direcciones, setDirecciones] = useState([]);
  const [nombreDireccion, setNombreDireccion] = useState("");
  const [loadingDirecciones, setLoadingDirecciones] = useState(false);
  const [saving, setSaving] = useState(false);

  // DEBUG: Mostrar estado actual
  useEffect(() => {
    console.log("UbicacionComponent Estado:", {
      currentUser: currentUser?.idUsuario,
      location: location,
      direccionesCount: direcciones.length,
      direcciones: direcciones,
    });
  }, [currentUser, location, direcciones]);

 // Cargar direcciones cuando el usuario cambia
useEffect(() => {
  const loadUserData = async () => {
    if (currentUser?.idUsuario) {
      console.log("Usuario detectado, cargando direcciones...");
      try {
        setLoadingDirecciones(true);
        const direccionesData = await direccionService.getDireccionesByUsuario(currentUser.idUsuario);
        console.log("Direcciones cargadas:", direccionesData);

        setDirecciones(direccionesData || []);

        // Si hay direcciones, cargar la última SOLO si no tenemos ubicación actual
        if (direccionesData && direccionesData.length > 0 && !location.coords) {
          const ultimaDireccion = direccionesData[0];
          console.log("Cargando última dirección:", ultimaDireccion);

          // Obtener dirección completa para la última dirección
          const direccionCompleta = await getAddressFromCoords(
            parseFloat(ultimaDireccion.latitud), 
            parseFloat(ultimaDireccion.longitud)
          );

          const newLocation = {
            address: ultimaDireccion.nombreDireccion || "Ubicación guardada",
            direccionCompleta: direccionCompleta,
            coords: {
              lat: parseFloat(ultimaDireccion.latitud),
              lng: parseFloat(ultimaDireccion.longitud),
            },
            loading: false,
            error: null,
          };

          setLocation(newLocation);
          console.log("Nueva ubicación establecida:", newLocation);

          // Notificar al padre SOLO si es un cambio real
          if (onLocationChange) {
            console.log("Notificando cambio de ubicación al padre");
            onLocationChange(newLocation.coords);
          }
        }
      } catch (error) {
        console.error("Error cargando datos de usuario:", error);
        if (error.response?.status !== 404) {
          setLocation((prev) => ({
            ...prev,
            error: "Error al cargar ubicaciones guardadas",
          }));
        }
      } finally {
        setLoadingDirecciones(false);
      }
    } else {
      console.log("No hay usuario, limpiando direcciones");
      setDirecciones([]);
    }
  };

  loadUserData();
}, [currentUser, onLocationChange]);


  const handleMapSelection = () => {
  setShowLocationRequest(false);
  setShowMapModal(true);
  setMapCoords(location.coords || { lat: -34.6037, lng: -58.3816 });
};

const handleMapClick = (coords) => {
  setMapCoords(coords);
};

const eliminarDireccion = async (idDireccion, event) => {
  event.stopPropagation();
  
  if (!window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
    return;
  }

  try {
    await direccionService.deleteDireccion(idDireccion);
    const direccionesData = await direccionService.getDireccionesByUsuario(currentUser.idUsuario);
    setDirecciones(direccionesData || []);
    
    // Si la dirección eliminada era la actual, resetear ubicación
    if (location.coords && direcciones.find(d => 
      d.idDireccionUsuario === idDireccion
    )) {
      const resetLocation = {
        address: "Habilite la ubicación para calcular la distancia",
        direccionCompleta: "",
        coords: null,
        loading: false,
        error: null
      };
      setLocation(resetLocation);
      if (onLocationChange) onLocationChange(null);
    }
  } catch (error) {
    console.error('Error eliminando dirección:', error);
    alert('Error al eliminar la dirección');
  }
};
  // Mostrar solicitud de ubicación si no hay coordenadas
  useEffect(() => {
    if (!location.coords && !currentUser?.idUsuario) {
      const timer = setTimeout(() => {
        setShowLocationRequest(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [location.coords, currentUser]);

  const getLocation = async (coords = null, nombrePersonalizado = null) => {
    try {
      console.log("Obteniendo ubicación...", {
        coords,
        nombrePersonalizado,
      });
      setLocation((prev) => ({ ...prev, loading: true, error: null }));
      setShowLocationRequest(false);

      let latitude, longitude;

      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      } else {
        console.log("Detectando ubicación automáticamente...");
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      // Obtener la dirección completa desde las coordenadas
      const direccionCompleta = await getAddressFromCoords(latitude, longitude);
      console.log("Dirección completa obtenida:", direccionCompleta);

      const address = nombrePersonalizado || direccionCompleta;

      const newLocation = {
        address: address,
        direccionCompleta: direccionCompleta, // Guardar la dirección completa
        coords: { lat: latitude, lng: longitude },
        loading: false,
        error: null,
      };

      setLocation(newLocation);
      setShowMapModal(false);
      setShowSaveModal(false);
      setNombreDireccion("");

      // Guardar en base de datos si hay usuario logueado
      if (currentUser?.idUsuario) {
        console.log(
          "Guardando dirección para usuario:",
          currentUser.idUsuario
        );
        await saveDireccionToDatabase(newLocation, nombrePersonalizado);
      }

      // Notificar al componente padre
      if (onLocationChange) {
        console.log(
          "Notificando nueva ubicación al padre:",
          newLocation.coords
        );
        onLocationChange(newLocation.coords);
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: getErrorMessage(error),
      }));
    }
  };

  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (!data.address) {
        return "Dirección no identificada";
      }

      const address = data.address;

      // Intentar construir la dirección en formato: Calle Altura, Barrio, Ciudad
      const parts = [];

      // Calle y número
      if (address.road) {
        let calle = address.road;
        if (address.house_number) {
          calle += ` ${address.house_number}`;
        }
        parts.push(calle);
      }

      // Barrio o localidad
      if (address.suburb) {
        parts.push(address.suburb);
      } else if (address.neighbourhood) {
        parts.push(address.neighbourhood);
      }

      // Ciudad
      if (address.city) {
        parts.push(address.city);
      } else if (address.town) {
        parts.push(address.town);
      } else if (address.village) {
        parts.push(address.village);
      }

      // Provincia/Estado
      if (address.state) {
        parts.push(address.state);
      }

      // Si no encontramos información específica, usar display_name
      if (parts.length === 0 && data.display_name) {
        // Tomar solo la primera parte de display_name para no mostrar demasiado texto
        return data.display_name.split(",")[0] + "...";
      }

      return parts.length > 0 ? parts.join(", ") : "Dirección no disponible";
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      return "Error al obtener dirección";
    }
  };
  const getErrorMessage = (error) => {
    if (error.code) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          return "Permiso de ubicación denegado. Usa el mapa para seleccionar manualmente.";
        case error.POSITION_UNAVAILABLE:
          return "Ubicación no disponible. Verifica tu conexión o usa el mapa.";
        case error.TIMEOUT:
          return "Tiempo de espera agotado. Intenta nuevamente.";
        default:
          return "Error al obtener ubicación";
      }
    }
    return error.message || "Error desconocido al obtener ubicación";
  };

  const saveDireccionToDatabase = async (
    locationData,
    nombrePersonalizado = null
  ) => {
    if (!currentUser?.idUsuario) return;

    try {
      setSaving(true);

      // Obtener dirección completa
      const direccionCompleta = await getAddressFromCoords(
        locationData.coords.lat,
        locationData.coords.lng
      );

      const direccionData = {
        idUsuario: currentUser.idUsuario,
        nombreDireccion: nombrePersonalizado || locationData.address,
        direccionCompleta: direccionCompleta, // Guardar la dirección completa
        latitud: locationData.coords.lat,
        longitud: locationData.coords.lng,
      };

      console.log("Guardando dirección en BD:", direccionData);
      await direccionService.saveDireccion(direccionData);

      // Actualizar localmente
      const nuevaDireccion = {
        idDireccionUsuario: Date.now(),
        ...direccionData,
      };

      setDirecciones((prev) => [nuevaDireccion, ...prev]);
      console.log("Direcciones actualizadas localmente");
    } catch (error) {
      console.error("Error guardando dirección en BD:", error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!nombreDireccion.trim()) {
      alert("Por favor ingresa un nombre para esta ubicación");
      return;
    }

    if (!mapCoords) {
      alert("Por favor selecciona una ubicación en el mapa");
      return;
    }

    try {
      await getLocation(mapCoords, nombreDireccion.trim());
    } catch (error) {
      console.error("Error guardando ubicación:", error);
    }
  };

  const selectDireccionGuardada = async (direccion) => {
    // Verificar si ya estamos en esta ubicación
    if (
      location.coords &&
      parseFloat(direccion.latitud) === location.coords.lat &&
      parseFloat(direccion.longitud) === location.coords.lng
    ) {
      console.log("Ya estamos en esta ubicación, omitiendo cambio");
      return;
    }

    console.log("Seleccionando dirección guardada:", direccion);

    try {
      // Obtener la dirección completa desde las coordenadas guardadas
      const direccionCompleta = await getAddressFromCoords(
        parseFloat(direccion.latitud),
        parseFloat(direccion.longitud)
      );

      const newLocation = {
        address: direccion.nombreDireccion,
        direccionCompleta: direccionCompleta,
        coords: {
          lat: parseFloat(direccion.latitud),
          lng: parseFloat(direccion.longitud),
        },
        loading: false,
        error: null,
      };

      setLocation(newLocation);
      console.log(
        "Nueva ubicación establecida desde dirección guardada:",
        newLocation
      );

      // Notificar al componente padre
      if (onLocationChange) {
        console.log(
          "Notificando cambio de ubicación al padre desde dirección guardada"
        );
        onLocationChange(newLocation.coords);
      }
    } catch (error) {
      console.error("Error obteniendo dirección completa:", error);
      // Si falla, usar al menos la información básica
      const newLocation = {
        address: direccion.nombreDireccion,
        direccionCompleta:
          direccion.direccionCompleta || "Dirección no disponible",
        coords: {
          lat: parseFloat(direccion.latitud),
          lng: parseFloat(direccion.longitud),
        },
        loading: false,
        error: null,
      };
      setLocation(newLocation);
      if (onLocationChange) onLocationChange(newLocation.coords);
    }
  };
  const clearError = () => {
    setLocation((prev) => ({ ...prev, error: null }));
  };

  return (
    <>
      {/* Modal de solicitud de ubicación */}
      <Modal
        show={showLocationRequest}
        onHide={() => setShowLocationRequest(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMapMarkerAlt className="me-2" />
            Mejor experiencia con ubicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Para mostrarte sucursales cercanas y información relevante,
            necesitamos tu ubicación.
          </p>
          <p className="text-muted small">
            <FaInfoCircle className="me-1" />
            {currentUser
              ? "Tu ubicación se guardará automáticamente."
              : "Inicia sesión para guardar tu ubicación."}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowLocationRequest(false)}
          >
            Ahora no
          </Button>
          <div>
            <Button
              variant="outline-primary"
              onClick={handleMapSelection}
              className="me-2"
            >
              <FaMap className="me-1" />
              Seleccionar en mapa
            </Button>
            <Button variant="primary" onClick={() => getLocation()}>
              <FaLocationArrow className="me-1" />
              Detectar automáticamente
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      {/* Modal para selección en mapa */}
      <Modal
        show={showMapModal}
        onHide={() => {
          setShowMapModal(false);
          setMapCoords(null);
        }}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <FaMap className="me-2" />
            Selecciona tu ubicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "400px" }}>
          <MapContainer
            center={mapCoords || [-34.6037, -58.3816]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            />
            <MapClickHandler onMapClick={handleMapClick} />
            {mapCoords && (
              <Marker position={mapCoords}>
                <Popup>Ubicación seleccionada</Popup>
              </Marker>
            )}
          </MapContainer>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowMapModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowMapModal(false);
              setShowSaveModal(true);
            }}
            disabled={!mapCoords}
          >
            <FaSave className="me-1" />
            {currentUser ? "Guardar ubicación" : "Usar ubicación"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para guardar dirección */}
      <Modal
        show={showSaveModal}
        onHide={() => setShowSaveModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {currentUser ? "Guardar ubicación" : "Confirmar ubicación"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>
              {currentUser
                ? "Nombre para esta ubicación"
                : "¿Cómo quieres llamar a esta ubicación?"}
            </Form.Label>
            <Form.Control
              type="text"
              placeholder={
                currentUser
                  ? "Ej: Casa, Trabajo, etc."
                  : "Ej: Mi ubicación actual"
              }
              value={nombreDireccion}
              onChange={(e) => setNombreDireccion(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSaveLocation()}
            />
            <Form.Text className="text-muted">
              {currentUser
                ? "Así podrás identificar esta ubicación fácilmente."
                : "Inicia sesión para guardar permanentemente esta ubicación."}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={() => setShowSaveModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveLocation}
            disabled={!nombreDireccion.trim() || saving}
          >
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Guardando...
              </>
            ) : (
              <>
                <FaSave className="me-1" />
                {currentUser ? "Guardar" : "Confirmar"}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Componente de ubicación principal */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <FaMapMarkerAlt className="me-2" />
          Mi ubicación: 
          {currentUser && location.coords && (
            <Badge bg="success" className="ms-2" style={{ fontSize: "0.6rem" }}>
             
            </Badge>
          )}
        </h3>

        {location.error && (
          <Alert
            variant="danger"
            className="mt-2 py-2"
            dismissible
            onClose={clearError}
          >
            <small>{location.error}</small>
          </Alert>
        )}

        <div className="mb-3">
          {location.loading ? (
            <div className="d-flex align-items-center">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Obteniendo ubicación...</span>
            </div>
          ) : location.coords ? (
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start mb-2">
                <FaMapMarkerAlt className="text-success mt-1 me-2" />
                <div>
                  <h6 className="mb-1 text-dark">Dirección seleccionada:</h6>
                  <strong className="text-primary">{location.address}</strong>
                  {location.direccionCompleta &&
                    location.direccionCompleta !== location.address && (
                      <div className="text-dark small mt-1">
                        {location.direccionCompleta}
                      </div>
                    )}
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning py-2 small mb-0">
              <FaInfoCircle className="me-1" />
              Habilite la ubicación para calcular distancias
            </div>
          )}
        </div>

        {/* Lista de direcciones guardadas */}
        {currentUser && (
          <div className="mb-3">
            <h6 className="d-flex align-items-center mb-2">
              <FaAddressBook  className="me-2 text-warning" />
              Direcciones guardadas:
              {loadingDirecciones && (
                <Spinner animation="border" size="sm" className="ms-2" />
              )}
            </h6>

            {!loadingDirecciones && direcciones.length > 0 ? (
              <ListGroup variant="flush" className="small">
                {direcciones.map((direccion) => {
                  const isActive =
                    location.coords &&
                    parseFloat(direccion.latitud) === location.coords.lat &&
                    parseFloat(direccion.longitud) === location.coords.lng;

                  return (
                    <ListGroup.Item
                      key={direccion.idDireccionUsuario}
                      action
                      onClick={() => selectDireccionGuardada(direccion)}
                      className="d-flex justify-content-between align-items-center py-2 px-2"
                      style={{
                        cursor: "pointer",
                        backgroundColor: isActive ? "#f8f9fa" : "transparent",
                        borderLeft: isActive
                          ? "3px solid #0d6efd"
                          : "3px solid transparent",
                      }}
                    >
                      <div className="flex-grow-1">
                        <div
                          className={`fw-medium ${
                            isActive ? "text-primary" : "text-dark"
                          }`}
                        >
                          {direccion.nombreDireccion}
                        </div>
                        <small className="text-muted">
                          {direccion.direccionCompleta ||
                            `${parseFloat(direccion.latitud).toFixed(
                              4
                            )}, ${parseFloat(direccion.longitud).toFixed(4)}`}
                        </small>
                      </div>
                      <Button
                        variant="outline-light"
                        size="sm"
                        onClick={(e) =>
                          eliminarDireccion(direccion.idDireccionUsuario, e)
                        }
                        title="Eliminar dirección"
                        className="ms-2 border-0 delete-btn"
                        style={{
                          backgroundColor: "transparent",
                          color: "#6c757d",
                        }}
                      >
                        <FaTimes size={12} />
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            ) : (
              !loadingDirecciones && (
                <div className="alert alert-info py-2 small">
                  <FaInfoCircle className="me-1" />
                  No tienes direcciones guardadas. Agrega una para no tener que
                  ingresarla nuevamente.
                </div>
              )
            )}
          </div>
        )}

        {!currentUser && location.coords && (
          <div className="alert alert-warning py-2 small mb-3">
            <FaInfoCircle className="me-1" />
            Inicia sesión para guardar esta ubicación y no tener que ingresarla
            nuevamente.
          </div>
        )}

        <div className="d-flex gap-2">
          <Button
            variant={location.coords ? "outline-primary" : "primary"}
            size="sm"
            className="flex-grow-1"
            onClick={() => setShowLocationRequest(true)}
            disabled={location.loading}
          >
            {location.loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Detectando...
              </>
            ) : location.coords ? (
              <>
                <FaLocationArrow className="me-1" />
                Cambiar ubicación
              </>
            ) : (
              <>
                <FaMapMarkerAlt className="me-1" />
                Activar ubicación
              </>
            )}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={handleMapSelection}
            title="Seleccionar en mapa"
          >
            <FaMap />
          </Button>
        </div>
      </div>
    </>
  );
};

export default UbicacionComponent;
