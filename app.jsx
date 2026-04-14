import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const { useState, useEffect } = React;

// 🔥 APNA FIREBASE CONFIG YAHAN DAALO
const firebaseConfig = {
  apiKey: "AIzaSyAGwxz0kQQVlK3E57-kT9SkH3as8oTM_ZM",
  authDomain: "campus-flow-89b15.firebaseapp.com",
  projectId: "campus-flow-89b15",
  storageBucket: "campus-flow-89b15.firebasestorage.app",
  messagingSenderId: "435827865010",
  appId: "1:435827865010:web:a45bdc7c886b6d0a3de0ab",
  measurementId: "G-BTY2KL0V3T"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// ─────────────────────────────────────────────
// AUTH SCREEN (Login + Signup)
// ─────────────────────────────────────────────
const AuthScreen = () => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Signup state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  const friendlyError = (code) => {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential': return 'Email ya password galat hai.';
      case 'auth/email-already-in-use': return 'Yeh email pehle se registered hai.';
      case 'auth/weak-password': return 'Password kam se kam 6 characters ka hona chahiye.';
      case 'auth/invalid-email': return 'Valid email address daalo.';
      case 'auth/too-many-requests': return 'Bahut zyada attempts. Thodi der baad try karo.';
      default: return 'Kuch galat ho gaya. Dobara try karo.';
    }
  };

  const handleLogin = async () => {
    setLoginError('');
    if (!loginEmail || !loginPassword) { setLoginError('Email aur password dono required hain.'); return; }
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
    } catch (err) {
      setLoginError(friendlyError(err.code));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async () => {
    setSignupError('');
    if (!signupName.trim()) { setSignupError('Apna naam daalo.'); return; }
    if (!signupEmail) { setSignupError('Email daalo.'); return; }
    if (signupPassword.length < 6) { setSignupError('Password kam se kam 6 characters ka hona chahiye.'); return; }
    if (signupPassword !== signupConfirm) { setSignupError('Passwords match nahi kar rahe!'); return; }
    setSignupLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      await updateProfile(result.user, { displayName: signupName.trim() });
    } catch (err) {
      setSignupError(friendlyError(err.code));
    } finally {
      setSignupLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    marginBottom: '12px',
    fontFamily: 'Outfit, sans-serif',
    transition: 'border 0.2s'
  };

  const passWrapStyle = {
    position: 'relative',
    width: '100%',
    marginBottom: '12px'
  };

  const eyeStyle = {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '15px'
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--bg-color)'
    }}>
      {/* Logo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        fontSize: '26px', fontWeight: 800, marginBottom: '32px',
        fontFamily: 'Outfit, sans-serif'
      }}>
        <i className="fa-solid fa-graduation-cap" style={{color: 'var(--primary-earn)', fontSize: '30px'}}></i>
        <span>Campus Flow</span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '380px',
        background: 'var(--surface)',
        borderRadius: '20px',
        padding: '30px 24px',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Tab Switcher */}
        <div style={{
          display: 'flex', background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px', padding: '4px', marginBottom: '24px'
        }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setLoginError(''); setSignupError(''); }}
              style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: 'none', cursor: 'pointer', fontWeight: 600,
                fontSize: '14px', fontFamily: 'Outfit, sans-serif',
                transition: 'all 0.2s',
                background: mode === m
                  ? (m === 'login' ? 'var(--primary-finance)' : 'var(--primary-earn)')
                  : 'transparent',
                color: mode === m ? (m === 'login' ? '#000' : '#fff') : 'var(--text-secondary)'
              }}>
              {m === 'login' ? 'Login' : 'Create Account'}
            </button>
          ))}
        </div>

        {/* ── LOGIN FORM ── */}
        {mode === 'login' && (
          <div className="fade-in">
            <div style={{fontSize: '20px', fontWeight: 700, marginBottom: '6px'}}>Wapas aa gaye! 👋</div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px'}}>Apna account login karo</div>

            <input
              style={inputStyle} type="email" placeholder="Email Address"
              value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />

            <div style={passWrapStyle}>
              <input
                style={{...inputStyle, marginBottom: 0, paddingRight: '44px'}}
                type={showLoginPass ? 'text' : 'password'}
                placeholder="Password"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
              />
              <i
                className={`fa-solid ${showLoginPass ? 'fa-eye-slash' : 'fa-eye'}`}
                style={eyeStyle}
                onClick={() => setShowLoginPass(!showLoginPass)}
              ></i>
            </div>

            {loginError && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                color: '#ef4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <i className="fa-solid fa-circle-exclamation"></i> {loginError}
              </div>
            )}

            <button
              onClick={handleLogin} disabled={loginLoading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: loginLoading ? 'rgba(0,208,132,0.5)' : 'var(--primary-finance)',
                color: '#000', fontWeight: 700, fontSize: '15px', cursor: loginLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
              {loginLoading
                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Logging in...</>
                : <><i className="fa-solid fa-arrow-right-to-bracket"></i> Login</>}
            </button>

            <div style={{textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)'}}>
              Account nahi hai?{' '}
              <span style={{color: 'var(--primary-earn)', cursor: 'pointer', fontWeight: 600}}
                onClick={() => { setMode('signup'); setLoginError(''); }}>
                Account banao
              </span>
            </div>
          </div>
        )}

        {/* ── SIGNUP FORM ── */}
        {mode === 'signup' && (
          <div className="fade-in">
            <div style={{fontSize: '20px', fontWeight: 700, marginBottom: '6px'}}>Join Campus Flow 🚀</div>
            <div style={{fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px'}}>Free mein account banao</div>

            <input
              style={inputStyle} type="text" placeholder="Full Name"
              value={signupName} onChange={e => setSignupName(e.target.value)}
            />
            <input
              style={inputStyle} type="email" placeholder="College Email Address"
              value={signupEmail} onChange={e => setSignupEmail(e.target.value)}
            />

            <div style={passWrapStyle}>
              <input
                style={{...inputStyle, marginBottom: 0, paddingRight: '44px'}}
                type={showSignupPass ? 'text' : 'password'}
                placeholder="Password (min. 6 characters)"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
              />
              <i
                className={`fa-solid ${showSignupPass ? 'fa-eye-slash' : 'fa-eye'}`}
                style={eyeStyle}
                onClick={() => setShowSignupPass(!showSignupPass)}
              ></i>
            </div>

            <div style={passWrapStyle}>
              <input
                style={{...inputStyle, marginBottom: 0, paddingRight: '44px'}}
                type={showSignupConfirm ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={signupConfirm}
                onChange={e => setSignupConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSignup()}
              />
              <i
                className={`fa-solid ${showSignupConfirm ? 'fa-eye-slash' : 'fa-eye'}`}
                style={eyeStyle}
                onClick={() => setShowSignupConfirm(!showSignupConfirm)}
              ></i>
            </div>

            {/* Password match indicator */}
            {signupConfirm.length > 0 && (
              <div style={{
                fontSize: '12px', marginTop: '-6px', marginBottom: '10px',
                color: signupPassword === signupConfirm ? '#00d084' : '#ef4444',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                <i className={`fa-solid ${signupPassword === signupConfirm ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                {signupPassword === signupConfirm ? 'Passwords match kar rahe hain' : 'Passwords alag hain'}
              </div>
            )}

            {signupError && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '10px', padding: '10px 14px', fontSize: '13px',
                color: '#ef4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px'
              }}>
                <i className="fa-solid fa-circle-exclamation"></i> {signupError}
              </div>
            )}

            <button
              onClick={handleSignup} disabled={signupLoading}
              style={{
                width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                background: signupLoading ? 'rgba(139,92,246,0.5)' : 'var(--primary-earn)',
                color: '#fff', fontWeight: 700, fontSize: '15px', cursor: signupLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}>
              {signupLoading
                ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Account ban raha hai...</>
                : <><i className="fa-solid fa-user-plus"></i> Account Banao</>}
            </button>

            <div style={{textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)'}}>
              Pehle se account hai?{' '}
              <span style={{color: 'var(--primary-finance)', cursor: 'pointer', fontWeight: 600}}
                onClick={() => { setMode('login'); setSignupError(''); }}>
                Login karo
              </span>
            </div>
          </div>
        )}
      </div>

      <div style={{marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center'}}>
        Campus Flow • Students ke liye, students dwara
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
const App = () => {
  const [activeTab, setActiveTab] = useState('finance');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [earnView, setEarnView] = useState('select');

  // Profile State
  const [profileTab, setProfileTab] = useState('profile');
  const defaultUserData = {
    name: 'Alex Johnson',
    college: 'XYZ Institute of Technology',
    branch: 'Computer Science',
    year: '3rd Year',
    tags: ['Notes Making', 'Coding', 'PPT Design'],
    stats: { uploads: 24, workDone: 15, earned: 4500, spent: 2100 }
  };
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('cf_userData');
    if (saved) { try { return JSON.parse(saved); } catch(e){} }
    return defaultUserData;
  });

  useEffect(() => { localStorage.setItem('cf_userData', JSON.stringify(userData)); }, [userData]);

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
        if (firebaseUser.displayName) {
          setUserData(prev => ({ ...prev, name: firebaseUser.displayName }));
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [userAbout, setUserAbout] = useState({
    bio: 'Hi, I love building web apps and helping others learn coding.',
    goals: 'Earning side income & helping classmates',
    interests: 'Web Dev, AI, UI/UX Design',
    availability: 'Evenings & Weekends'
  });
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [userSkills, setUserSkills] = useState([
    { id: 1, title: 'Handwritten Notes', desc: 'High quality organized notes for CS core subjects.', price: '₹100/unit' },
    { id: 2, title: 'Web Template Design', desc: 'Custom HTML/CSS templates for your hackathon projects.', price: '₹500/project' }
  ]);
  const [connections, setConnections] = useState([
    { id: 1, name: 'Sarah Lee', type: 'Classmate', branch: 'Computer Science' },
    { id: 2, name: 'Mike Ross', type: 'Work Connection', branch: 'Design' },
    { id: 3, name: 'Emma Watson', type: 'Suggested', branch: 'AI/ML' }
  ]);
  const [newSkill, setNewSkill] = useState({ title: '', desc: '', price: '' });
  const [showAddSkill, setShowAddSkill] = useState(false);

  // Finance State
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('cf_balance');
    return saved !== null ? Number(saved) : 5000;
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('cf_expenses');
    if (saved) { try { return JSON.parse(saved); } catch(e){} }
    return [
      { id: 1, category: 'Food', amount: 350, date: new Date().toISOString() },
      { id: 2, category: 'Travel', amount: 120, date: new Date(Date.now() - 86400000*2).toISOString() },
      { id: 3, category: 'Others', amount: 80, date: new Date(Date.now() - 86400000*4).toISOString() }
    ];
  });
  useEffect(() => { localStorage.setItem('cf_balance', balance); }, [balance]);
  useEffect(() => { localStorage.setItem('cf_expenses', JSON.stringify(expenses)); }, [expenses]);

  const [savingGoal, setSavingGoal] = useState(() => {
    const saved = localStorage.getItem('cf_savingGoal');
    return saved !== null ? Number(saved) : 10000;
  });
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  useEffect(() => { localStorage.setItem('cf_savingGoal', savingGoal); }, [savingGoal]);

  const [customExpense, setCustomExpense] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [etcAmount, setEtcAmount] = useState('');
  const [showEtcInput, setShowEtcInput] = useState(false);
  const [chartFilter, setChartFilter] = useState(7);
  const [chartType, setChartType] = useState('circular');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalAmount, setModalAmount] = useState('');

  const defaultPresets = { Food: 100, Travel: 50, Tea: null, Stationary: null, Others: null };
  const [quickAddPresets, setQuickAddPresets] = useState(() => {
    const saved = localStorage.getItem('cf_quickAddPresets');
    if (saved) { try { return JSON.parse(saved); } catch(e){} }
    return defaultPresets;
  });
  useEffect(() => { localStorage.setItem('cf_quickAddPresets', JSON.stringify(quickAddPresets)); }, [quickAddPresets]);

  const handleQuickAddClick = (category, amount) => {
    if (amount) { addExpense(category, amount); } else { openModal(category); }
  };
  const handleSavePreset = (category, val) => setQuickAddPresets(prev => ({...prev, [category]: val}));
  const handleResetPreset = (category) => setQuickAddPresets(prev => ({...prev, [category]: defaultPresets[category]}));

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const avgDailySpend = totalSpent > 0 ? (totalSpent / 3).toFixed(0) : 0;
  const daysLeft = balance > 0 && avgDailySpend > 0 ? Math.floor(balance / avgDailySpend) : 0;
  const riskStatus = daysLeft > 14 ? 'safe' : 'risk';
  const riskMsg = daysLeft > 14 ? "You're on track!" : "Spending too high this week!";

  const categoryTotals = expenses.reduce((acc, exp) => { acc[exp.category] = (acc[exp.category] || 0) + exp.amount; return acc; }, {});
  let maxCategory = 'None', maxCategoryVal = 0;
  Object.keys(categoryTotals).forEach(cat => { if (categoryTotals[cat] > maxCategoryVal && cat !== 'Others') { maxCategoryVal = categoryTotals[cat]; maxCategory = cat; } });
  const maxCategoryPercentage = totalSpent > 0 ? ((maxCategoryVal / totalSpent) * 100).toFixed(0) : 0;
  const savingReductionPerDay = maxCategoryVal > 0 ? Math.ceil((maxCategoryVal * 0.2) / 7) : 0;
  const potentialMonthlySavings = savingReductionPerDay * 30;
  const tasksToRecover = Math.ceil(totalSpent / 400);

  const addExpense = (category, amount) => {
    if (balance - amount < 0) { alert("Insufficient Balance!"); return; }
    setBalance(prev => prev - amount);
    setExpenses(prev => [{ id: Date.now(), category, amount, date: new Date().toISOString() }, ...prev]);
  };

  const openModal = (category) => { setModalCategory(category); setModalAmount(''); setModalOpen(true); };
  const handleModalSubmit = () => { const amt = parseInt(modalAmount); if (!isNaN(amt) && amt > 0) { addExpense(modalCategory, amt); setModalOpen(false); } };
  const handleAddMoney = () => { const amt = parseInt(addMoneyAmount); if (!isNaN(amt) && amt > 0) { setBalance(prev => prev + amt); setAddMoneyAmount(''); setShowAddMoney(false); } };

  const chartData = Array.from({length: chartFilter}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((chartFilter - 1) - i));
    const dayLabel = chartFilter === 7 ? d.toLocaleDateString('en-US', {weekday: 'short'}) : d.getDate();
    const dayStart = new Date(d.setHours(0,0,0,0)).getTime();
    const dayEnd = new Date(d.setHours(23,59,59,999)).getTime();
    const dayTotal = expenses.filter(e => { const et = new Date(e.date).getTime(); return et >= dayStart && et <= dayEnd; }).reduce((sum, e) => sum + e.amount, 0);
    return { label: dayLabel, amount: dayTotal, isToday: i === (chartFilter - 1) };
  });
  const maxChartAmt = Math.max(...chartData.map(d => d.amount), 100);

  const periodTotal = expenses.filter(e => {
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - chartFilter);
    return new Date(e.date).getTime() >= cutoff.getTime();
  }).reduce((acc, exp) => acc + exp.amount, 0);
  const budget = balance + periodTotal;
  const progressPercent = budget > 0 ? ((periodTotal / budget) * 100).toFixed(0) : 0;
  const getCircularGradient = () => `conic-gradient(var(--primary-finance) ${progressPercent}%, rgba(255,255,255,0.1) ${progressPercent}%)`;

  const navigateTo = (tab) => { setActiveTab(tab); if(tab === 'earn') setEarnView('select'); };

  const handleLogout = async () => {
    if (window.confirm("Logout karna chahte ho?")) {
      try { await signOut(auth); setActiveTab('finance'); } catch (error) { console.error("Logout error", error); }
    }
  };

  // Loading screen
  if (authLoading) {
    return (
      <div style={{minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)'}}>
        <div style={{textAlign: 'center'}}>
          <i className="fa-solid fa-graduation-cap" style={{fontSize: '40px', color: 'var(--primary-earn)', marginBottom: '16px', display: 'block'}}></i>
          <div style={{color: 'var(--text-secondary)', fontSize: '14px'}}>Loading Campus Flow...</div>
        </div>
      </div>
    );
  }

  // Not logged in → show auth screen
  if (!isLoggedIn) return <AuthScreen />;

  // ── MAIN APP UI ──
  return (
    <div className="container app-container fade-in">
      {/* Header */}
      <div className="app-header">
        <div className="app-logo">
          <i className="fa-solid fa-graduation-cap"></i>
          <span>Campus Flow</span>
        </div>
        <div className="user-avatar" style={{position: 'relative', cursor: 'pointer'}} onClick={() => setShowNotifications(!showNotifications)}>
          <i className="fa-regular fa-bell"></i>
          {notifications.length > 0 && (
            <span style={{position: 'absolute', top: '0px', right: '0px', width: '8px', height: '8px', background: 'var(--danger, #ef4444)', borderRadius: '50%'}}></span>
          )}
          {showNotifications && (
            <>
              <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90, cursor: 'default'}} onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}></div>
              <div className="fade-in" style={{position: 'absolute', top: '50px', right: '-10px', width: '280px', zIndex: 100, padding: '15px', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', cursor: 'default', display: 'flex', flexDirection: 'column'}} onClick={(e) => e.stopPropagation()}>
                <div style={{fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', fontSize: '15px'}}>Notifications</div>
                {notifications.length === 0 ? (
                  <div style={{color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '25px 0'}}>No notifications yet</div>
                ) : (
                  <div style={{maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', marginTop: '5px'}}>
                    {notifications.map(n => (
                      <div key={n.id} style={{fontSize: '13px', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', color: 'var(--text-primary)'}}>{n.message}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Pages */}
      {activeTab === 'home' && (
        <div className="home-view fade-in">
          <div className="title">Welcome back, {userData.name.split(' ')[0]}! 👋</div>
          <div className="subtitle">What would you like to do today?</div>
          <div className="home-grid">
            <div className="card finance-theme" onClick={() => navigateTo('finance')}>
              <div className="card-header"><div className="card-icon"><i className="fa-solid fa-wallet"></i></div><div className="card-title">Finance Tracker</div></div>
              <div className="card-desc">Track expenses and manage your money smartly to survive the month.</div>
              <button className="btn btn-outline" style={{borderColor: "rgba(0, 208, 132, 0.3)"}}>Get Started</button>
            </div>
            <div className="card earn-theme" onClick={() => navigateTo('earn')}>
              <div className="card-header"><div className="card-icon"><i className="fa-solid fa-bolt"></i></div><div className="card-title">Earn & Learn</div></div>
              <div className="card-desc">Earn money using your skills or hire peers to help you learn and build.</div>
              <button className="btn btn-outline" style={{borderColor: "rgba(139, 92, 246, 0.3)"}}>Explore</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="finance-view fade-in">
          <div className="title">Finance Tracker</div>
          <div className="balance-display">
            <div className="subtitle">Total Balance</div>
            <div className="balance-row">
              <div className="balance-amount">₹{balance.toLocaleString()}</div>
              {!showAddMoney && (
                <button className="btn btn-outline" style={{padding: "10px 20px", width: "auto", fontSize: "14px", borderRadius: "25px", border: "1px solid var(--primary-finance)"}} onClick={() => setShowAddMoney(true)}>
                  <i className="fa-solid fa-plus"></i> Add Money
                </button>
              )}
            </div>
            <div className={`survival-badge ${riskStatus === 'safe' ? 'badge-safe' : 'badge-risk'}`}>
              <i className={`fa-solid ${riskStatus === 'safe' ? 'fa-shield-check' : 'fa-triangle-exclamation'}`}></i>
              {riskMsg} ({daysLeft} Survival Days Left)
            </div>
            {showAddMoney && (
              <div className="add-money-container fade-in">
                <input type="number" className="input-field" placeholder="Amount (₹)..." value={addMoneyAmount} onChange={(e) => setAddMoneyAmount(e.target.value)} />
                <button className="btn-add" style={{padding: "10px 20px"}} onClick={handleAddMoney}>Add</button>
                <button className="btn-outline" style={{padding: "10px", borderRadius: "12px", border: "none", width: "auto"}} onClick={() => setShowAddMoney(false)}><i className="fa-solid fa-xmark"></i></button>
              </div>
            )}
          </div>

          <div className="finance-dashboard">
            <div className="finance-left">
              <div className="section-title chart-header">
                <span>Spending Analyzer</span>
                <div className="chart-controls">
                  <select className="chart-select" value={chartFilter} onChange={e => setChartFilter(Number(e.target.value))}>
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                  </select>
                  <div className="chart-type-toggle">
                    <i className={`fa-solid fa-chart-simple ${chartType==='bar'?'active':''}`} onClick={()=>setChartType('bar')}></i>
                    <i className={`fa-solid fa-chart-line ${chartType==='line'?'active':''}`} onClick={()=>setChartType('line')}></i>
                    <i className={`fa-solid fa-circle-notch ${chartType==='circular'?'active':''}`} onClick={()=>setChartType('circular')}></i>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {chartType === 'bar' && chartData.map((data, idx) => (
                  <div className="chart-bar-wrapper" key={idx}>
                    <div className={`chart-bar ${data.isToday ? 'today' : ''}`} style={{height: `${(data.amount / maxChartAmt) * 100}%`}}></div>
                    {chartFilter === 7 && <div className="chart-label">{String(data.label)[0]}</div>}
                  </div>
                ))}
                {chartType === 'line' && (
                  <div style={{width: '100%', height: '100%', display: 'flex', flexDirection: 'column'}}>
                    <svg className="line-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline fill="none" stroke="var(--primary-finance)" strokeWidth="2"
                        points={chartData.map((d, i) => `${(i / (chartFilter-1)) * 100},${100 - ((d.amount / maxChartAmt) * 100)}`).join(' ')} />
                    </svg>
                    <div style={{display:'flex', justifyContent:'space-between', padding: '0 5px'}}>
                      <span className="chart-label">{chartData[0].label}</span>
                      <span className="chart-label">{chartData[chartData.length-1].label}</span>
                    </div>
                  </div>
                )}
                {chartType === 'circular' && (
                  <div style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <div className="circular-chart" style={{background: getCircularGradient()}}>
                      <div className="circular-inner"><span>{progressPercent}%</span><small>Spent</small></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="section-title">Quick Add Expense</div>
              <div className="scroll-container">
                <QuickAddCard category="Food" icon="fa-burger" defaultAmount={100} presetAmount={quickAddPresets.Food} onAdd={handleQuickAddClick} onSavePreset={handleSavePreset} onResetPreset={handleResetPreset} />
                <QuickAddCard category="Travel" icon="fa-bus" defaultAmount={50} presetAmount={quickAddPresets.Travel} onAdd={handleQuickAddClick} onSavePreset={handleSavePreset} onResetPreset={handleResetPreset} />
                <QuickAddCard category="Tea" icon="fa-mug-hot" defaultAmount={null} presetAmount={quickAddPresets.Tea} onAdd={handleQuickAddClick} onSavePreset={handleSavePreset} onResetPreset={handleResetPreset} />
                <QuickAddCard category="Stationary" icon="fa-pen" defaultAmount={null} presetAmount={quickAddPresets.Stationary} onAdd={handleQuickAddClick} onSavePreset={handleSavePreset} onResetPreset={handleResetPreset} />
                <QuickAddCard category="Others" icon="fa-ellipsis" defaultAmount={null} presetAmount={quickAddPresets.Others} onAdd={handleQuickAddClick} onSavePreset={handleSavePreset} onResetPreset={handleResetPreset} />
              </div>

              <div className="section-title" style={{marginTop: "30px"}}>Insights for You</div>
              <div className="insights-grid">
                {maxCategoryVal > 0 && (
                  <InsightCard icon="fa-lightbulb" iconColor="#f59e0b" title="Spending Insight" desc={`You spent ₹${maxCategoryVal} on ${maxCategory} this week (${maxCategoryPercentage}% of total).`} />
                )}
                <InsightCard icon="fa-triangle-exclamation" iconColor={riskStatus === 'safe' ? 'var(--primary-finance)' : 'var(--danger)'} title="Budget Warning" desc={daysLeft > 14 ? `You are on track! (${daysLeft} days safe limit left)` : `You are close to your weekly budget limit! Decrease average daily spend to safely stretch your ₹${balance}.`} />
                {maxCategoryVal > 0 && savingReductionPerDay > 0 && (
                  <InsightCard icon="fa-coins" iconColor="#10b981" title="Smart Saving Suggestion" desc={`Reduce ${maxCategory} spending by ₹${savingReductionPerDay}/day to save ₹${potentialMonthlySavings}/month.`} />
                )}
                {totalSpent > 0 && (
                  <InsightCard icon="fa-bullseye" iconColor="var(--primary-earn)" title="Earn Suggestion" desc={`You spent ₹${totalSpent}. You can completely recover this by completing ${tasksToRecover} small tasks.`} />
                )}
                <InsightCard className="full-width" icon="fa-chart-pie" iconColor="#3b82f6" title="Weekly Summary" desc={`This week you spent ₹${totalSpent} and retained ₹${balance}.`} />
              </div>
            </div>

            <div className="finance-right">
              <div className="section-title">Overview</div>
              <div className="grid-2">
                <div className="stat-box">
                  <span className="subtitle" style={{fontSize: "12px", marginBottom: "0"}}>Spent This Week</span>
                  <span className="stat-val" style={{color: "var(--danger)"}}>₹{totalSpent}</span>
                </div>
                <div className="stat-box">
                  <span className="subtitle" style={{fontSize: "12px", marginBottom: "0"}}>Avg Daily Spend</span>
                  <span className="stat-val">₹{avgDailySpend}</span>
                </div>
              </div>

              <div className="section-title" style={{marginTop: "20px", display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <span>Saving Goal</span>
                {!isEditingGoal && <i className="fa-solid fa-pen" style={{fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px'}} onClick={() => {setIsEditingGoal(true); setGoalInput(savingGoal);}}></i>}
              </div>
              <div className="stat-box" style={{marginBottom: "20px"}}>
                {isEditingGoal ? (
                  <div style={{display: 'flex', gap: '10px'}}>
                    <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} className="input-field" style={{padding: '8px', fontSize: '14px', flex: 1}} autoFocus />
                    <button className="btn-add" style={{padding: '8px 15px', fontSize: '13px'}} onClick={() => {setSavingGoal(Number(goalInput)||0); setIsEditingGoal(false);}}>Save</button>
                  </div>
                ) : (
                  <>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px'}}>
                      <span style={{color: 'var(--text-secondary)'}}>Progress to ₹{savingGoal}</span>
                      <span style={{fontWeight: 600}}>{savingGoal > 0 ? Math.min(100, ((balance / savingGoal) * 100)).toFixed(0) : 0}%</span>
                    </div>
                    <div className="progress-bg" style={{height: '8px', marginTop: 0}}>
                      <div className="progress-fill" style={{background: 'var(--primary-finance)', width: `${savingGoal > 0 ? Math.min(100, (balance / savingGoal) * 100) : 0}%`}}></div>
                    </div>
                  </>
                )}
              </div>

              <div className="section-title">Spending Categories</div>
              <div className="categories-list">
                <CategoryItem icon="fa-burger" name="Food" color="#f59e0b" amount={expenses.filter(e=>e.category==='Food').reduce((a,b)=>a+b.amount,0)} total={totalSpent}/>
                <CategoryItem icon="fa-bus" name="Travel" color="#3b82f6" amount={expenses.filter(e=>e.category==='Travel').reduce((a,b)=>a+b.amount,0)} total={totalSpent}/>
                <CategoryItem icon="fa-box" name="Others" color="#8b5cf6" amount={expenses.filter(e=>e.category==='Others').reduce((a,b)=>a+b.amount,0)} total={totalSpent}/>
                <CategoryItem icon="fa-pen" name="Stationary" color="#00d084" amount={expenses.filter(e=>e.category==='Stationary').reduce((a,b)=>a+b.amount,0)} total={totalSpent}/>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'earn' && (
        <div className="earn-view fade-in">
          {earnView === 'select' && (
            <div className="fade-in">
              <div className="title">Earn & Learn</div>
              <div className="subtitle">Connect with peers to exchange skills, get guided help, or earn money honestly.</div>
              <div className="home-grid">
                <div className="role-card provider" onClick={() => setEarnView('work')}>
                  <div className="role-icon"><i className="fa-solid fa-hand-holding-dollar"></i></div>
                  <div className="role-title">I Want to Work</div>
                  <div className="role-desc">Earn money by selling notes, teaching skills, or helping others.</div>
                </div>
                <div className="role-card consumer" onClick={() => setEarnView('help')}>
                  <div className="role-icon"><i className="fa-solid fa-people-group"></i></div>
                  <div className="role-title">I Want Help</div>
                  <div className="role-desc">Hire peers to learn concepts, buy notes, or get project guidance.</div>
                </div>
              </div>
            </div>
          )}
          {earnView === 'work' && (
            <div className="fade-in">
              <div className="back-btn" onClick={() => setEarnView('select')}><i className="fa-solid fa-arrow-left"></i> Back to Roles</div>
              <div className="title" style={{color: "var(--primary-earn)"}}>Offer Your Skills</div>
              <div className="subtitle">Create listings for your areas of expertise.</div>
              <div className="disclaimer">
                <i className="fa-solid fa-circle-info"></i>
                <div><strong>Platform Rule:</strong> This platform promotes learning. We do not allow full assignment writing services. Offer guidance only.</div>
              </div>
              <div className="scroll-container">
                <ServiceBox icon="fa-book-open" title="Sell Notes" />
                <ServiceBox icon="fa-chalkboard-user" title="Teach Skills" />
                <ServiceBox icon="fa-code" title="Hackathon Help" />
                <ServiceBox icon="fa-lightbulb" title="Project Guidance" />
                <ServiceBox icon="fa-clipboard-question" title="Doubt Solving" />
                <ServiceBox icon="fa-file-lines" title="Templates" />
                <ServiceBox icon="fa-pen-nib" title="Design Work" />
              </div>
            </div>
          )}
          {earnView === 'help' && (
            <div className="fade-in">
              <div className="back-btn" onClick={() => setEarnView('select')}><i className="fa-solid fa-arrow-left"></i> Back to Roles</div>
              <div className="title" style={{color: "#3b82f6"}}>Find Help</div>
              <div className="subtitle">Hire skilled students from your campus.</div>
              <div className="disclaimer">
                <i className="fa-solid fa-circle-info"></i>
                <div><strong>Platform Rule:</strong> Providers can only guide or tutor you. You must complete your own assignments.</div>
              </div>
              <div className="scroll-container">
                <ServiceBox icon="fa-book-open" title="Buy Notes" />
                <ServiceBox icon="fa-graduation-cap" title="Learn Concepts" />
                <ServiceBox icon="fa-lightbulb" title="Project Guidance" />
                <ServiceBox icon="fa-clipboard-question" title="Doubt Solving" />
                <ServiceBox icon="fa-file-lines" title="Templates" />
                <ServiceBox icon="fa-pen-nib" title="Design Help" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
        <ProfileView
          profileTab={profileTab} setProfileTab={setProfileTab}
          userData={userData} setUserData={setUserData}
          userAbout={userAbout} setUserAbout={setUserAbout}
          isEditingAbout={isEditingAbout} setIsEditingAbout={setIsEditingAbout}
          userSkills={userSkills} setUserSkills={setUserSkills}
          connections={connections} setConnections={setConnections}
          newSkill={newSkill} setNewSkill={setNewSkill}
          showAddSkill={showAddSkill} setShowAddSkill={setShowAddSkill}
          expenses={expenses}
          onLogout={handleLogout}
          firebaseUser={user}
        />
      )}

      {activeTab === 'messages' && (
        <div className="messages-view fade-in">
          <div className="title">Messages</div>
          <div className="subtitle">No new messages.</div>
        </div>
      )}

      {/* Amount Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-title">Enter Amount for {modalCategory}</div>
            <input type="number" className="input-field" placeholder="Amount (₹)..." autoFocus value={modalAmount} onChange={e => setModalAmount(e.target.value)} />
            <div style={{display: 'flex', gap: '10px'}}>
              <button className="btn btn-finance" onClick={handleModalSubmit}>Add Expense</button>
              <button className="btn btn-outline" style={{flex: 0.5}} onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="main-nav">
        <div className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => navigateTo('finance')}>
          <i className="fa-solid fa-wallet"></i><span>Finance</span>
        </div>
        <div className={`nav-item ${activeTab === 'earn' ? 'active' : ''}`} onClick={() => navigateTo('earn')}>
          <i className="fa-solid fa-briefcase"></i><span>Earn</span>
        </div>
        <div className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => navigateTo('messages')}>
          <i className="fa-solid fa-envelope"></i><span>Messages</span>
        </div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigateTo('profile')}>
          <i className="fa-solid fa-user"></i><span>Profile</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
const CategoryItem = ({ icon, name, color, amount, total }) => {
  const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
  return (
    <div className="cat-item">
      <div className="cat-info">
        <div className="cat-icon" style={{color: color, background: `${color}20`}}><i className={`fa-solid ${icon}`}></i></div>
        <div className="cat-details">
          <div className="cat-name">{name}</div>
          <div className="progress-bg" style={{width: "120px"}}>
            <div className="progress-fill" style={{background: color, width: `${percent}%`}}></div>
          </div>
        </div>
      </div>
      <div className="cat-amount">₹{amount}</div>
    </div>
  );
};

const ServiceBox = ({ icon, title }) => (
  <div className="service-card">
    <div className="service-icon"><i className={`fa-solid ${icon}`}></i></div>
    <div className="service-title">{title}</div>
  </div>
);

const QuickAddCard = ({ category, icon, defaultAmount, presetAmount, onAdd, onSavePreset, onResetPreset }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editVal, setEditVal] = useState(presetAmount || defaultAmount || '');
  const displayAmount = presetAmount || defaultAmount;

  const handleActionClick = (e) => {
    if (isEditing) return;
    if (displayAmount) { onAdd(category, displayAmount); } else { setIsEditing(true); }
  };
  const save = (e) => {
    e.stopPropagation();
    const val = parseInt(editVal);
    if (!isNaN(val) && val > 0) { onSavePreset(category, val); }
    setIsEditing(false);
  };
  const reset = (e) => {
    e.stopPropagation();
    onResetPreset(category);
    setIsEditing(false);
    setEditVal(defaultAmount || '');
  };
  return (
    <div className="quick-btn" style={{position: 'relative'}} onClick={handleActionClick}>
      {!isEditing && (
        <div style={{position: 'absolute', top: '5px', right: '5px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', opacity: 0.7}} onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditVal(presetAmount || defaultAmount || ''); }}>
          <i className="fa-solid fa-pen" style={{fontSize: '11px'}}></i>
        </div>
      )}
      {isEditing ? (
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center'}} onClick={e => e.stopPropagation()}>
          <span style={{fontSize: '12px', fontWeight: 'bold'}}>{category}</span>
          <input type="number" placeholder="Amount" value={editVal} onChange={e => setEditVal(e.target.value)} style={{width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--primary-finance)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontSize: '13px'}} autoFocus />
          <div style={{display: 'flex', gap: '4px', width: '100%'}}>
            <button onClick={save} style={{flex: 1, padding: '6px', fontSize: '11px', background: 'var(--primary-finance)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer'}}>Save</button>
            <button onClick={reset} style={{padding: '6px 8px', fontSize: '11px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-secondary)', borderRadius: '4px', cursor: 'pointer'}} title="Reset">✕</button>
          </div>
        </div>
      ) : (
        <>
          <i className={`fa-solid ${icon}`}></i>
          <span>{category}</span>
          <strong>{displayAmount ? `₹${displayAmount}` : 'Set Amount'}</strong>
        </>
      )}
    </div>
  );
};

const InsightCard = ({ icon, iconColor, title, desc, className = '' }) => (
  <div className={`card insight-card ${className}`} style={{borderLeft: `4px solid ${iconColor}`}}>
    <div className="cat-icon" style={{color: iconColor}}><i className={`fa-solid ${icon}`}></i></div>
    <div className="insight-content">
      <div className="insight-title">{title}</div>
      <div className="insight-desc">{desc}</div>
    </div>
  </div>
);

const ProfileView = ({
  profileTab, setProfileTab, userData, setUserData, userAbout, setUserAbout,
  isEditingAbout, setIsEditingAbout, userSkills, setUserSkills, connections,
  newSkill, setNewSkill, showAddSkill, setShowAddSkill, expenses, onLogout, firebaseUser
}) => {
  const tabs = ['profile', 'about', 'skills', 'history', 'connections', 'security'];
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState(userData);
  const [editTagsStr, setEditTagsStr] = useState(userData.tags.join(', '));

  const startEditingProfile = () => { setEditForm(userData); setEditTagsStr(userData.tags.join(', ')); setIsEditingProfile(true); };
  const saveProfile = () => {
    setUserData({ ...editForm, tags: editTagsStr.split(',').map(t => t.trim()).filter(t => t !== '') });
    setIsEditingProfile(false);
  };
  const handleAddSkill = () => {
    if(newSkill.title && newSkill.desc) {
      setUserSkills([...userSkills, { id: Date.now(), ...newSkill }]);
      setNewSkill({ title: '', desc: '', price: '' });
      setShowAddSkill(false);
    }
  };

  return (
    <div className="profile-system fade-in">
      <div className="profile-tabs scroll-container">
        {tabs.map(t => (
          <div key={t} className={`profile-tab ${profileTab === t ? 'active' : ''}`} onClick={() => setProfileTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </div>
        ))}
      </div>

      <div className="profile-content">
        {profileTab === 'profile' && (
          <div className="fade-in">
            {isEditingProfile ? (
              <div className="profile-hero card fade-in">
                <div className="card-title" style={{marginBottom: '15px', fontSize: '18px'}}>Edit Profile</div>
                <input className="input-field" placeholder="Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={{marginBottom: '10px'}} />
                <input className="input-field" placeholder="College Name" value={editForm.college} onChange={e => setEditForm({...editForm, college: e.target.value})} style={{marginBottom: '10px'}} />
                <input className="input-field" placeholder="Branch" value={editForm.branch} onChange={e => setEditForm({...editForm, branch: e.target.value})} style={{marginBottom: '10px'}} />
                <input className="input-field" placeholder="Year" value={editForm.year} onChange={e => setEditForm({...editForm, year: e.target.value})} style={{marginBottom: '10px'}} />
                <input className="input-field" placeholder="Skills (comma separated)" value={editTagsStr} onChange={e => setEditTagsStr(e.target.value)} style={{marginBottom: '15px'}} />
                <div style={{display: 'flex', gap: '10px'}}>
                  <button className="btn btn-finance" onClick={saveProfile}>Save Changes</button>
                  <button className="btn btn-outline" style={{flex: 0.5}} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-hero card">
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div className="hero-top">
                    <div className="hero-avatar"><i className="fa-solid fa-user"></i></div>
                    <div className="hero-info">
                      <h2>{userData.name}</h2>
                      <p className="subtitle">{userData.college}</p>
                      <p className="subtitle" style={{marginBottom:0}}>{userData.branch} • {userData.year}</p>
                      {firebaseUser?.email && <p style={{fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px'}}>{firebaseUser.email}</p>}
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{width:'auto', padding:'6px 12px', fontSize:'12px'}} onClick={startEditingProfile}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                </div>
                <div className="hero-tags" style={{marginTop:'15px'}}>
                  {userData.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            )}

            <div className="section-title">Quick Stats</div>
            <div className="stats-grid">
              <div className="stat-card"><i className="fa-solid fa-file-pdf"></i><div className="stat-details"><span className="stat-num">{userData.stats.uploads}</span><span className="stat-label">Notes Uploaded</span></div></div>
              <div className="stat-card"><i className="fa-solid fa-check-circle"></i><div className="stat-details"><span className="stat-num">{userData.stats.workDone}</span><span className="stat-label">Work Done</span></div></div>
              <div className="stat-card earn-theme"><i className="fa-solid fa-hand-holding-dollar"></i><div className="stat-details"><span className="stat-num">₹{userData.stats.earned}</span><span className="stat-label">Total Earned</span></div></div>
              <div className="stat-card finance-theme"><i className="fa-solid fa-wallet"></i><div className="stat-details"><span className="stat-num">₹{userData.stats.spent}</span><span className="stat-label">Total Spent</span></div></div>
            </div>
          </div>
        )}

        {profileTab === 'about' && (
          <div className="fade-in">
            <div className="card about-card">
              <div className="card-header" style={{justifyContent:'space-between'}}>
                <div className="card-title">About Me</div>
                <div className="edit-btn" onClick={() => setIsEditingAbout(!isEditingAbout)}>
                  <i className={`fa-solid ${isEditingAbout ? 'fa-check' : 'fa-pen'}`}></i>
                </div>
              </div>
              {!isEditingAbout ? (
                <div className="about-display">
                  <div className="about-item"><div className="about-label">Bio</div><div className="about-val">{userAbout.bio}</div></div>
                  <div className="about-item"><div className="about-label">Goals</div><div className="about-val">{userAbout.goals}</div></div>
                  <div className="about-item"><div className="about-label">Subjects of Interest</div><div className="about-val">{userAbout.interests}</div></div>
                  <div className="about-item"><div className="about-label">Availability</div><div className="about-val">{userAbout.availability}</div></div>
                </div>
              ) : (
                <div className="about-edit fade-in">
                  <div className="about-item"><div className="about-label">Bio</div><textarea className="input-field" value={userAbout.bio} onChange={e => setUserAbout({...userAbout, bio: e.target.value})} rows="3"></textarea></div>
                  <div className="about-item"><div className="about-label">Goals</div><input className="input-field" value={userAbout.goals} onChange={e => setUserAbout({...userAbout, goals: e.target.value})} /></div>
                  <div className="about-item"><div className="about-label">Subjects of Interest</div><input className="input-field" value={userAbout.interests} onChange={e => setUserAbout({...userAbout, interests: e.target.value})} /></div>
                  <div className="about-item"><div className="about-label">Availability</div><input className="input-field" value={userAbout.availability} onChange={e => setUserAbout({...userAbout, availability: e.target.value})} /></div>
                </div>
              )}
            </div>
          </div>
        )}

        {profileTab === 'skills' && (
          <div className="fade-in">
            <div className="card-header" style={{justifyContent: 'space-between', marginBottom: '15px'}}>
              <div className="section-title" style={{margin:0}}>My Skills & Services</div>
              <button className="btn btn-outline" style={{width:'auto', padding:'8px 16px', fontSize:'14px'}} onClick={() => setShowAddSkill(!showAddSkill)}>
                <i className="fa-solid fa-plus"></i> Add
              </button>
            </div>
            {showAddSkill && (
              <div className="card add-skill-form fade-in" style={{marginBottom: '20px', marginTop: '15px'}}>
                <div className="card-title" style={{marginBottom:'15px', fontSize:'16px'}}>Add New Skill</div>
                <input className="input-field mb" placeholder="Skill Title" value={newSkill.title} onChange={e => setNewSkill({...newSkill, title: e.target.value})} style={{marginBottom: '10px'}} />
                <textarea className="input-field mb" placeholder="Description" rows="2" value={newSkill.desc} onChange={e => setNewSkill({...newSkill, desc: e.target.value})} style={{marginBottom: '10px'}}></textarea>
                <input className="input-field mb" placeholder="Price (Optional)" value={newSkill.price} onChange={e => setNewSkill({...newSkill, price: e.target.value})} style={{marginBottom: '15px'}} />
                <button className="btn btn-finance" onClick={handleAddSkill}>Save Skill</button>
              </div>
            )}
            <div className="skills-grid" style={{marginTop:'15px'}}>
              {userSkills.map(skill => (
                <div key={skill.id} className="card skill-card">
                  <div className="skill-title">{skill.title}</div>
                  <div className="skill-price">{skill.price || 'Free / Negotiable'}</div>
                  <div className="skill-desc">{skill.desc}</div>
                  <div className="skill-action"><span className="sample-link"><i className="fa-solid fa-link"></i> Sample Attached</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileTab === 'history' && (
          <div className="fade-in history-view">
            <div className="section-title" style={{marginTop:0}}>Work Done</div>
            <div className="history-list">
              <div className="history-item">
                <div className="hi-left"><div className="hi-title">UI Design Mockup</div><div className="hi-sub">Client: Mike Ross • Mar 20, 2026</div></div>
                <div className="hi-right"><span className="status-badge success">Completed</span></div>
              </div>
            </div>
            <div className="section-title">Work Taken</div>
            <div className="history-list">
              <div className="history-item">
                <div className="hi-left"><div className="hi-title">Algorithms Tutoring</div><div className="hi-sub">Provider: Sarah Lee • Mar 25, 2026</div></div>
                <div className="hi-right"><span className="status-badge success">Completed</span><div className="hi-cost">₹300</div></div>
              </div>
            </div>
            <div className="section-title">Expense History</div>
            <div className="history-list">
              {expenses.slice(0,3).map(exp => (
                <div key={exp.id} className="history-item">
                  <div className="hi-left"><div className="hi-title">{exp.category}</div><div className="hi-sub">{new Date(exp.date).toLocaleDateString()}</div></div>
                  <div className="hi-right" style={{color: 'var(--danger)', fontWeight:'bold'}}>-₹{exp.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileTab === 'connections' && (
          <div className="fade-in connections-view">
            <div className="search-bar" style={{marginBottom:'20px', position:'relative'}}>
              <i className="fa-solid fa-search" style={{position:'absolute', left:'15px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)'}}></i>
              <input type="text" className="input-field" placeholder="Search collegemates, skills..." style={{paddingLeft:'40px'}} />
            </div>
            <div className="section-title">My Network</div>
            <div className="connections-list">
              {connections.map(conn => (
                <div key={conn.id} className="connection-card card" style={{flexDirection:'row', alignItems:'center', padding:'15px', gap:'15px', marginBottom:'10px'}}>
                  <div className="conn-avatar" style={{width:'40px', height:'40px', borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center'}}><i className="fa-solid fa-user"></i></div>
                  <div className="conn-info" style={{flex:1}}>
                    <div className="conn-name" style={{fontWeight:600}}>{conn.name}</div>
                    <div className="conn-sub" style={{color:'var(--text-secondary)', fontSize:'12px'}}>{conn.branch}</div>
                  </div>
                  <div className="conn-action"><span className="tag sm" style={{fontSize:'10px', padding:'4px 8px'}}>{conn.type}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileTab === 'security' && (
          <div className="fade-in">
            <div className="card security-card">
              <div className="card-title" style={{marginBottom:'15px'}}>Account Info</div>
              <div style={{padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                <div style={{fontWeight:600, marginBottom:'4px'}}>Email</div>
                <div style={{color:'var(--text-secondary)', fontSize:'13px'}}>{firebaseUser?.email || '—'}</div>
              </div>
              <div style={{padding: '12px 0'}}>
                <div style={{fontWeight:600, marginBottom:'4px'}}>Login Method</div>
                <div style={{color:'var(--text-secondary)', fontSize:'13px'}}>Email & Password</div>
              </div>
            </div>
            <div className="card security-card" style={{marginTop:'15px'}}>
              <div className="card-title" style={{marginBottom:'15px'}}>Account Session</div>
              <div className="sec-row" style={{display:'flex', justifyContent:'space-between', alignItems:'center', border:'none'}}>
                <div>
                  <div className="sec-label" style={{fontWeight:600, color: 'var(--danger, #ef4444)'}}>Logout</div>
                  <div className="sec-sub" style={{color:'var(--text-secondary)', fontSize:'12px'}}>Securely sign out of your account</div>
                </div>
                <button className="btn btn-outline" style={{width:'auto', padding:'8px 15px', fontSize:'13px', borderColor: 'var(--danger, #ef4444)', color: 'var(--danger, #ef4444)'}} onClick={onLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{marginRight: '5px'}}></i> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
