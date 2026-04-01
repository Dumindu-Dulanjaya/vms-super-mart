import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import vmsLogo from '../../assets/VMS logo.png';

const AdminLogin = () => {
  const { adminLogin, isAdminAuthenticated } = useAppContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAdminAuthenticated) {
        navigate('/admin/dashboard');
    }
  }, [isAdminAuthenticated, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Slight artificial delay to feel premium
    setTimeout(() => {
        const success = adminLogin(data.email, data.password);
        if (success) {
            navigate('/admin/dashboard');
        }
        setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative font-sans">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>

      <div className="w-full max-w-sm p-8 bg-black/60 backdrop-blur-3xl rounded-none border border-white/5 shadow-2xl space-y-8 relative z-10 transition-all duration-700 animate-in fade-in zoom-in slide-in-from-bottom-12">
        <div className="text-center space-y-6">
          <div className="relative inline-block group mb-2">
            <div className="absolute -inset-8 bg-green-400/10 rounded-full blur-3xl group-hover:bg-green-400/20 transition-all animate-pulse"></div>
            <div className="w-32 h-auto mx-auto relative group-hover:scale-110 transition-transform duration-500 py-2">
                 <img src={vmsLogo} alt="VMS Logo" className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(34,197,94,0.4)] brightness-125" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2 uppercase">
                <span className="text-green-400 italic">VMS</span> Admin
            </h1>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] opacity-80">Secure Personnel Gateway</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <label className="block text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-2 ml-1">Registry Credentials</label>
              <div className="absolute left-4 top-[38px] pointer-events-none transition-colors group-focus-within:text-green-400 text-slate-600">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email" 
                name="email"
                value={data.email}
                onChange={onChange}
                placeholder="admin@vms.com"
                className="w-full bg-white/[0.03] py-3 pl-11 pr-4 rounded-none border border-white/10 text-white font-bold text-sm tracking-wide focus:ring-1 focus:ring-green-500/50 outline-none transition-all placeholder:text-slate-800 hover:bg-white/[0.05]"
                required
              />
            </div>

            <div className="relative group">
              <label className="block text-[9px] font-black text-slate-500 tracking-[0.3em] uppercase mb-2 ml-1">Encryption Key</label>
              <div className="absolute left-4 top-[38px] pointer-events-none transition-colors group-focus-within:text-green-400 text-slate-600">
                <Lock className="w-4 h-4" />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password"
                value={data.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full bg-white/[0.03] py-3 pl-11 pr-12 rounded-none border border-white/10 text-white font-bold text-sm tracking-[0.4em] focus:ring-1 focus:ring-green-500/50 outline-none transition-all placeholder:text-slate-800 hover:bg-white/[0.05]"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-slate-600 hover:text-white transition-colors"
                tabIndex="-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-600 font-bold tracking-widest uppercase">Encryption Layer v2.4</span>
              <button type="button" className="text-[10px] text-indigo-400 font-bold hover:underline py-1">Forgot Key?</button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full group bg-green-500 hover:bg-green-400 text-white py-4 rounded-none font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
                <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
            ) : (
                <>
                    <UserCheck className="w-5 h-5" />
                    Authorize Access
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </>
            )}
          </button>
        </form>

        <p className="text-center text-[9px] text-slate-700 font-black tracking-widest uppercase py-2">
            Protected by VMS Secure-Link
        </p>

        <div className="text-center pt-2">
            <button 
                onClick={() => navigate('/login')}
                className="text-[10px] font-black tracking-[0.1em] uppercase text-slate-600 hover:text-white transition-colors"
            >
                [ Back to Portal ]
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
