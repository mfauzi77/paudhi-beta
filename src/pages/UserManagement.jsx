// pages/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Building,
  UserCheck,
  AlertCircle,
  CheckCircle,
  X,
  Save,
  UserPlus,
  CalendarDays,
} from "lucide-react";
import apiService from "../utils/apiService";
import regionData from "../data/dataprovkabkota.json";

const UserManagement = ({ setActiveTab }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [error, setError] = useState("");
  const [pendingUsers, setPendingUsers] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    role: "admin_kl",
    klId: "",
    klName: "",
    province: "",
    city: "",
    regionName: "",
    regionNote: "",
    isActive: true,
  });

  const [availableCities, setAvailableCities] = useState([]);

  const klList = [
    {
      id: "KEMENKO_PMK",
      name: "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
    },
    {
      id: "KEMENDIKDASMEN",
      name: "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
    },
    { id: "KEMENAG", name: "Kementerian Agama" },
    {
      id: "KEMENDES_PDTT",
      name: "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi",
    },
    { id: "KEMENKES", name: "Kementerian Kesehatan" },
    {
      id: "KEMENDUKBANGGA",
      name: "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional",
    },
    { id: "KEMENSOS", name: "Kementerian Sosial" },
    {
      id: "KEMENPPPA",
      name: "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
    },
    { id: "KEMENDAGRI", name: "Kementerian Dalam Negeri" },
    { id: "BAPPENAS", name: "Badan Perencanaan Pembangunan Nasional" },
    { id: "BPS", name: "Badan Pusat Statistik" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const response = await apiService.getPendingUsers();
      setPendingUsers(response.data || []);
    } catch (error) { console.error("Error fetching pending users:", error); }
  };

  useEffect(() => { fetchPendingUsers(); }, []);

  const approvePendingUser = async (user) => {
    try { await apiService.approveUser(user.id); await Promise.all([fetchPendingUsers(), fetchUsers()]); }
    catch (err) { alert("Gagal menyetujui akun: " + (err.message || "Terjadi kesalahan")); }
  };
  const rejectPendingUser = async (user) => {
    if (!window.confirm(`Tolak dan hapus permintaan akun ${user.fullName}?`)) return;
    try { await apiService.rejectUser(user.id); await fetchPendingUsers(); }
    catch (err) { alert("Gagal menolak permintaan: " + (err.message || "Terjadi kesalahan")); }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-set klName when klId changes
    if (field === "klId") {
      const selectedKL = klList.find((kl) => kl.id === value);
      setFormData((prev) => ({
        ...prev,
        klName: selectedKL ? selectedKL.name : "",
      }));
    }

    // For admin_daerah: regionName is always the province, city is optional
    if (field === "province") {
      setFormData((prev) => ({
        ...prev,
        province: value,
        regionName: value, // regionName is the province
        city: "", // reset city when province changes
      }));
    }
    // city change doesn't affect regionName
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      fullName: "",
      role: "admin_kl",
      klId: "",
      klName: "",
      province: "",
      city: "",
      regionName: "",
      regionNote: "",
      isActive: true,
    });
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validasi: jika admin_kl, klId dan klName wajib diisi
    if (formData.role === "admin_kl" && (!formData.klId || !formData.klName)) {
      alert("Untuk role Admin KL, K/L wajib dipilih!");
      return;
    }

    // Validasi: jika admin_daerah, province wajib diisi
    if (formData.role === "admin_daerah" && !formData.province) {
      alert("Untuk role Admin Daerah, Provinsi wajib dipilih!");
      return;
    }

    try {
      if (editingUser) {
        await apiService.updateUser(editingUser._id, formData);
        alert("User berhasil diupdate!");
      } else {
        await apiService.createUser(formData);
        alert("User berhasil dibuat!");
      }

      setShowForm(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error: " + (error.message || "Gagal menyimpan user"));
    }
  };

  const handleEdit = (user) => {
    // For admin_daerah, regionName is the province, city is optional
    const province = user.regionName || "";
    const city = user.city || "";

    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "", // Don't show password
      fullName: user.fullName,
      role: user.role,
      klId: user.klId || "",
      klName: user.klName || "",
      province,
      city,
      regionName: province, // regionName is province
      regionNote: user.regionNote || "",
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (user) => {
    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus user "${user.fullName}"?`
      )
    ) {
      try {
        await apiService.deleteUser(user._id);
        alert("User berhasil dihapus!");
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error: " + (error.message || "Gagal menghapus user"));
      }
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await apiService.updateUser(user._id, { isActive: !user.isActive });
      alert(`User ${user.isActive ? "dinonaktifkan" : "diaktifkan"}!`);
      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Error: " + (error.message || "Gagal mengubah status user"));
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" ||
      (filterRole === "super_admin" ? ["super_admin", "admin_utama"].includes(user.role) : user.role === filterRole);
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role) => {
    switch (role) {
      case "admin_utama":
      case "super_admin":
        return "bg-purple-100 text-purple-700";
      case "admin_kl":
        return "bg-blue-100 text-blue-700";
      case "admin_daerah":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case "admin_utama":
      case "super_admin":
        return "Super Admin";
      case "admin_kl":
        return "Admin K/L";
      case "admin_daerah":
        return "Admin Daerah";
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 bg-gray-50 min-h-screen p-4 md:px-6">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Manajemen Pengguna
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">Memuat data user...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-gray-50 min-h-screen p-4 md:px-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 md:p-5 border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                Manajemen Pengguna
              </h2>
              <p className="text-[14px] text-gray-500 mt-0.5">
                Kelola user dan akses untuk sistem RAN PAUDHI
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="px-4 py-2 text-[14px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Tambah Pengguna
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-amber-200">
        <div className="flex items-center justify-between mb-4">
          <div><h3 className="font-semibold text-gray-900">Permintaan Registrasi</h3><p className="text-sm text-gray-500">{pendingUsers.length} akun menunggu persetujuan</p></div>
          <button onClick={fetchPendingUsers} className="text-sm font-medium text-blue-700 hover:text-blue-900">Refresh</button>
        </div>
        {pendingUsers.length === 0 ? <p className="text-sm text-gray-500 py-2">Belum ada permintaan registrasi.</p> : <div className="space-y-3">{pendingUsers.map(user => {
          const submittedFrom = user.role === "admin_daerah"
            ? `Admin Daerah · ${user.province || "Provinsi belum dipilih"}${user.city ? ` · ${user.city}` : " · Seluruh Provinsi"}`
            : `Admin K/L · ${user.klName || "K/L belum dipilih"}`;
          const registeredAt = user.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
            ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(user.createdAt))
            : "Waktu pendaftaran tidak tersedia";
          return <article key={user.id} className="rounded-xl border border-gray-200 bg-gray-50/70 p-4 md:p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{user.fullName}</p>
              <p className="text-sm text-gray-600 break-all">{user.email}</p>
              <p className="mt-2 text-sm text-gray-700"><span className="font-medium">Mendaftar sebagai:</span> {submittedFrom}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500"><CalendarDays className="h-3.5 w-3.5" />{registeredAt}</p>
            </div>
            <div className="flex shrink-0 gap-2 md:justify-end">
              <button onClick={() => approvePendingUser(user)} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Setujui</button>
              <button onClick={() => rejectPendingUser(user)} className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">Tolak</button>
            </div>
          </article>;
        })}</div>}
      </section>

      {/* Filters */}
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-80 lg:w-96">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-2 flex-wrap flex-1">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
            >
              <option value="all">Semua Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin_kl">Admin K/L</option>
              <option value="admin_daerah">Admin Daerah</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 h-9 text-[14px] border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="inactive">Tidak Aktif</option>
            </select>

            <button
              onClick={fetchUsers}
              className="px-3 py-1.5 h-9 text-[14px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleFormChange("username", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingUser
                    ? "Password Baru (kosongkan jika tidak diubah)"
                    : "Kata Sandi"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  required={!editingUser}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleFormChange("fullName", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleFormChange("role", e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="admin_kl">Admin K/L</option>
                  <option value="admin_daerah">Admin Daerah</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              {formData.role === "admin_kl" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    K/L
                  </label>
                  <select
                    value={formData.klId}
                    onChange={(e) => handleFormChange("klId", e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Pilih K/L</option>
                    {klList.map((kl) => (
                      <option key={kl.id} value={kl.id}>
                        {kl.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {formData.role === "admin_daerah" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Provinsi
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) =>
                        handleFormChange("province", e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Pilih Provinsi</option>
                      {regionData.map((item) => (
                        <option key={item.provinsi} value={item.provinsi}>
                          {item.provinsi}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kabupaten/Kota (opsional)
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => handleFormChange("city", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={!formData.province}
                    >
                      <option value="">Pilih Kabupaten/Kota</option>
                      {formData.province &&
                        regionData
                          .find((item) => item.provinsi === formData.province)
                          ?.kabupaten_kota.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan Tambahan (opsional)
                    </label>
                    <textarea
                      value={formData.regionNote}
                      onChange={(e) =>
                        handleFormChange("regionNote", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    handleFormChange("isActive", e.target.checked)
                  }
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Pengguna Aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingUser ? "Update" : "Simpan"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  User
                </th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  Role
                </th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  K/L
                </th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  Last Login
                </th>
                <th className="px-4 py-2 text-left text-[12px] font-bold text-gray-500 uppercase tracking-tight">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-all duration-200">
                  <td className="px-4 py-2 align-top pt-2.5">
                    <div>
                      <div className="text-[14px] font-bold text-gray-900 leading-tight">
                        {user.fullName}
                      </div>
                      <div className="text-[12px] text-gray-600 mt-0.5">{user.email}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        @{user.username}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top pt-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${getRoleColor(
                        user.role
                      )}`}
                    >
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-2 align-top pt-2.5">
                    {user.role === "admin_daerah" ? (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[13px] text-gray-800 leading-tight">
                          {user.regionName || "-"}
                        </span>
                      </div>
                    ) : user.klName ? (
                      <div className="flex items-start gap-1.5 mt-0.5">
                        <Building className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-[13px] text-gray-800 leading-tight line-clamp-2">
                          {user.klName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13px] text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-2 align-top pt-2.5">
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {user.isActive ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      )}
                      <span
                        className={`text-[12px] font-medium ${user.isActive ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {user.isActive ? "Aktif" : "Tidak Aktif"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top pt-2.5 text-[13px] text-gray-600">
                    <div className="mt-0.5">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("id-ID")
                        : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-2 align-top pt-2.5">
                    <div className="flex items-center gap-2 mt-0.5">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1 rounded transition-colors ${
                          user.isActive
                            ? "text-red-600 hover:text-red-800 hover:bg-red-50"
                            : "text-green-600 hover:text-green-800 hover:bg-green-50"
                        }`}
                        title={user.isActive ? "Nonaktifkan" : "Aktifkan"}
                      >
                        {user.isActive ? (
                          <Lock className="w-4 h-4" />
                        ) : (
                          <Unlock className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Hapus User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-[16px] font-bold text-gray-900 mb-1">
              Tidak ada user
            </h3>
            <p className="text-[13px] text-gray-500">
              Tidak ada user yang sesuai dengan filter yang dipilih.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
