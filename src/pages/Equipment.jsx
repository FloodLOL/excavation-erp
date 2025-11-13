import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit2, Trash2, Search, Wrench } from 'lucide-react'

const Equipment = () => {
  const [equipment, setEquipment] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingEquipment, setEditingEquipment] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    model: '',
    serial_number: '',
    purchase_date: '',
    status: 'available',
    last_maintenance: '',
    next_maintenance: '',
    notes: '',
  })

  useEffect(() => {
    fetchEquipment()
  }, [])

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEquipment(data || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingEquipment) {
        const { error } = await supabase
          .from('equipment')
          .update(formData)
          .eq('id', editingEquipment.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('equipment').insert([formData])
        if (error) throw error
      }

      setShowModal(false)
      setEditingEquipment(null)
      resetForm()
      fetchEquipment()
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('Erreur lors de l\'enregistrement de l\'équipement: ' + error.message)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      model: '',
      serial_number: '',
      purchase_date: '',
      status: 'available',
      last_maintenance: '',
      next_maintenance: '',
      notes: '',
    })
  }

  const handleEdit = (item) => {
    setEditingEquipment(item)
    setFormData({
      name: item.name,
      type: item.type || '',
      model: item.model || '',
      serial_number: item.serial_number || '',
      purchase_date: item.purchase_date || '',
      status: item.status,
      last_maintenance: item.last_maintenance || '',
      next_maintenance: item.next_maintenance || '',
      notes: item.notes || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet équipement?')) return

    try {
      const { error } = await supabase.from('equipment').delete().eq('id', id)
      if (error) throw error
      fetchEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Erreur lors de la suppression de l\'équipement: ' + error.message)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      in_use: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      out_of_service: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const getStatusLabel = (status) => {
    const labels = {
      available: 'DISPONIBLE',
      in_use: 'EN UTILISATION',
      maintenance: 'MAINTENANCE',
      out_of_service: 'HORS SERVICE',
    }
    return labels[status] || status.toUpperCase()
  }

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Équipement</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Suivez et gérez votre équipement</p>
        </div>
        <button
          onClick={() => {
            setEditingEquipment(null)
            resetForm()
            setShowModal(true)
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-5 w-5 mr-2" />
          Ajouter équipement
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-5 w-5" />
        <input
          type="text"
          placeholder="Rechercher de l'équipement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.type}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                  {getStatusLabel(item.status)}
                </span>
                {item.model && <p className="text-gray-600 dark:text-gray-400">Modèle: {item.model}</p>}
                {item.serial_number && <p className="text-gray-500 dark:text-gray-500">N/S: {item.serial_number}</p>}
                {item.next_maintenance && (
                  <div className="flex items-center text-orange-600 dark:text-orange-400 mt-3">
                    <Wrench className="h-4 w-4 mr-1" />
                    <span className="text-xs">Prochaine maintenance: {new Date(item.next_maintenance).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div
          className="fixed inset-0 bg-opacity-15 dark:bg-opacity-20 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => {
            setShowModal(false)
            setEditingEquipment(null)
            resetForm()
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full p-6 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingEquipment ? 'Modifier l\'équipement' : 'Ajouter un nouvel équipement'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'équipement</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="ex: Excavatrice, Camion benne"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Modèle</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Numéro de série</label>
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date d'achat</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  >
                    <option value="available">Disponible</option>
                    <option value="in_use">En utilisation</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="out_of_service">Hors service</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dernière maintenance</label>
                  <input
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => setFormData({ ...formData, last_maintenance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prochaine maintenance</label>
                  <input
                    type="date"
                    value={formData.next_maintenance}
                    onChange={(e) => setFormData({ ...formData, next_maintenance: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingEquipment(null)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEquipment ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Equipment
