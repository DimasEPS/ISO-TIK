import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/context/AuthContext";
import { useLoginForm } from "@/auth/hooks/useLoginForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput, LoginButton, ErrorAlert } from "./components";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (username, password) => {
    const result = await login(username, password);
    
    if (result.success) {
      toast.success("Berhasil masuk. Selamat datang kembali!");
      navigate("/admin/dashboard");
    } else {
      const fallbackError = result.error || "Username atau password salah";
      setErrors((prev) => ({
        ...prev,
        ...(result.fieldErrors || {}),
        submit: fallbackError,
      }));
      toast.error(fallbackError);
    }
  };

  const {
    formData,
    errors,
    isLoading,
    showPassword,
    handleChange,
    handleSubmit,
    togglePasswordVisibility,
    setErrors,
  } = useLoginForm(handleLogin);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue rounded-2xl mb-4 shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-navy mb-2">ISO-TIK</h1>
          <p className="text-gray-600">Sistem Manajemen Keamanan Informasi</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-navy mb-2">Selamat Datang</h2>
            <p className="text-gray-600 text-sm">Silakan masuk dengan akun Anda</p>
          </div>

          {/* Error Alert */}
          {errors.submit && <ErrorAlert message={errors.submit} />}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5 mt-6">
            {/* Username Input */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="Masukkan username"
                className={`h-12 ${errors.username ? "border-red-500 focus:border-red-500" : ""}`}
                disabled={isLoading}
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Input */}
            <PasswordInput
              id="password"
              value={formData.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={errors.password}
              showPassword={showPassword}
              onToggleVisibility={togglePasswordVisibility}
              disabled={isLoading}
            />

            {/* Remember Me / Forgot Password Row */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-blue focus:ring-blue"
                />
                <span className="text-gray-600">Ingat saya</span>
              </label>
              <button
                type="button"
                className="text-blue hover:text-blue-600 font-medium transition-colors"
                disabled={isLoading}
              >
                Lupa password?
              </button>
            </div>

            {/* Login Button */}
            <LoginButton isLoading={isLoading} />
          </form>

          {/* Footer Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500">
              Dengan masuk, Anda menyetujui{" "}
              <a href="#" className="text-blue hover:underline">
                Syarat & Ketentuan
              </a>{" "}
              dan{" "}
              <a href="#" className="text-blue hover:underline">
                Kebijakan Privasi
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Butuh bantuan?{" "}
            <a href="#" className="text-blue hover:underline font-medium">
              Hubungi Administrator
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
