import { useState, useEffect } from 'react';
import { Plus, X, Edit3, Trash2, Eye, Clock, Star, Calendar } from 'lucide-react';
import { useMovieContext } from '../context/MovieContext';

const CustomLists = ({ isOpen, onClose }) => {
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingListId, setEditingListId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const { addNotification } = useMovieContext();

  // Cargar listas desde localStorage
  useEffect(() => {
    const savedLists = localStorage.getItem('customLists');
    if (savedLists) {
      setLists(JSON.parse(savedLists));
    }
  }, []);

  // Guardar listas en localStorage
  const saveLists = (newLists) => {
    localStorage.setItem('customLists', JSON.stringify(newLists));
    setLists(newLists);
  };

  // Crear nueva lista
  const createList = () => {
    if (!newListName.trim()) {
      addNotification({
        message: 'Por favor ingresa un nombre para la lista',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const newList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      items: [],
      createdAt: new Date().toISOString(),
      description: '',
      isPrivate: false,
    };

    const updatedLists = [...lists, newList];
    saveLists(updatedLists);

    addNotification({
      message: `Lista "${newList.name}" creada exitosamente`,
      type: 'success',
      duration: 3000,
    });

    setNewListName('');
    setIsCreatingList(false);
  };

  // Editar nombre de lista
  const editList = () => {
    if (!editingName.trim()) {
      addNotification({
        message: 'Por favor ingresa un nombre para la lista',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    const updatedLists = lists.map((list) =>
      list.id === editingListId ? { ...list, name: editingName.trim() } : list
    );

    saveLists(updatedLists);

    addNotification({
      message: 'Lista actualizada exitosamente',
      type: 'success',
      duration: 3000,
    });

    setIsEditing(false);
    setEditingListId(null);
    setEditingName('');
  };

  // Eliminar lista
  const deleteList = (listId) => {
    const listToDelete = lists.find((list) => list.id === listId);
    const updatedLists = lists.filter((list) => list.id !== listId);

    saveLists(updatedLists);

    addNotification({
      message: `Lista "${listToDelete.name}" eliminada`,
      type: 'info',
      duration: 3000,
    });

    if (selectedList?.id === listId) {
      setSelectedList(null);
    }
  };

  // Agregar item a lista
  const addToList = (listId, item) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        // Verificar si el item ya existe
        const exists = list.items.some((existingItem) => existingItem.id === item.id);
        if (!exists) {
          return {
            ...list,
            items: [...list.items, { ...item, addedAt: new Date().toISOString() }],
          };
        }
      }
      return list;
    });

    saveLists(updatedLists);

    addNotification({
      message: `"${item.title || item.name}" agregado a la lista`,
      type: 'success',
      duration: 3000,
    });
  };

  // Remover item de lista
  const removeFromList = (listId, itemId) => {
    const updatedLists = lists.map((list) => {
      if (list.id === listId) {
        return {
          ...list,
          items: list.items.filter((item) => item.id !== itemId),
        };
      }
      return list;
    });

    saveLists(updatedLists);

    addNotification({
      message: 'Item removido de la lista',
      type: 'info',
      duration: 3000,
    });
  };

  // Obtener estadísticas de la lista
  const getListStats = (list) => {
    const movies = list.items.filter((item) => item.title);
    const series = list.items.filter((item) => item.name);
    const totalRating = list.items.reduce((sum, item) => sum + (item.vote_average || 0), 0);
    const avgRating = list.items.length > 0 ? (totalRating / list.items.length).toFixed(1) : 0;

    return {
      movies: movies.length,
      series: series.length,
      total: list.items.length,
      avgRating,
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-[#141414] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#E50914] p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Eye size={28} />
              <span>Mis Listas Personalizadas</span>
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex h-[600px]">
          {/* Sidebar con listas */}
          <div className="w-80 bg-[#1a1a1a] p-6 border-r border-gray-700">
            {/* Botón crear lista */}
            <div className="mb-6">
              {!isCreatingList ? (
                <button
                  onClick={() => setIsCreatingList(true)}
                  className="w-full bg-[#E50914] hover:bg-red-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus size={20} />
                  <span>Crear Nueva Lista</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Nombre de la lista"
                    className="w-full px-3 py-2 bg-[#333] text-white rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                    onKeyPress={(e) => e.key === 'Enter' && createList()}
                    autoFocus
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={createList}
                      className="flex-1 bg-[#E50914] hover:bg-red-700 text-white py-2 px-3 rounded font-semibold transition-colors"
                    >
                      Crear
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingList(false);
                        setNewListName('');
                      }}
                      className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-3 rounded font-semibold transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Lista de listas */}
            <div className="space-y-2">
              {lists.map((list) => {
                const stats = getListStats(list);
                return (
                  <div
                    key={list.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedList?.id === list.id
                        ? 'bg-[#E50914]/20 border border-[#E50914]/50'
                        : 'bg-[#333] hover:bg-[#404040]'
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-sm truncate">{list.name}</h3>
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                            setEditingListId(list.id);
                            setEditingName(list.name);
                          }}
                          className="p-1 text-gray-400 hover:text-white transition-colors"
                          title="Editar"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteList(list.id);
                          }}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span>{stats.total} items</span>
                        <span>•</span>
                        <span>⭐ {stats.avgRating}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🎬 {stats.movies}</span>
                        <span>📺 {stats.series}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {lists.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Eye size={48} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No tienes listas personalizadas</p>
                  <p className="text-xs mt-1">Crea tu primera lista para organizar tu contenido</p>
                </div>
              )}
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 p-6">
            {selectedList ? (
              <div>
                {/* Header de la lista seleccionada */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-[#333] text-white px-3 py-2 rounded border border-gray-600 focus:border-[#E50914] focus:outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && editList()}
                          autoFocus
                        />
                      ) : (
                        selectedList.name
                      )}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Creada: {new Date(selectedList.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{selectedList.items.length} items</span>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex space-x-2">
                      <button
                        onClick={editList}
                        className="bg-[#E50914] hover:bg-red-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditingListId(null);
                          setEditingName('');
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-semibold transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                {/* Items de la lista */}
                {selectedList.items.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedList.items.map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#333] rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
                      >
                        <div className="relative">
                          <img
                            src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                            alt={item.title || item.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />

                          {/* Botón eliminar */}
                          <button
                            onClick={() => removeFromList(selectedList.id, item.id)}
                            className="absolute top-2 right-2 p-1 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            title="Eliminar de la lista"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="p-3">
                          <h4 className="text-white font-semibold text-sm line-clamp-2 mb-2">
                            {item.title || item.name}
                          </h4>

                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Star size={12} className="text-yellow-400 fill-current" />
                              <span>{item.vote_average?.toFixed(1) || 'N/A'}</span>
                            </div>
                            <span>
                              {item.release_date?.split('-')[0] ||
                                item.first_air_date?.split('-')[0] ||
                                'N/A'}
                            </span>
                          </div>

                          <div className="mt-2">
                            <span className="inline-block px-2 py-1 bg-[#E50914] text-white text-xs rounded">
                              {item.title ? 'Película' : 'Serie'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Eye size={64} className="text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Lista vacía</h3>
                    <p className="text-gray-400">Esta lista no tiene contenido aún</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye size={64} className="text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Selecciona una lista</h3>
                <p className="text-gray-400">
                  Elige una lista de la izquierda para ver su contenido
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomLists;
