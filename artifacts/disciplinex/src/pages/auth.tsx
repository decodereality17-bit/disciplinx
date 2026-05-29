import { useState } from "react";
import { Brain, Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, getAccount } from "@/lib/auth";

function hasExistingAccount(): boolean {
  return !!getAccount();
}

type FieldProps = {
  icon: React.ElementType;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  autoComplete?: string;
  trailing?: React.ReactNode;
};

function Field({ icon: Icon, type, placeholder, value, onChange, autoFocus, autoComplete, trailing }: FieldProps) {
  return (
    <div className="relative">
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        className="w-full rounded-2xl bg-input pl-10 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border transition"
      />
      {trailing && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{trailing}</div>
      )}
    </div>
  );
}

function ErrorBanner({ msg }: { msg: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/25 px-3 py-2.5 text-xs text-destructive">
      <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
      <span>{msg}</span>
    </div>
  );
}

export default function OnboardPage() {
  const auth = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">(() => hasExistingAccount() ? "signin" : "signup");

  // Sign In
  const [siEmail, setSiEmail] = useState("");
  const [siPassword, setSiPassword] = useState("");
  const [siError, setSiError] = useState("");
  const [siLoading, setSiLoading] = useState(false);
  const [showSiPw, setShowSiPw] = useState(false);

  // Sign Up
  const [suName, setSuName] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPassword, setSuPassword] = useState("");
  const [suConfirm, setSuConfirm] = useState("");
  const [suError, setSuError] = useState("");
  const [suLoading, setSuLoading] = useState(false);
  const [showSuPw, setShowSuPw] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setSiError("");
    if (!siEmail || !siPassword) { setSiError("Please fill in all fields."); return; }
    setSiLoading(true);
    try {
      await auth.signIn(siEmail, siPassword);
    } catch (err) {
      setSiError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setSiLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setSuError("");
    if (!suName.trim()) { setSuError("Please enter your name."); return; }
    if (!/\S+@\S+\.\S+/.test(suEmail)) { setSuError("Please enter a valid email address."); return; }
    if (suPassword.length < 6) { setSuError("Password must be at least 6 characters."); return; }
    if (suPassword !== suConfirm) { setSuError("Passwords don't match."); return; }
    setSuLoading(true);
    try {
      await auth.signUp(suName, suEmail, suPassword);
    } catch (err) {
      setSuError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setSuLoading(false);
    }
  }

  const pwToggle = (show: boolean, set: (v: boolean) => void) => (
    <button type="button" onClick={() => set(!show)} className="text-muted-foreground hover:text-foreground transition p-1">
      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-40 -right-40 size-[500px] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, hsl(258 52% 65%), transparent)" }} />
        <div className="absolute -bottom-40 -left-40 size-[400px] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, hsl(222 56% 65%), transparent)" }} />
        <div className="absolute top-1/3 left-1/4 size-[300px] rounded-full opacity-[0.03]" style={{ background: "radial-gradient(circle, hsl(258 52% 65%), transparent)" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm relative"
      >
        {/* Brand header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="size-16 rounded-3xl bg-gradient-primary grid place-items-center mx-auto mb-5 shadow-glow animate-pulse-glow"
          >
            <Brain className="size-8 text-white" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-gradient-primary"
          >
            DisciplineX
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground mt-2 text-sm"
          >
            Your discipline journey starts here.
          </motion.p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-3xl p-7 shadow-elevated"
        >
          {/* Tabs */}
          <div className="flex rounded-2xl bg-muted p-1 mb-6 gap-1">
            {(["signin", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setTab(t); setSiError(""); setSuError(""); }}
                className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
                  tab === t
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "signin" ? (
              <motion.form
                key="signin"
                onSubmit={handleSignIn}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {siError && <ErrorBanner msg={siError} />}
                <Field
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={siEmail}
                  onChange={setSiEmail}
                  autoFocus
                  autoComplete="email"
                />
                <Field
                  icon={Lock}
                  type={showSiPw ? "text" : "password"}
                  placeholder="Password"
                  value={siPassword}
                  onChange={setSiPassword}
                  autoComplete="current-password"
                  trailing={pwToggle(showSiPw, setShowSiPw)}
                />
                <button
                  type="submit"
                  disabled={siLoading}
                  className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {siLoading && <Loader2 className="size-4 animate-spin" />}
                  Sign In
                </button>
                <p className="text-center text-xs text-muted-foreground pt-1">
                  No account yet?{" "}
                  <button type="button" onClick={() => setTab("signup")} className="text-primary hover:underline font-medium">
                    Create one
                  </button>
                </p>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                onSubmit={handleSignUp}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18 }}
                className="space-y-3"
              >
                {suError && <ErrorBanner msg={suError} />}
                <Field
                  icon={User}
                  type="text"
                  placeholder="Your name"
                  value={suName}
                  onChange={setSuName}
                  autoFocus
                  autoComplete="name"
                />
                <Field
                  icon={Mail}
                  type="email"
                  placeholder="Email address"
                  value={suEmail}
                  onChange={setSuEmail}
                  autoComplete="email"
                />
                <Field
                  icon={Lock}
                  type={showSuPw ? "text" : "password"}
                  placeholder="Password (min 6 chars)"
                  value={suPassword}
                  onChange={setSuPassword}
                  autoComplete="new-password"
                  trailing={pwToggle(showSuPw, setShowSuPw)}
                />
                <Field
                  icon={Lock}
                  type={showSuPw ? "text" : "password"}
                  placeholder="Confirm password"
                  value={suConfirm}
                  onChange={setSuConfirm}
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  disabled={suLoading}
                  className="w-full rounded-2xl bg-gradient-primary py-3 text-sm font-semibold text-white shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {suLoading && <Loader2 className="size-4 animate-spin" />}
                  Create Account
                </button>
                {hasExistingAccount() && (
                  <p className="text-center text-xs text-muted-foreground pt-1">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setTab("signin")} className="text-primary hover:underline font-medium">
                      Sign in
                    </button>
                  </p>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-muted-foreground/50 mt-6"
        >
          All data stays on your device. Nothing is sent anywhere.
        </motion.p>
      </motion.div>
    </div>
  );
}
