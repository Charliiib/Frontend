import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Spinner,
  Alert,
  ButtonGroup,
} from "react-bootstrap";
import { 
    FaEdit, 
    FaTrash, 
    FaSearch, 
    FaList, 
    FaPlus, 
    FaCheck, 
    FaTimes, 
    FaArrowLeft, 
    FaShoppingBag // Icono moderno para cantidad de productos
} from "react-icons/fa"; 
import axios from "axios";
import BuscarEnListaModal from "./BuscarEnListaModal";
import SeleccionarBusquedaModal from "./SeleccionarBusquedaModal";
import ResultadosSucursalesFavoritasModal from "./ResultadosSucursalesFavoritasModal";

const ListasComponent = ({ currentUser }) => {
  const [listas, setListas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nuevaListaNombre, setNuevaListaNombre] = useState("");
  const [listaSeleccionada, setListaSeleccionada] = useState(null);
  const [editandoLista, setEditandoLista] = useState(null);
  const [nuevoNombreLista, setNuevoNombreLista] = useState("");
  const [showBuscarModal, setShowBuscarModal] = useState(false);
  const [showSeleccionModal, setShowSeleccionModal] = useState(false);
  const [showResultadosFavoritasModal, setShowResultadosFavoritasModal] =
    useState(false);
  const [listaParaBuscar, setListaParaBuscar] = useState(null);

  // LOGIC: useEffect para cargar listas - NO MODIFICADO
  useEffect(() => {
    const loadListas = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userId =
          currentUser.idUsuario ||
          (storedUser ? JSON.parse(storedUser).idUsuario : null);

        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:8080/api/listas/usuario/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setListas(response.data);
        setError(null);
      } catch (error) {
        console.error("Error cargando listas:", error);
        setError("Error al cargar las listas");
      } finally {
        setLoading(false);
      }
    };

    loadListas();
  }, [currentUser]);

  // LOGIC: Funciones de manejo de listas y productos - NO MODIFICADAS
  const cargarListas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/listas/usuario/${currentUser.idUsuario}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setListas(response.data);
    } catch (error) {
      console.error("Error cargando listas:", error);
    }
  };

  const crearLista = async () => {
    if (!nuevaListaNombre.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const nuevaLista = {
        idUsuario: currentUser.idUsuario,
        nombreLista: nuevaListaNombre,
      };

      await axios.post("http://localhost:8080/api/listas", nuevaLista, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setNuevaListaNombre("");
      cargarListas();
    } catch (error) {
      console.error("Error creando lista:", error);
    }
  };

  const verProductosLista = async (idLista) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/listas/${idLista}/productos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const lista = listas.find((l) => l.idListas === idLista);
      setListaSeleccionada({
        ...lista,
        productos: response.data,
      });
    } catch (error) {
      console.error("Error cargando productos de la lista:", error);
      alert("Error al cargar los productos de la lista");
    }
  };

  const volverAListas = () => {
    setListaSeleccionada(null);
  };

  const eliminarProducto = async (idLista, idProducto) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este producto de la lista?"
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:8080/api/listas/${idLista}/productos/${idProducto}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (listaSeleccionada) {
        verProductosLista(idLista);
      }
      cargarListas();
    } catch (error) {
      console.error("Error eliminando producto:", error);
      alert("Error al eliminar el producto");
    }
  };

  const iniciarEdicionLista = (lista) => {
    setEditandoLista(lista.idListas);
    setNuevoNombreLista(lista.nombreLista);
  };

  const cancelarEdicion = () => {
    setEditandoLista(null);
    setNuevoNombreLista("");
  };

  const guardarNombreLista = async (idLista) => {
    if (!nuevoNombreLista.trim()) {
      alert("El nombre de la lista no puede estar vacío");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const listaActualizada = {
        nombreLista: nuevoNombreLista.trim(),
      };

      const response = await axios.put(
        `http://localhost:8080/api/listas/${idLista}`,
        listaActualizada,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Lista actualizada:", response.data);

      setListas(
        listas.map((lista) =>
          lista.idListas === idLista
            ? { ...lista, nombreLista: nuevoNombreLista.trim() }
            : lista
        )
      );

      setEditandoLista(null);
      setNuevoNombreLista("");
      alert("Nombre de la lista actualizado correctamente");
    } catch (error) {
      console.error("Error actualizando lista:", error);
      alert(
        "Error al actualizar el nombre de la lista: " +
          (error.response?.data || error.message)
      );
    }
  };

  const eliminarLista = async (idLista, nombreLista) => {
    if (
      !window.confirm(
        `¿Estás seguro de que quieres eliminar la lista "${nombreLista}" y todos sus productos?`
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:8080/api/listas/${idLista}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (listaSeleccionada && listaSeleccionada.idListas === idLista) {
        setListaSeleccionada(null);
      }

      await cargarListas();
      alert("Lista eliminada correctamente");
    } catch (error) {
      console.error("Error eliminando lista:", error);
      alert(
        "Error al eliminar la lista: " + (error.response?.data || error.message)
      );
    }
  };

  // Manejar búsqueda en lista - NO MODIFICADO
  const handleBuscarEnLista = async (lista) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8080/api/listas/${lista.idListas}/productos`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setListaParaBuscar({
        ...lista,
        productos: response.data,
      });
      setShowSeleccionModal(true);
    } catch (error) {
      console.error("Error cargando productos para búsqueda:", error);
      alert("Error al cargar los productos de la lista");
    }
  };
  
  // VISTA: No logueado
  if (!currentUser) {
    return (
      <div className="sidebar-section bg-light rounded-3 shadow-sm">
        <h3 className="sidebar-title fw-bold text-primary">
          <FaList className="me-2" />
          Listas
        </h3>
        <div className="alert alert-info text-center border-0 rounded-3">
          Inicia sesión para ver tus listas
        </div>
      </div>
    );
  }

  // VISTA: Cargando
  if (loading) {
    return (
      <div className="sidebar-section bg-light rounded-3 shadow-sm">
        <h3 className="sidebar-title fw-bold text-primary">
          <FaList className="me-2" />
          Mis Listas
        </h3>
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="text-muted small mt-2">Cargando listas...</p>
        </div>
      </div>
    );
  }

  // VISTA: Productos de una lista específica (Refrescada)
  if (listaSeleccionada && !showBuscarModal) {
    return (
      <div className="sidebar-section bg-light rounded-3 shadow-sm">
        <div className="d-flex align-items-center mb-4 border-bottom pb-3">
          <Button
            variant="outline-secondary"
            size="sm"
            className="me-3 border-0 rounded-circle p-2" 
            onClick={volverAListas}
            title="Volver a mis listas"
          >
            <FaArrowLeft />
          </Button>
          <h5 className="fw-bold text-primary mb-0 text-truncate">
            {listaSeleccionada.nombreLista}
          </h5>
        </div>

        <div className="mb-3 d-flex align-items-center text-muted small">
          <FaShoppingBag className="me-2" />
          <small>
            {listaSeleccionada.productos?.length || 0} producto(s) en la lista
          </small>
        </div>

        {!listaSeleccionada.productos ||
        listaSeleccionada.productos.length === 0 ? (
          <Alert variant="info" className="text-center">Esta lista está vacía. ¡Agrega productos!</Alert>
        ) : (
          <div className="productos-lista">
            {listaSeleccionada.productos.map((producto) => (
              <Card 
                key={producto.idProducto} 
                className="mb-3 shadow-sm product-list-item"
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    {/* Imagen del producto */}
                    <div className="flex-shrink-0 me-3">
                      <img
                        src={`https://imagenes.preciosclaros.gob.ar/productos/${producto.idProducto}.jpg`}
                        className="rounded-3 producto-imagen-lg" 
                        alt={producto.descripcion}
                        style={{
                          height: "60px",
                          width: "60px",
                          objectFit: "cover",
                          border: '1px solid #e9ecef' 
                        }}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/60x60?text=ND")
                        }
                      />
                    </div>

                    {/* Descripción y Marca */}
                    {/* AQUI ESTAN LOS CAMBIOS CLAVE: flex-grow-1 y overflow-hidden en el div padre */}
                    <div className="flex-grow-1 me-3 overflow-hidden"> 
                      <p 
                        className="fw-medium mb-1 small text-truncate" 
                        title={producto.descripcion}
                      >
                        {producto.descripcion}
                      </p>
                      {producto.marca && producto.marca !== "Sin marca" && (
                        <small className="text-muted d-block text-truncate" style={{ fontSize: '0.75rem' }}>
                          Marca: {producto.marca}
                        </small>
                      )}
                    </div>
                    
                    {/* Botón de eliminar */}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() =>
                        eliminarProducto(
                          listaSeleccionada.idListas,
                          producto.idProducto
                        )
                      }
                      title="Eliminar de la lista"
                      className="flex-shrink-0 border-0 ms-auto" // ms-auto para empujar a la derecha
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
  }

  // LOGIC: Manejadores de modales - NO MODIFICADOS
  const handleSeleccionarFavoritas = () => {
    setShowSeleccionModal(false);
    setShowResultadosFavoritasModal(true);
  };

  const handleSeleccionarBarrio = () => {
    setShowSeleccionModal(false);
    setListaSeleccionada(listaParaBuscar);
    setShowBuscarModal(true);
  };

  // VISTA: Principal de listas (Refrescada)
  return (
    <div className="sidebar-section bg-light rounded-3 shadow-sm">
      <h3 className="sidebar-title fw-bold text-primary">
        <FaList className="me-2" />
        Mis Listas
      </h3>

      {/* Formulario para crear nueva lista (Más moderno) */}
      <div className="mb-4">
        <Form onSubmit={(e) => { e.preventDefault(); crearLista(); }}>
          <div className="input-group shadow-sm rounded-pill overflow-hidden">
            <Form.Control
              type="text"
              placeholder="Nombre de la nueva lista..."
              value={nuevaListaNombre}
              onChange={(e) => setNuevaListaNombre(e.target.value)}
              className="border-0 ps-3 py-2" 
            />
            <Button 
              variant="primary" 
              type="submit"
              className="fw-bold px-3"
              disabled={!nuevaListaNombre.trim()}
            >
              <FaPlus className="me-1" />
              Crear
            </Button>
          </div>
        </Form>
      </div>

      {/* Lista de listas */}
      {listas.length === 0 ? (
        <div className="text-center py-3">
          <p className="text-muted">No tienes listas creadas.</p>
          <p className="text-secondary small">¡Crea una para empezar a guardar tus productos!</p>
        </div>
      ) : (
        <div className="listas-container">
          {listas.map((lista) => (
            <Card 
              key={lista.idListas} 
              className="mb-3 shadow-sm list-card-hover" 
              style={{ border: '1px solid #e9ecef', borderRadius: '10px' }}
            >
              <Card.Body className="p-3">
                
                {/* Nombre y Cantidad de Productos */}
                <div className="d-flex align-items-center mb-3">
                  <h6 className="fw-bold mb-0 text-truncate me-auto" title={lista.nombreLista}>
                    {lista.nombreLista}
                  </h6>
                  <small className="text-primary fw-medium ms-2">
                    <FaShoppingBag className="me-1" size={12} />
                    {lista.cantidadProductos || 0}
                  </small>
                </div>
                
                {/* Grupo de Botones de Acción: Primaria (Ver) y Secundarias */}
                <div className="d-flex justify-content-between align-items-center">
                    
                    <ButtonGroup size="sm" className="me-2">
                        {/* Botón para ver productos (Principal) */}
                        <Button
                            variant="primary"
                            onClick={() => verProductosLista(lista.idListas)}
                            title="Ver Productos de la lista"
                            className="fw-bold"
                            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                        >
                            Ver Productos
                        </Button>
                        
                        {/* Botón de Búsqueda */}
                        <Button
                            variant="outline-info"
                            title="Buscar productos en sucursales"
                            onClick={() => handleBuscarEnLista(lista)}
                            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        >
                            <FaSearch />
                        </Button>
                    </ButtonGroup>
                    
                    <ButtonGroup size="sm">
                        <Button
                            variant="outline-secondary"
                            title="Editar nombre de la lista"
                            onClick={() => iniciarEdicionLista(lista)}
                            className="border-0"
                        >
                            <FaEdit />
                        </Button>
                        <Button
                            variant="outline-danger"
                            title="Eliminar lista"
                            onClick={() =>
                                eliminarLista(lista.idListas, lista.nombreLista)
                            }
                            className="border-0"
                        >
                            <FaTrash />
                        </Button>
                    </ButtonGroup>

                </div>


                {/* Modo edición */}
                {editandoLista === lista.idListas && (
                  <div className="mt-3">
                    <div className="input-group input-group-sm">
                      <Form.Control
                        type="text"
                        value={nuevoNombreLista}
                        onChange={(e) => setNuevoNombreLista(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          guardarNombreLista(lista.idListas)
                        }
                        className="border-end-0"
                      />
                      <Button
                        variant="success"
                        onClick={() => guardarNombreLista(lista.idListas)}
                        title="Guardar"
                      >
                        <FaCheck />
                      </Button>
                      <Button 
                        variant="secondary" 
                        onClick={cancelarEdicion}
                        title="Cancelar"
                      >
                        <FaTimes />
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modales - NO MODIFICADOS */}
      <SeleccionarBusquedaModal
        show={showSeleccionModal}
        onHide={() => setShowSeleccionModal(false)}
        onSeleccionarFavoritas={handleSeleccionarFavoritas}
        onSeleccionarBarrio={handleSeleccionarBarrio}
      />

      <ResultadosSucursalesFavoritasModal
        show={showResultadosFavoritasModal}
        onHide={() => {
          setShowResultadosFavoritasModal(false);
          setListaParaBuscar(null);
        }}
        lista={listaParaBuscar}
        currentUser={currentUser}
      />

      <BuscarEnListaModal
        show={showBuscarModal}
        onHide={() => {
          setShowBuscarModal(false);
          setListaSeleccionada(null);
          setListaParaBuscar(null);
        }}
        lista={listaSeleccionada}
        currentUser={currentUser}
      />
    </div>
  );
};

export default ListasComponent;