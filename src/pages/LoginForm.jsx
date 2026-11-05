// components/LoginForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Eye,
  EyeOff,
  Shield,
  Building,
  UserCheck,
  Users,
  Lock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../pages/contexts/AuthContext";
import { useToast } from "../components/ToastContext";
import apiService from "../utils/apiService";
import regions from "../data/dataprovkabkota.json";

const LoginForm = () => {
  const { login, loading, error, clearError, user, isAuthenticated } =
    useAuth();
  const navigate = useNavigate();
  const { success, error: toastError, loading: toastLoading } = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);
  const [registerData, setRegisterData] = useState({ fullName: "", email: "", password: "", role: "admin_kl", klId: "", klName: "", province: "", city: "" });
  const [confirmRegisterPassword, setConfirmRegisterPassword] = useState("");
  const [showRegisterPasswords, setShowRegisterPasswords] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerDone, setRegisterDone] = useState("");
  const klOptions = [
    ["KEMENKO_PMK", "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan"], ["KEMENDIKDASMEN", "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi"], ["KEMENAG", "Kementerian Agama"], ["KEMENDES_PDTT", "Kementerian Desa, Pembangunan Daerah Tertinggal, dan Transmigrasi"], ["KEMENKES", "Kementerian Kesehatan"], ["KEMENDUKBANGGA", "Kementerian Pembangunan Kependudukan dan Keluarga Berencana Nasional"], ["KEMENSOS", "Kementerian Sosial"], ["KEMENPPPA", "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak"], ["KEMENDAGRI", "Kementerian Dalam Negeri"], ["BAPPENAS", "Badan Perencanaan Pembangunan Nasional"], ["BPS", "Badan Pusat Statistik"]
  ];

  const handleRegister = async (e) => {
    e.preventDefault(); setRegisterError(""); setRegisterDone("");
    if (registerData.password !== confirmRegisterPassword) {
      setRegisterError("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    try {
      const response = await apiService.register(registerData);
      setRegisterDone(response.message || "Permintaan registrasi terkirim.");
      setRegisterData({ fullName: "", email: "", password: "", role: "admin_kl", klId: "", klName: "", province: "", city: "" });
      setConfirmRegisterPassword("");
    } catch (err) { setRegisterError(err.message || "Registrasi gagal"); }
  };

  // ✅ Helper function untuk menentukan redirect path berdasarkan role
  const getRedirectPath = (userRole) => {
    // Semua role diarahkan ke Manajemen Data RAN PAUDHI
    return "/admin/ran-paud-data";
  };

  // ✅ Auto-redirect ketika sudah authenticated dengan debugging lebih detail
  useEffect(() => {
    console.log(
      "🔍 useEffect triggered - isAuthenticated:",
      isAuthenticated,
      "user:",
      user?.email
    );

    if (isAuthenticated && user) {
      const redirectPath = getRedirectPath(user.role);
      console.log("🔄 Auto-redirecting to:", redirectPath);
      console.log("🔍 Current pathname:", window.location.pathname);

      // ✅ Cek apakah kita masih di halaman login
      if (
        window.location.pathname === "/login" ||
        window.location.pathname === "/"
      ) {
        navigate(redirectPath, { replace: true });
        console.log("✅ Auto-redirect via navigate");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) clearError();
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) return;

    toastLoading('Memproses login...');
    const result = await login(formData.email, formData.password);

    if (result.success) {
      success('Login berhasil! Selamat datang kembali.');
      
      // ✅ Manual redirect tanpa window.location.href fallback untuk optimasi SPA
      const redirectPath = getRedirectPath(result.user.role);
      navigate(redirectPath, { replace: true });
    } else {
      toastError('Login gagal: ' + (result.error || 'Email atau password salah'));
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-64px)] bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-start sm:items-center justify-center px-3 sm:px-4 py-3 sm:py-2">
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-md ${registerMode ? "p-4 sm:p-5" : "p-5 sm:p-8"}`}>
        <div className={`relative text-center ${registerMode ? "mb-3" : "mb-5 sm:mb-8"}`}>
          {registerMode && <button type="button" onClick={() => { setRegisterMode(false); setRegisterDone(""); }} className="absolute right-0 top-0 text-blue-700 text-xs sm:text-sm hover:text-blue-900">Kembali ke login</button>}
          <img src="/logo.png" alt="Logo PAUDHI" className={`object-contain mx-auto ${registerMode ? "w-16 h-14 sm:w-20 sm:h-16 mb-1" : "w-20 h-16 sm:w-24 sm:h-20 mb-2 sm:mb-3"}`} />
          <h1 className={`mb-2 font-bold text-gray-900 ${registerMode ? "text-lg whitespace-nowrap tracking-tight" : "text-2xl sm:text-3xl"}`}>
            {registerMode ? "Registrasi SISMONEV" : "Sistem Monitoring dan Evaluasi PAUDHI"}
          </h1>
        </div>

        {registerMode ? (
        <form onSubmit={handleRegister} className="grid grid-cols-1 gap-3">
          <p className="text-sm text-gray-600">Pilih jenis akun. Akun dapat digunakan setelah disetujui oleh admin.</p>
          {[['fullName', 'Nama lengkap', 'text'], ['email', 'Alamat email', 'email']].map(([key, label, type]) => <label key={key} className={`text-sm block font-medium text-gray-700`}>{label}<input className={`py-2 mt-0.5 w-full px-3 border border-gray-300 rounded-lg`} type={type} required value={registerData[key]} onChange={e => setRegisterData({ ...registerData, [key]: e.target.value })} /></label>)}
          <label className="text-sm block font-medium text-gray-700">Kata sandi (minimal 8 karakter)<span className="relative mt-0.5 block"><input className="py-2 w-full px-3 pr-10 border border-gray-300 rounded-lg" type={showRegisterPasswords ? "text" : "password"} minLength={8} required value={registerData.password} onChange={e => setRegisterData({ ...registerData, password: e.target.value })} /><button type="button" aria-label={showRegisterPasswords ? "Sembunyikan kata sandi" : "Lihat kata sandi"} onClick={() => setShowRegisterPasswords(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showRegisterPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></span></label>
          <label className="text-sm block font-medium text-gray-700">Ulangi kata sandi<span className="relative mt-0.5 block"><input className="py-2 w-full px-3 pr-10 border border-gray-300 rounded-lg" type={showRegisterPasswords ? "text" : "password"} minLength={8} required value={confirmRegisterPassword} onChange={e => setConfirmRegisterPassword(e.target.value)} /><button type="button" aria-label={showRegisterPasswords ? "Sembunyikan kata sandi" : "Lihat kata sandi"} onClick={() => setShowRegisterPasswords(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showRegisterPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></span></label>
          <label className={`text-sm block font-medium text-gray-700`}>Jenis akun<select className={`py-2 mt-0.5 w-full px-3 border border-gray-300 rounded-lg`} value={registerData.role} onChange={e => setRegisterData({ ...registerData, role: e.target.value, klId: "", klName: "", province: "", city: "" })}><option value="admin_kl">Admin K/L</option><option value="admin_daerah">Admin Daerah</option></select></label>
          {registerData.role === "admin_kl" ? <label className="block text-sm font-medium text-gray-700">Kementerian/Lembaga<select required className={`py-2 mt-0.5 w-full px-3 border border-gray-300 rounded-lg`} value={registerData.klId} onChange={e => { const item = klOptions.find(x => x[0] === e.target.value); setRegisterData({ ...registerData, klId: e.target.value, klName: item?.[1] || "" }); }}><option value="">Pilih K/L</option>{klOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label> : <>
            <label className={`text-sm block font-medium text-gray-700`}>Provinsi<select required className={`py-2 mt-0.5 w-full px-3 border border-gray-300 rounded-lg`} value={registerData.province} onChange={e => setRegisterData({ ...registerData, province: e.target.value, city: "" })}><option value="">Pilih provinsi</option>{regions.map(item => <option key={item.provinsi} value={item.provinsi}>{item.provinsi}</option>)}</select></label>
            <label className={`text-sm block font-medium text-gray-700`}>Cakupan wilayah<select disabled={!registerData.province} className={`py-2 mt-0.5 w-full px-3 border border-gray-300 rounded-lg disabled:bg-gray-100`} value={registerData.city} onChange={e => setRegisterData({ ...registerData, city: e.target.value })}><option value="">Seluruh Provinsi</option>{(regions.find(item => item.provinsi === registerData.province)?.kabupaten_kota || []).map(city => <option key={city} value={city}>{city}</option>)}</select><span className={`${registerMode ? "text-xs leading-tight mt-1.5" : "text-xs mt-1"} block text-gray-500`}>Pilih kabupaten/kota untuk cakupan setempat. Pilih “Seluruh Provinsi” bila bertugas di tingkat provinsi.</span></label>
          </>}
          {registerError && <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded">{registerError}</p>}
          {registerDone && <p role="status" className="text-sm text-green-800 bg-green-50 p-3 rounded">{registerDone}</p>}
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium">Kirim Permintaan Registrasi</button>
        </form>
        ) : <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alamat Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-11"
                placeholder="Masukkan alamat email Anda"
                required
              />
              <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-11 pr-11"
                placeholder="Masukkan kata sandi Anda"
                required
              />
              <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-sm">Login Failed</div>
                <div className="text-sm mt-1">{error}</div>
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Sedang Masuk...</span>
              </div>
            ) : (
              "Masuk"
            )}
          </button>
        </form>}

        {!registerMode && <button type="button" onClick={() => { setRegisterMode(true); clearError(); }} className="mt-5 w-full text-sm text-blue-700 hover:text-blue-900 font-medium">Belum punya akun? Ajukan registrasi</button>}

        <div className={`${registerMode ? "mt-3" : "mt-8"} text-center text-xs text-gray-500`}>
          <p>@ SISMONEV PAUDHI 2026</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
