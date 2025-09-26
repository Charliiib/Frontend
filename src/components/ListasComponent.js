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
import { FaEdit, FaTrash, FaSearch, FaList } from "react-icons/fa";
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

  // Manejar búsqueda en lista
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

  if (!currentUser) {
    return (
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <FaList className="me-2" />
          Listas
        </h3>
        <div className="alert alert-info">
          Inicia sesión para ver tus listas
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="sidebar-section">
        <h3 className="sidebar-title">
          <FaList className="me-2" />
          Mis Listas
        </h3>
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      </div>
    );
  }

  // VISTA DE PRODUCTOS DE UNA LISTA ESPECÍFICA
  if (listaSeleccionada && !showBuscarModal) {
    return (
      <div className="sidebar-section">
        <div className="d-flex align-items-center mb-3">
          <button
            className="btn btn-sm btn-outline-secondary me-2"
            onClick={volverAListas}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <h5 className="sidebar-title mb-0">
            {listaSeleccionada.nombreLista}
          </h5>
        </div>

        <div className="mb-2">
          <small className="text-muted">
            {listaSeleccionada.productos?.length || 0} producto(s) en la lista
          </small>
        </div>

        {!listaSeleccionada.productos ||
        listaSeleccionada.productos.length === 0 ? (
          <div className="alert alert-info">Esta lista está vacía</div>
        ) : (
          <div className="productos-lista">
            {listaSeleccionada.productos.map((producto) => (
              <Card key={producto.idProducto} className="mb-2">
                <Card.Body className="py-2">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <img
                        src={`https://imagenes.preciosclaros.gob.ar/productos/${producto.idProducto}.jpg`}
                        className="img-fluid rounded"
                        alt={producto.descripcion}
                        style={{
                          height: "80px",
                          objectFit: "cover",
                          width: "80px",
                        }}
                        onError={(e) =>
                          (e.target.src = "https://via.placeholder.com/80")
                        }
                      />
                    </div>

                    <div className="col">
                      <h6 className="card-title mb-1 small">
                        {producto.descripcion}
                      </h6>
                      {producto.marca && producto.marca !== "Sin marca" && (
                        <small className="text-muted">
                          Marca: {producto.marca}
                        </small>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        eliminarProducto(
                          listaSeleccionada.idListas,
                          producto.idProducto
                        )
                      }
                      title="Eliminar de la lista"
                    >
                      <i className="fas fa-trash me-1"></i>
                      Eliminar
                    </button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  const handleSeleccionarFavoritas = () => {
    setShowSeleccionModal(false);
    setShowResultadosFavoritasModal(true);
  };

  const handleSeleccionarBarrio = () => {
    setShowSeleccionModal(false);
    setListaSeleccionada(listaParaBuscar);
    setShowBuscarModal(true);
  };

  // VISTA PRINCIPAL DE LISTAS
  return (
    <div className="sidebar-section">
      <h3 className="sidebar-title">
        <FaList className="me-2" />
        Mis Listas
      </h3>

      {/* Formulario para crear nueva lista */}
      <div className="mb-3">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nueva lista..."
            value={nuevaListaNombre}
            onChange={(e) => setNuevaListaNombre(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && crearLista()}
          />
          <button className="btn btn-primary btn-sm" onClick={crearLista}>
            <i className="fas fa-plus"></i>
          </button>
        </div>
      </div>

      {/* Lista de listas */}
      {listas.length === 0 ? (
        <div className="text-center py-3">
          <p className="text-muted">No tienes listas creadas</p>
        </div>
      ) : (
        <div className="listas-container">
          {listas.map((lista) => (
            <Card key={lista.idListas} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h6 className="mb-1">{lista.nombreLista}</h6>
                    <small className="text-muted">
                      {lista.cantidadProductos || 0} productos
                    </small>
                  </div>

                  <ButtonGroup size="sm">
                    {/* NUEVO BOTÓN DE BÚSQUEDA */}
                    <Button
                      variant="outline-info"
                      title="Buscar productos en sucursales"
                      onClick={() => handleBuscarEnLista(lista)}
                    >
                      <FaSearch />
                    </Button>

                    <Button
                      variant="outline-secondary"
                      title="Editar lista"
                      onClick={() => iniciarEdicionLista(lista)}
                    >
                      <FaEdit />
                    </Button>

                    <Button
                      variant="outline-danger"
                      title="Eliminar lista"
                      onClick={() =>
                        eliminarLista(lista.idListas, lista.nombreLista)
                      }
                    >
                      <FaTrash />
                    </Button>
                  </ButtonGroup>
                </div>

                {/* Botón para ver productos */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => verProductosLista(lista.idListas)}
                  className="w-100"
                >
                  Ver Productos
                </Button>

                {/* Modo edición */}
                {editandoLista === lista.idListas && (
                  <div className="mt-2">
                    <div className="input-group input-group-sm">
                      <input
                        type="text"
                        className="form-control"
                        value={nuevoNombreLista}
                        onChange={(e) => setNuevoNombreLista(e.target.value)}
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          guardarNombreLista(lista.idListas)
                        }
                      />
                      <Button
                        variant="success"
                        onClick={() => guardarNombreLista(lista.idListas)}
                      >
                        <i className="fas fa-check"></i>
                      </Button>
                      <Button variant="secondary" onClick={cancelarEdicion}>
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de selección de búsqueda */}
      <SeleccionarBusquedaModal
        show={showSeleccionModal}
        onHide={() => setShowSeleccionModal(false)}
        onSeleccionarFavoritas={handleSeleccionarFavoritas}
        onSeleccionarBarrio={handleSeleccionarBarrio}
      />

      {/* Modal de resultados por sucursales favoritas */}
      <ResultadosSucursalesFavoritasModal
        show={showResultadosFavoritasModal}
        onHide={() => {
          setShowResultadosFavoritasModal(false);
          setListaParaBuscar(null);
        }}
        lista={listaParaBuscar}
        currentUser={currentUser}
      />

      {/* Modal de búsqueda normal*/}
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
