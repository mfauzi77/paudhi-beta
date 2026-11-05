// components/UserManagement.jsx - Super Admin Only Component
import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Edit, Trash2, Shield, Building, Eye, UserCheck,
  Search, Filter, Download, Upload, MoreVertical, AlertCircle,
  Check, X, Lock, Unlock, Mail, Phone, Calendar, Activity, User
} from 'lucide-react';
import apiService from '../../utils/apiService';

const UserManagement = ({ currentUser, capabilities, onNotification }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data for demo - In production, fetch from API
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userList = await apiService.getUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      onNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error',
        message: 'Gagal memuat data pengguna'
      });
    } finally {
      setLoading(false);
    }
  };

  // K/L options untuk dropdown
  const klOptions = [
    { id: 'KEMENKO_PMK', name: 'Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan' },
    { id: 'KEMENDIKDASMEN', name: 'Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi' },
    { id: 'KEMENAG', name: 'Kementerian Agama' },
    { id: 'KEMENDES_PDT', name: 'Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi' },
    { id: 'KEMENKES', name: 'Kementerian Kesehatan' },
    { id: 'KEMENDUKBANGGA', name: 'Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional' },
    { id: 'KEMENSOS', name: 'Kementerian Sosial' },
    { id: 'KPPPA', name: 'Kementerian Pemberdayaan Perempuan dan Perlindungan Anak' },
    { id: 'KEMENDAGRI', name: 'Kementerian Dalam Negeri' },
    { id: 'BAPPENAS', name: 'Badan Perencanaan Pembangunan Nasional' },
    { id: 'BPS', name: 'Badan Pusat Statistik' }
  ];

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Role configuration
  const getRoleInfo = (role) => {
    const roleConfig = {
      super_admin: {
        label: 'Super Admin',
        icon: Shield,
        color: 'purple',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
        description: 'Akses penuh semua fitur'
      },
      admin: {
        label: 'Administrator',
        icon: UserCheck,
        color: 'blue',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800',
        description: 'Akses penuh kecuali manajemen pengguna'
      },
      kl_operator: {
        label: 'K/L Operator',
        icon: Building,
        color: 'green',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        description: 'Akses terbatas pada K/L tertentu'
      },
      viewer: {
        label: 'Viewer',
        icon: Eye,
        color: 'gray',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
        description: 'Akses read-only'
      }
    };
    return roleConfig[role] || roleConfig.viewer;
  };

  // Format tanggal
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle user actions
  const handleCreateUser = async (userData) => {
    try {
      const newUser = await apiService.createUser(userData);
      setUsers([...users, newUser]);
      setShowCreateModal(false);
      onNotification({
        id: Date.now(),
        type: 'success',
        title: 'Berhasil',
        message: `Pengguna ${newUser.fullName} berhasil dibuat`
      });
    } catch (error) {
      onNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error',
        message: error.message || 'Gagal membuat pengguna baru'
      });
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      const updatedUser = await apiService.updateUser(editingUser.id, userData);
      setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      setShowEditModal(false);
      setEditingUser(null);
      onNotification({
        id: Date.now(),
        type: 'success',
        title: 'Berhasil',
        message: `Pengguna ${updatedUser.fullName} berhasil diupdate`
      });
    } catch (error) {
      onNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error',
        message: error.message || 'Gagal mengupdate pengguna'
      });
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const updated = await apiService.toggleUserStatus(userId, !user.isActive);
      setUsers(users.map(u => u.id === userId ? updated : u));
      onNotification({
        id: Date.now(),
        type: 'success',
        title: 'Berhasil',
        message: `Pengguna ${updated.fullName} berhasil di${updated.isActive ? 'aktifkan' : 'nonaktifkan'}`
      });
    } catch (error) {
      onNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error',
        message: error.message || 'Gagal mengubah status pengguna'
      });
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      await apiService.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      onNotification({
        id: Date.now(),
        type: 'success',
        title: 'Berhasil',
        message: `Pengguna berhasil dihapus`
      });
    } catch (error) {
      onNotification({
        id: Date.now(),
        type: 'error',
        title: 'Error',
        message: error.message || 'Gagal menghapus pengguna'
      });
    }
  };

  // User Form Modal Component
  const UserFormModal = ({ isOpen, onClose, user = null, onSubmit }) => {
    const [formData, setFormData] = useState({
      username: user?.username || '',
      email: user?.email || '',
      fullName: user?.fullName || '',
      role: user?.role || 'viewer',
      klId: user?.klId || '',
      password: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();

      if (!formData.username || !formData.email || !formData.fullName) {
        onNotification({
          id: Date.now(),
          type: 'error',
          title: 'Error',
          message: 'Mohon lengkapi semua field yang wajib diisi'
        });
        return;
      }

      if (!user && !formData.password) {
        onNotification({
          id: Date.now(),
          type: 'error',
          title: 'Error',
          message: 'Password wajib diisi untuk pengguna baru'
        });
        return;
      }

      if (formData.role === 'kl_operator' && !formData.klId) {
        onNotification({
          id: Date.now(),
          type: 'error',
          title: 'Error',
          message: 'K/L harus dipilih untuk role K/L Operator'
        });
        return;
      }

      const submitData = { ...formData };
      if (formData.role !== 'kl_operator') {
        submitData.klId = null;
        submitData.klName = null;
      } else {
        const selectedKL = klOptions.find(kl => kl.id === formData.klId);
        submitData.klName = selectedKL?.name || null;
      }

      onSubmit(submitData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {user ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Pengguna *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value, klId: '' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="viewer">Viewer</option>
                <option value="kl_operator">K/L Operator</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>

            {formData.role === 'kl_operator' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kementerian/Lembaga *
                </label>
                <select
                  value={formData.klId}
                  onChange={(e) => setFormData({ ...formData, klId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih K/L</option>
                  {klOptions.map(kl => (
                    <option key={kl.id} value={kl.id}>{kl.name}</option>
                  ))}
                </select>
              </div>
            )}

            {!user && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {user ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Manajemen Pengguna</h2>
              <p className="text-sm text-gray-600">
                Kelola pengguna dan akses sistem ({filteredUsers.length} pengguna)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Pengguna
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Cari berdasarkan nama, email, atau nama pengguna..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Administrator</option>
              <option value="kl_operator">K/L Operator</option>
              <option value="viewer">Viewer</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-gray-200">
        {filteredUsers.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada pengguna</h3>
            <p className="text-gray-500">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Tidak ada pengguna yang sesuai dengan filter'
                : 'Belum ada pengguna yang terdaftar'
              }
            </p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const roleInfo = getRoleInfo(user.role);
            const RoleIcon = roleInfo.icon;

            return (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${roleInfo.bgColor} flex items-center justify-center relative`}>
                      <RoleIcon className={`w-6 h-6 ${roleInfo.textColor}`} />
                      {!user.isActive && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                          <Lock className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{user.fullName}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.textColor}`}>
                          {roleInfo.label}
                        </span>
                        {user.klName && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.klName}
                          </span>
                        )}
                        {!user.isActive && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Nonaktif
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          @{user.username}
                        </div>
                        {user.lastLogin && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            Login: {formatDate(user.lastLogin)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        user.isActive
                          ? 'text-orange-600 hover:bg-orange-100'
                          : 'text-green-600 hover:bg-green-100'
                      }`}
                      title={user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                    >
                      {user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {user.id !== currentUser.id && (
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'super_admin').length}
            </div>
            <div className="text-xs text-gray-500">Super Admin</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'kl_operator').length}
            </div>
            <div className="text-xs text-gray-500">K/L Operator</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {users.filter(u => u.role === 'viewer').length}
            </div>
            <div className="text-xs text-gray-500">Viewer</div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <UserFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />

      <UserFormModal
        isOpen={showEditModal}
        user={editingUser}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSubmit={handleUpdateUser}
      />
    </div>
  );
};

export default UserManagement;