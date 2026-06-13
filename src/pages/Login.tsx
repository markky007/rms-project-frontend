import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/providers/AuthContext";
import userService from "../services/userService";
import Card from "../components/composites/Card";
import Input from "../components/primitives/Input";
import Button from "../components/primitives/Button";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await userService.login(username, password);
      // Reactive login context update
      login(response.token, response.user);
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.error || "เข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <Card className="flex flex-col gap-6 w-full shadow-medium border border-border">
        {/* Logo/Title Section */}
        <div className="text-center flex flex-col items-center select-none">
          {/* Cobalt rounded building logo */}
          <div className="w-16 h-16 rounded-xl bg-primary flex items-center justify-center text-white mb-3 shadow-low border border-primary-active">
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="font-heading text-xl font-bold text-ink leading-tight">
            RMS Manager
          </h1>
          <p className="text-xs text-muted font-sans font-medium mt-1">
            ระบบจัดการบ้านเช่าสำหรับผู้ประกอบการ
          </p>
        </div>

        {/* Error message inline banner */}
        {error && (
          <div
            className="p-3 bg-error-light border border-error/25 text-error rounded-md text-xs font-sans font-medium animate-shake flex items-center gap-2"
            role="alert"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            required
            id="username"
            label="ชื่อผู้ใช้งาน"
            type="text"
            placeholder="กรอกชื่อผู้ใช้งานของคุณ"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
          />

          <Input
            required
            id="password"
            label="รหัสผ่าน"
            type="password"
            placeholder="กรอกรหัสผ่านของคุณ"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />

          {/* Remember me & Forget password */}
          <div className="flex items-center justify-between text-xs select-none mt-1">
            <label className="flex items-center gap-2 cursor-pointer text-muted hover:text-ink transition-colors font-sans">
              <input
                type="checkbox"
                className="w-4 h-4 text-primary border-border rounded focus:ring-primary/20 cursor-pointer"
              />
              <span>จดจำฉัน</span>
            </label>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-primary hover:text-primary-hover font-medium font-sans"
            >
              ลืมรหัสผ่าน?
            </a>
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            variant="primary"
            className="w-full mt-2"
          >
            เข้าสู่ระบบ
          </Button>
        </form>
      </Card>

      {/* Footer */}
      <div className="text-center select-none text-[10px] text-muted">
        <p>© {new Date().getFullYear()} RMS Manager. สงวนลิขสิทธิ์ทั้งหมด</p>
      </div>
    </div>
  );
}
