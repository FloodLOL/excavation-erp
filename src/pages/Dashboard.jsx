import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { DollarSign, FolderKanban, Truck, Users, Plus, Calendar, Wrench } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useNavigate } from 'react-router-dom'

const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md hover:scale-105 transition-all cursor-pointer text-left w-full"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </button>
)

const QuickActionButton = ({ icon: Icon, text, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all hover:scale-105 w-full"
  >
    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
    </div>
    <span className="font-medium text-gray-700 dark:text-gray-300">{text}</span>
  </button>
)

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalClients: 0,
    activeProjects: 0,
    totalEquipment: 0,
    monthlyExpenses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [projectsData, setProjectsData] = useState([])
  const [expensesData, setExpensesData] = useState([])

  const fetchDashboardData = async () => {
    try {
      const currentYear = new Date().getFullYear()
      const currentMonth = new Date().getMonth()

      // Fetch all data
      const [clients, projects, equipment, allExpenses] = await Promise.all([
        supabase.from('clients').select('id', { count: 'exact', head: true }),
        supabase.from('projects').select('id, status', { count: 'exact' }),
        supabase.from('equipment').select('id', { count: 'exact', head: true }),
        supabase.from('expenses').select('amount, date').gte('date', `${currentYear}-01-01`).lte('date', `${currentYear}-12-31`),
      ])

      const activeProjects = projects.data?.filter(p => p.status === 'active').length || 0

      // Calculate monthly expenses for current month
      const currentMonthStart = new Date(currentYear, currentMonth, 1).toISOString()
      const monthlyExpenses = allExpenses.data
        ?.filter(exp => exp.date >= currentMonthStart)
        .reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0

      setStats({
        totalClients: clients.count || 0,
        activeProjects,
        totalEquipment: equipment.count || 0,
        monthlyExpenses,
      })

      // Projects by status for pie chart
      const statusCounts = projects.data?.reduce((acc, project) => {
        acc[project.status] = (acc[project.status] || 0) + 1
        return acc
      }, {})

      const statusTranslations = {
        active: 'Actif',
        completed: 'Terminé',
        pending: 'En attente'
      }

      setProjectsData(
        Object.entries(statusCounts || {}).map(([name, value]) => ({
          name: statusTranslations[name] || name,
          value
        }))
      )

      // Calculate real expenses by month for the current year
      const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
      const monthlyData = []

      for (let month = 0; month <= currentMonth; month++) {
        const monthStart = new Date(currentYear, month, 1)
        const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59)

        const monthTotal = allExpenses.data
          ?.filter(exp => {
            const expDate = new Date(exp.date)
            return expDate >= monthStart && expDate <= monthEnd
          })
          .reduce((sum, exp) => sum + parseFloat(exp.amount), 0) || 0

        monthlyData.push({
          month: monthNames[month],
          amount: monthTotal
        })
      }

      setExpensesData(monthlyData)

      setLoading(false)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Aperçu de votre entreprise d'excavation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Clients"
          value={stats.totalClients}
          color="bg-blue-500"
          onClick={() => navigate('/clients')}
        />
        <StatCard
          icon={FolderKanban}
          title="Projets Actifs"
          value={stats.activeProjects}
          color="bg-green-500"
          onClick={() => navigate('/projects')}
        />
        <StatCard
          icon={Truck}
          title="Équipement"
          value={stats.totalEquipment}
          color="bg-yellow-500"
          onClick={() => navigate('/equipment')}
        />
        <StatCard
          icon={DollarSign}
          title="Dépenses Mensuelles"
          value={`${stats.monthlyExpenses.toLocaleString()} $`}
          color="bg-red-500"
          onClick={() => navigate('/expenses')}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionButton
            icon={Plus}
            text="Nouveau Projet"
            onClick={() => navigate('/projects')}
          />
          <QuickActionButton
            icon={Calendar}
            text="Gérer les Feuilles de Temps"
            onClick={() => navigate('/timesheets')}
          />
          <QuickActionButton
            icon={Wrench}
            text="Suivre l'Équipement"
            onClick={() => navigate('/equipment')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dépenses Mensuelles</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={expensesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #ffffff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="amount" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projets par Statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={projectsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {projectsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tooltip-bg, #ffffff)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
