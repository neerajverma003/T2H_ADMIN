import { User, Lock, Eye, EyeOff, ShieldCheck, RefreshCcw, ArrowLeft, KeyRound } from "lucide-react";
import { useState, useEffect } from "react";
import useAuthStore from "../../stores/authStores";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, verifyLoginOtp, resendLoginOtp, loading } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    username: "",
    password: "",
  });

  // MFA State
  const [mfaStep, setMfaStep] = useState(false); // false: Login | true: MFA Identify
  const [codeSent, setCodeSent] = useState(false); // false: "Send Code" screen | true: "Enter OTP" screen
  const [mfaAdminId, setMfaAdminId] = useState(null);
  const [mfaEmail, setMfaEmail] = useState("");
  const [rememberDevice, setRememberDevice] = useState(false); // Checkbox: "Don't ask again on this device for 14 days"
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);

  // Timer countdown for resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const maskEmail = (emailStr) => {
    if (!emailStr) return "a...n@example.com";
    const [name, domain] = emailStr.split("@");
    if (name.length <= 2) return `${name[0]}...@${domain}`;
    return `${name[0]}...${name[name.length - 1]}@${domain}`;
  };

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1: Submit Username & Password
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!data.username || !data.password) {
      toast.error("Username and password are required.");
      return;
    }

    const result = await login(data);

    if (result && result.mfaRequired) {
      setMfaStep(true);
      setMfaAdminId(result.adminId);
      setMfaEmail(result.email);
      setCodeSent(false);
    } else if (result && result.mfaRequired === false) {
      navigate("/");
    }
  };

  // Step 2: Click "Send Code" (Instant UI Transition)
  const handleSendCode = async () => {
    if (!mfaAdminId) return;
    setSendingCode(true);
    // Instant UI transition: show OTP input box immediately!
    setCodeSent(true);
    setResendTimer(60);
    try {
      await resendLoginOtp(mfaAdminId);
    } finally {
      setSendingCode(false);
    }
  };

  // Step 3: Submit Verification Code
  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    const success = await verifyLoginOtp(mfaAdminId, otpCode.trim(), rememberDevice);
    if (success) {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-sky-100 to-indigo-200 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 p-4 text-left font-sans">
      <div className="w-full max-w-md">
        {/* MAIN CARD CONTAINER */}
        <div className="rounded-3xl border border-blue-200/50 dark:border-blue-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 shadow-2xl">
          {!mfaStep ? (
            /* STEP 1: USERNAME & PASSWORD FORM */
            <>
              <h1 className="text-center text-3xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Welcome Back
              </h1>

              <p className="text-center text-sm text-slate-600 dark:text-slate-400 mb-6">
                Sign in to continue
              </p>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {/* Username */}
                <div>
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Username
                  </label>

                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />

                    <input
                      name="username"
                      value={data.username}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="admin"
                      className="w-full pl-10 py-2.5 rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Password
                  </label>

                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-blue-400" />

                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-400 outline-none transition"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-90 text-white py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 disabled:opacity-60 cursor-pointer"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </>
          ) : (
            /* STEP 2: MFA VERIFY IDENTITY FORM (BLUE ORIGINAL THEME) */
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="size-14 mx-auto rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Verify Your Identity
                </h2>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  Send a verification code to{" "}
                  <span className="font-extrabold text-blue-600 dark:text-blue-400">
                    {maskEmail(mfaEmail)}
                  </span>.
                </p>
              </div>

              {!codeSent ? (
                /* SCREEN A: SEND CODE BUTTON & 14-DAY CHECKBOX */
                <div className="space-y-6 pt-2">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={sendingCode}
                    className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-90 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {sendingCode ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" /> Sending Code...
                      </>
                    ) : (
                      "Send Code"
                    )}
                  </button>

                  {/* 14-DAY CHECKBOX */}
                  <label className="flex items-center gap-3 cursor-pointer pt-2 group select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="size-4.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition">
                      Don't ask again on this device for 14 days.
                    </span>
                  </label>
                </div>
              ) : (
                /* SCREEN B: ENTER 6-DIGIT OTP CODE */
                <form onSubmit={handleOtpSubmit} className="space-y-5 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-2 uppercase tracking-wider">
                      6-Digit Verification Code *
                    </label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-blue-500" />
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-blue-300/60 dark:border-blue-700 bg-white/70 dark:bg-slate-800 text-slate-800 dark:text-white font-extrabold text-lg tracking-widest outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition"
                        required
                      />
                    </div>
                  </div>

                  {/* 14-DAY CHECKBOX ON CODE SCREEN */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="size-4.5 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Don't ask again on this device for 14 days.
                    </span>
                  </label>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={sendingCode || resendTimer > 0}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 cursor-pointer"
                    >
                      {sendingCode ? "Sending..." : resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-600 hover:opacity-90 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCcw size={14} className="animate-spin" /> Verifying...
                        </>
                      ) : (
                        "Submit Code"
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMfaStep(false);
                    setCodeSent(false);
                  }}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
