import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ListasComponent = ({ currentUser }) => {
    const [listas, setListas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nuevaListaNombre, setNuevaListaNombre] = useState('');
    const [listaSeleccionada, setListaSeleccionada] = useState(null);

    useEffect(() => {
        const loadListas = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (!token || !currentUser) {
                setLoading(false);
                return;
            }

            try {
                const userId = currentUser.idUsuario || (storedUser ? JSON.parse(storedUser).idUsuario : null);
                
                if (!userId) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get(
                    `http://localhost:8080/api/listas/usuario/${userId}`, 
                    {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                
                setListas(response.data);
                setError(null);
            } catch (error) {
                console.error('Error cargando listas:', error);
                setError('Error al cargar las listas');
            } finally {
                setLoading(false);
            }
        };

        loadListas();
    }, [currentUser]);

    const cargarListas = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8080/api/listas/usuario/${currentUser.idUsuario}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setListas(response.data);
        } catch (error) {
            console.error('Error cargando listas:', error);
        }
    };

    const crearLista = async () => {
        if (!nuevaListaNombre.trim()) return;
        
        try {
            const token = localStorage.getItem('token');
            const nuevaLista = {
                idUsuario: currentUser.idUsuario,
                nombreLista: nuevaListaNombre
            };
            
            await axios.post('http://localhost:8080/api/listas', nuevaLista, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNuevaListaNombre('');
            cargarListas();
        } catch (error) {
            console.error('Error creando lista:', error);
        }
    };

    const verProductosLista = async (idLista) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `http://localhost:8080/api/listas/${idLista}/productos`, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            const lista = listas.find(l => l.idListas === idLista);
            setListaSeleccionada({
                ...lista,
                productos: response.data
            });
            
        } catch (error) {
            console.error('Error cargando productos de la lista:', error);
            alert('Error al cargar los productos de la lista');
        }
    };

    const volverAListas = () => {
        setListaSeleccionada(null);
    };

    const eliminarProducto = async (idLista, idProducto) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este producto de la lista?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/api/listas/${idLista}/productos/${idProducto}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (listaSeleccionada) {
                verProductosLista(idLista);
            }
            cargarListas();
            
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error al eliminar el producto');
        }
    };

    if (!currentUser) {
        return (
            <div className="sidebar-section">
                <h3 className="sidebar-title">
                    <i className="fas fa-list me-2"></i>Listas
                </h3>
                <div className="alert alert-info">
                    <i className="fas fa-info-circle me-2"></i>
                    Inicia sesión para ver tus listas
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="sidebar-section">
                <h3 className="sidebar-title">
                    <i className="fas fa-list me-2"></i>Mis Listas
                </h3>
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                    </div>
                </div>
            </div>
        );
    }

    // VISTA DE PRODUCTOS DE UNA LISTA ESPECÍFICA
    if (listaSeleccionada) {
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
                        {listaSeleccionada.productos.length} producto(s) en la lista
                    </small>
                </div>

                {listaSeleccionada.productos.length === 0 ? (
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle me-2"></i>
                        Esta lista está vacía
                    </div>
                ) : (
                    <div className="productos-lista">
                        {listaSeleccionada.productos.map((producto) => (
                            <div key={producto.idProducto} className="card mb-2">
                                <div className="card-body py-2">
                                    <div className="row align-items-center">
                                        {/* Columna de la imagen */}
                                        <div className="col-auto">
                                        <img
                                        src={`https://imagenes.preciosclaros.gob.ar/productos/${producto.idProducto}.jpg`}
                                        className="img-fluid rounded"
                                        alt={producto.descripcion}
                                        style={{height: '80px', objectFit: 'cover', width: '80px'}}
                                        onError={(e) => e.target.src = 'https://imgs.search.brave.com/iZ5bRHWm5Be4PX36SU1WlpoGm0oZrBH25fySv3EV3_w/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9zdC5k/ZXBvc2l0cGhvdG9z/LmNvbS8yOTM0NzY1/LzUzMTkyL3YvNDUw/L2RlcG9zaXRwaG90/b3NfNTMxOTIwODIw/LXN0b2NrLWlsbHVz/dHJhdGlvbi1waG90/by1hdmFpbGFibGUt/dmVjdG9yLWljb24t/ZGVmYXVsdC5qcGc'}
                                        />
                                        </div>
                                        
                                        {/* Columna de la información del producto */}
                                        <div className="col">
                                            <h6 className="card-title mb-1 small">{producto.descripcion}</h6>
                                            {producto.marca && producto.marca !== "Sin marca" && (
                                                <small className="text-muted">Marca: {producto.marca}</small>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {/* Botón de eliminar - ahora en la parte inferior izquierda */}
                                    <div className="mt-2">
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => eliminarProducto(listaSeleccionada.idListas, producto.idProducto)}
                                            title="Eliminar de la lista"
                                        >
                                            <i className="fas fa-trash me-1"></i>
                                            Eliminar
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // VISTA PRINCIPAL DE LISTAS (sin cambios)
    return (
        <div className="sidebar-section">
            <h3 className="sidebar-title">
                <i className="fas fa-list me-2"></i>Mis Listas
            </h3>
            
            <div className="mb-3">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="Nueva lista..."
                        value={nuevaListaNombre}
                        onChange={(e) => setNuevaListaNombre(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && crearLista()}
                    />
                    <button 
                        className="btn btn-primary btn-sm"
                        onClick={crearLista}
                    >
                        <i className="fas fa-plus"></i>
                    </button>
                </div>
            </div>

            <ul className="list-group list-group-flush">
                {listas.length === 0 ? (
                    <li className="list-group-item text-muted text-center">
                        No tienes listas creadas
                    </li>
                ) : (
                    listas.map((lista) => (
                        <li 
                            key={lista.idListas} 
                            className="list-group-item d-flex justify-content-between align-items-center clickable"
                            onClick={() => verProductosLista(lista.idListas)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div>
                                <strong>{lista.nombreLista}</strong>
                                <br />
                                <small className="text-muted">
                                    Creada: {new Date(lista.fechaCreacion).toLocaleDateString()}
                                </small>
                            </div>
                            <span className="badge bg-primary rounded-pill">
                                {lista.cantidadProductos}
                            </span>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default ListasComponent;