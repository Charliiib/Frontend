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
  FaAddressBook,
  FaTimes,
  FaInfoCircle,
  FaTrash, 
} from "react-icons/fa";

// Fix para los iconos de Leaflet (Lógica original mantenida)
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
    calle: "",
    barrio: "",
    localidad: "",
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

  // Servicio de geocodificación inversa usando Nominatim (OpenStreetMap)
  const getAddressFromCoords = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=es`
      );
      
      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      const address = data.address;
      
      // Construir dirección completa
      let direccionCompleta = "";
      let calle = "";
      let barrio = "";
      let localidad = "";
      
      // Obtener calle
      if (address.road) {
        calle = address.road;
        if (address.house_number) {
          calle += ` ${address.house_number}`;
        }
        direccionCompleta += calle;
      }
      
      // Obtener barrio
      if (address.suburb) {
        barrio = address.suburb;
      } else if (address.neighbourhood) {
        barrio = address.neighbourhood;
      } else if (address.quarter) {
        barrio = address.quarter;
      }
      
      // Obtener localidad
      if (address.city) {
        localidad = address.city;
      } else if (address.town) {
        localidad = address.town;
      } else if (address.village) {
        localidad = address.village;
      } else if (address.municipality) {
        localidad = address.municipality;
      }
      
      // Construir dirección completa con barrio
      if (barrio) {
        if (direccionCompleta) direccionCompleta += ", ";
        direccionCompleta += barrio;
      }
      
      if (localidad) {
        if (direccionCompleta) direccionCompleta += ", ";
        direccionCompleta += localidad;
      }
      
      // Si no hay dirección específica, usar el display name
      if (!direccionCompleta && data.display_name) {
        direccionCompleta = data.display_name.split(',')[0]; // Tomar solo la primera parte
      }
      
      return {
        direccionCompleta: direccionCompleta || "Dirección no disponible",
        calle: calle || "Calle no disponible",
        barrio: barrio || "Barrio no disponible",
        localidad: localidad || "Localidad no disponible"
      };
      
    } catch (error) {
      console.error("Error en geocodificación inversa:", error);
      return {
        direccionCompleta: "Error al obtener dirección",
        calle: "Error al obtener calle",
        barrio: "Error al obtener barrio",
        localidad: "Error al obtener localidad"
      };
    }
  };

  const saveDireccionToDatabase = async (newLocation, nombrePersonalizado) => {
    if (!currentUser) return;
    try {
        await direccionService.saveDireccion({
            idUsuario: currentUser.idUsuario,
            nombreDireccion: nombrePersonalizado,
            latitud: newLocation.coords.lat,
            longitud: newLocation.coords.lng,
            direccionCompleta: newLocation.direccionCompleta,
        });
        // Recargar direcciones después de guardar
        const direccionesData = await direccionService.getDireccionesByUsuario(currentUser.idUsuario);
        setDirecciones(direccionesData || []);
    } catch (error) {
        console.error("Error al guardar dirección:", error);
    }
  };


  // LÓGICA RESTAURADA: useEffect para cargar direcciones guardadas
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser?.idUsuario) {
        setLoadingDirecciones(true);
        try {
          // *** LÓGICA DE CARGA DE DATOS ***
          const direccionesData = await direccionService.getDireccionesByUsuario(currentUser.idUsuario);
          setDirecciones(direccionesData || []);

          if (direccionesData && direccionesData.length > 0 && !location.coords) {
            const ultimaDireccion = direccionesData[0];
            
            // Obtener dirección completa con geocodificación
            const direccionInfo = await getAddressFromCoords(
              parseFloat(ultimaDireccion.latitud),
              parseFloat(ultimaDireccion.longitud)
            );

            const newLocation = {
              address: ultimaDireccion.nombreDireccion || "Ubicación guardada",
              direccionCompleta: direccionInfo.direccionCompleta,
              calle: direccionInfo.calle,
              barrio: direccionInfo.barrio,
              localidad: direccionInfo.localidad,
              coords: {
                lat: parseFloat(ultimaDireccion.latitud),
                lng: parseFloat(ultimaDireccion.longitud),
              },
              loading: false,
              error: null,
            };

            setLocation(newLocation);
            if (onLocationChange) {
              onLocationChange(newLocation.coords);
            }
          }
        } catch (error) {
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
        setDirecciones([]);
      }
    };

    loadUserData();
  }, [currentUser, onLocationChange]);

  const handleMapSelection = () => {
    // Lógica para manejar la selección de mapa
    setShowLocationRequest(false);
    setShowMapModal(true);
    setMapCoords(location.coords || { lat: -34.6037, lng: -58.3816 }); 
  };

  const handleMapClick = (coords) => {
    // Lógica para manejar clic en mapa
    setMapCoords(coords);
  };

  const eliminarDireccion = async (idDireccion, event) => {
    // LÓGICA RESTAURADA: para eliminar dirección
    event.stopPropagation();
    
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
      return;
    }

    try {
      await direccionService.deleteDireccion(idDireccion);
      const direccionesData = await direccionService.getDireccionesByUsuario(currentUser.idUsuario);
      
      setDirecciones(direccionesData || []);
      
      // Lógica de resetear ubicación si era la activa
      const direccionEliminada = direcciones.find(d => 
        d.idDireccionUsuario === idDireccion
      );
      
      if (direccionEliminada && location.coords && 
          parseFloat(direccionEliminada.latitud) === location.coords.lat && 
          parseFloat(direccionEliminada.longitud) === location.coords.lng
        ) {
        const resetLocation = {
          address: "Habilite la ubicación para calcular la distancia",
          direccionCompleta: "",
          calle: "",
          barrio: "",
          localidad: "",
          coords: null,
          loading: false,
          error: null
        };
        setLocation(resetLocation);
        if (onLocationChange) onLocationChange(null);
      }

    } catch (error) {
      alert('Error al eliminar la dirección');
    }
  };


  const getLocation = async (coords = null, nombrePersonalizado = null) => {
    // Lógica principal de geolocalización
    try {
      setLocation((prev) => ({ ...prev, loading: true, error: null }));
      setShowLocationRequest(false);

      let latitude, longitude;

      if (coords) {
        latitude = coords.lat;
        longitude = coords.lng;
      } else {
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

      const direccionInfo = await getAddressFromCoords(latitude, longitude);
      const address = nombrePersonalizado || direccionInfo.direccionCompleta;

      const newLocation = {
        address: address,
        direccionCompleta: direccionInfo.direccionCompleta,
        calle: direccionInfo.calle,
        barrio: direccionInfo.barrio,
        localidad: direccionInfo.localidad,
        coords: { lat: latitude, lng: longitude },
        loading: false,
        error: null,
      };

      setLocation(newLocation);
      setShowMapModal(false);
      setShowSaveModal(false);
      setNombreDireccion("");

      if (currentUser?.idUsuario && nombrePersonalizado) {
        await saveDireccionToDatabase(newLocation, nombrePersonalizado); 
      }

      if (onLocationChange) {
        onLocationChange(newLocation.coords);
      }
    } catch (error) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Error al obtener ubicación. Permiso denegado o no disponible.", 
      }));
    }
  };

  const handleSaveLocation = async () => {
    // Lógica de guardar ubicación
    if (!mapCoords || saving || !nombreDireccion.trim()) return;

    setSaving(true);
    try {
      await getLocation(mapCoords, nombreDireccion.trim()); 
    } catch (error) {
      alert("Error al guardar la dirección");
    } finally {
      setSaving(false);
      setShowSaveModal(false);
      setNombreDireccion("");
    }
  };

  const selectDireccionGuardada = async (direccion) => {
    // Lógica para seleccionar dirección guardada
    if (
      location.coords &&
      parseFloat(direccion.latitud) === location.coords.lat &&
      parseFloat(direccion.longitud) === location.coords.lng
    ) {
      return;
    }
    
    try {
      const direccionInfo = await getAddressFromCoords(
        parseFloat(direccion.latitud),
        parseFloat(direccion.longitud)
      );
      const newLocation = {
        address: direccion.nombreDireccion,
        direccionCompleta: direccionInfo.direccionCompleta,
        calle: direccionInfo.calle,
        barrio: direccionInfo.barrio,
        localidad: direccionInfo.localidad,
        coords: {
          lat: parseFloat(direccion.latitud),
          lng: parseFloat(direccion.longitud),
        },
        loading: false,
        error: null,
      };
      setLocation(newLocation);
      if (onLocationChange) {
        onLocationChange(newLocation.coords);
      }
    } catch (error) {
      const newLocation = {
        address: direccion.nombreDireccion,
        direccionCompleta: direccion.direccionCompleta || "Dirección no disponible",
        calle: "Información no disponible",
        barrio: "Información no disponible",
        localidad: "Información no disponible",
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


  // VISTA PRINCIPAL
  return (
    <>
      <div className="sidebar-section bg-light rounded-3 shadow-sm">
        <h3 className="sidebar-title fw-bold text-primary">
          <FaMapMarkerAlt className="me-2" />
          Mi Ubicación
        </h3>

        {/* Display de Ubicación Actual (Card-like) */}
        <div className="mb-3 p-3 bg-white border rounded-3 shadow-sm">
            <div className="d-flex align-items-start">
                <FaLocationArrow className={`me-3 mt-1 ${location.coords ? 'text-success' : 'text-danger'}`} size={20} />
                <div className="flex-grow-1 overflow-hidden">
                    <p className={`fw-bold mb-1 text-truncate ${location.coords ? 'text-dark' : 'text-muted'}`}>
                        {location.coords ? "Ubicación Actual" : "Ubicación No Definida"}
                    </p>
                    <small className="text-muted d-block text-truncate" title={location.address}>
                        {location.address}
                    </small>
                    {/* Nueva sección para mostrar calle, barrio y localidad */}
                    {location.coords && (
                      <div className="mt-2 small">
                        {location.calle && location.calle !== "Calle no disponible" && (
                          <div className="text-dark">
                            <strong>Calle:</strong> {location.calle}
                          </div>
                        )}
                        {location.barrio && location.barrio !== "Barrio no disponible" && (
                          <div className="text-dark">
                            <strong>Barrio:</strong> {location.barrio}
                          </div>
                        )}
                        {location.localidad && location.localidad !== "Localidad no disponible" && (
                          <div className="text-dark">
                            <strong>Localidad:</strong> {location.localidad}
                          </div>
                        )}
                      </div>
                    )}
                </div>
            </div>
        </div>
        
        {location.error && (
          <Alert variant="danger" onClose={clearError} dismissible className="small py-2">
            {location.error}
          </Alert>
        )}

        {/* Direcciones Guardadas */}
        {currentUser && (
          <div className="mb-3">
            <h6 className="fw-bold mb-2 text-secondary">
              <FaAddressBook className="me-1" />
              Direcciones Guardadas
              {loadingDirecciones && (
                <Spinner animation="border" size="sm" className="ms-2" />
              )}
            </h6>
            
            <div className="list-group">
              {direcciones.length === 0 && !loadingDirecciones ? (
                <div className="text-center py-2 small text-muted">No tienes direcciones guardadas.</div>
              ) : (
                direcciones.map((direccion) => {
                  const isActive =
                    location.coords &&
                    parseFloat(direccion.latitud) === location.coords.lat &&
                    parseFloat(direccion.longitud) === location.coords.lng;
                  
                  return (
                    <div
                      key={direccion.idDireccionUsuario}
                      onClick={() => selectDireccionGuardada(direccion)}
                      className={`list-group-item list-group-item-action p-3 rounded-3 mb-2 list-card-hover ${isActive ? 'active text-black' : ''}`}
                      style={{ 
                        borderLeft: isActive ? "5px solid var(--bs-primary)" : "1px solid #e9ecef", 
                        cursor: 'pointer',
                        backgroundColor: isActive ? "var(--bs-secondary)" : "", 
                        color: isActive ? "white" : "",
                      }}
                    >
                      <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1 overflow-hidden">
                              <div className={`fw-medium ${isActive ? "text-black" : "text-dark"}`} title={direccion.nombreDireccion}>
                                  {direccion.nombreDireccion}
                              </div>
                              <small className={`d-block text-truncate ${isActive ? "text-black" : "text-muted"}`} title={direccion.direccionCompleta}>
                                  {direccion.direccionCompleta || `${parseFloat(direccion.latitud).toFixed( 4 )}, ${parseFloat(direccion.longitud).toFixed(4)}`}
                              </small>
                          </div>
                          
                          <Button
                              variant={isActive ? "light" : "outline-danger"}
                              size="sm"
                              className="flex-shrink-0 ms-2 border-0"
                              onClick={(e) => eliminarDireccion(direccion.idDireccionUsuario, e)}
                              title="Eliminar de favoritos"
                          >
                              <FaTrash />
                          </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Mensaje de no logueado */}
        {!currentUser && location.coords && (
          <div className="alert alert-warning py-2 small mb-3 border-0 rounded-3">
            <FaInfoCircle className="me-1" />
            Inicia sesión para guardar esta ubicación y no tener que ingresarla
            nuevamente.
          </div>
        )}

        {/* Botones de acción */}
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
                <FaMapMarkerAlt className="me-1" />
                Agregar ubicación
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

      {/* MODAL DE SOLICITUD (showLocationRequest) */}
      <Modal show={showLocationRequest} onHide={() => setShowLocationRequest(false)} centered backdrop="static" >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold text-primary"> 
            <FaMapMarkerAlt className="me-2" /> 
            {location.coords ? "Agregar Ubicación" : "Mejor experiencia con ubicación"} 
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0">
          <p> 
            {location.coords 
              ? "¿Cómo quieres definir tu nueva ubicación?"
              : "Para mostrarte sucursales cercanas y precios actualizados, necesitamos tu ubicación."}
          </p>
          <Alert variant="info" className="small border-0 rounded-3">
            <FaInfoCircle className="me-1" /> Puedes seleccionar tu ubicación automáticamente (GPS) o usar el mapa.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setShowLocationRequest(false)}> Cancelar </Button>
          <Button variant="primary" onClick={() => getLocation()}> 
            <FaLocationArrow className="me-1" /> Usar GPS
          </Button>
          <Button variant="secondary" onClick={handleMapSelection}>
            <FaMap className="me-1" /> Seleccionar en mapa
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal MAPA (showMapModal) */}
      <Modal show={showMapModal} onHide={() => setShowMapModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title> <FaMap className="me-2" /> Seleccionar ubicación en el mapa </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "400px" }}>
          <MapContainer
            center={mapCoords || { lat: -34.6037, lng: -58.3816 }}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mapCoords && <Marker position={mapCoords} />}
            <MapClickHandler onMapClick={handleMapClick} />
          </MapContainer>
        </Modal.Body>
        <Modal.Footer>
          {/* Mensaje de alerta movido al Footer */}
          <Alert variant="info" className="w-100 py-2 small border-0 rounded-3 text-start">
            <FaInfoCircle className="me-1" /> Haz clic en el mapa para marcar una ubicación.
          </Alert>
          <Button variant="outline-secondary" onClick={() => setShowMapModal(false)}> Cancelar </Button>
          <Button
            variant="primary"
            onClick={() => {
              currentUser ? setShowSaveModal(true) : getLocation(mapCoords);
              setShowMapModal(false); 
            }}
            disabled={!mapCoords}
          >
            <FaSave className="me-1" /> {currentUser ? "Guardar y Usar" : "Usar ubicación"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal GUARDAR (showSaveModal) */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title> {currentUser ? "Guardar Ubicación" : "Confirmar Ubicación"} </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-medium"> Nombre para esta ubicación </Form.Label>
            <Form.Control 
              type="text" 
              placeholder={ currentUser ? "Ej: Casa, Trabajo, etc." : "Ej: Mi ubicación actual" } 
              value={nombreDireccion} 
              onChange={(e) => setNombreDireccion(e.target.value)}
              className="rounded-3"
            />
            <Form.Text className="text-muted small">
              {currentUser ? "Así podrás identificar esta ubicación fácilmente." : "Inicia sesión para guardar permanentemente esta ubicación."}
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowSaveModal(false)}> Cancelar </Button>
          <Button variant="primary" onClick={handleSaveLocation} disabled={!nombreDireccion.trim() || saving}>
            {saving ? <Spinner animation="border" size="sm" /> : <FaSave className="me-1" />}
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UbicacionComponent;