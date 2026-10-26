import { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error('Konfirmasi password tidak cocok.');
        }
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        alert('Pendaftaran berhasil! Silakan masuk.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-100">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6">
          <img 
            src="/icon-192.png" 
            alt="Logo PosU" 
            className="w-16 h-16 object-contain mb-3 drop-shadow-sm" 
          />
          <h2 className="text-2xl font-black text-slate-800">
            {isSignUp ? 'Buat Akun PosU' : 'Masuk ke Kasir'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isSignUp 
              ? 'Lengkapi data untuk membuat akun kasir baru' 
              : 'Masukkan kredensial Anda untuk melanjutkan'}
          </p>
        </div>

        {/* Pesan Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold text-center border border-red-100">
            {errorMsg}
          </div>
        )}

        {/* Form Authentifikasi */}
        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Input Khusus Pendaftaran */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Usaha / Kasir
              </label>
              <input
                type="text"
                required
                placeholder="Toko Jaya Abadi"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              placeholder="kasir@tokoku.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Input Konfirmasi Password untuk Pendaftaran */}
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ulangi Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {/* Opsi Ingat Saya (Centang Keamanan Login) */}
          {!isSignUp && (
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-medium">Ingat Sesi Login</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#0d766e] px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-[#095d57] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Memproses...' : isSignUp ? 'Daftar Akun Baru' : 'Masuk ke Sistem'}
          </button>
        </form>

        {/* Beralih Mode Login/Daftar */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isSignUp ? (
            <p>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setErrorMsg('');
                }}
                className="font-bold text-teal-700 hover:underline"
              >
                Masuk di sini
              </button>
            </p>
          ) : (
            <p>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setErrorMsg('');
                }}
                className="font-bold text-teal-700 hover:underline"
              >
                Daftar sekarang
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
