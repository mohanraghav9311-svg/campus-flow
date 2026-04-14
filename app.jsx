import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const { useState, useEffect, useCallback } = React;

// 🔥 FIREBASE CONFIG
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
const db = getFirestore(app);

// ─── HELPERS ───────────────────────────────────
const userDocRef   = (uid) => doc(db, 'users', uid);
const balanceRef   = (uid) => doc(db, 'users', uid, 'finance', 'balance');
const expensesRef  = (uid) => collection(db, 'users', uid, 'finance', 'expenses', 'items');
const presetsRef   = (uid) => doc(db, 'users', uid, 'finance', 'presets');
const goalRef      = (uid) => doc(db, 'users', uid, 'finance', 'goal');
const aboutRef     = (uid) => doc(db, 'users', uid, 'about');
const skillsRef    = (uid) => collection(db, 'users', uid, 'skills');
// Public marketplace — all users' skills
const publicSkillsRef = () => collection(db, 'publicSkills');

// ─── AUTH SCREEN ───────────────────────────────
const AuthScreen = () => {
  const [mode, setMode] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLoginPass, setShowLoginPass] = useState(false);
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
    try { await signInWithEmailAndPassword(auth, loginEmail, loginPassword); }
    catch (err) { setLoginError(friendlyError(err.code)); }
    finally { setLoginLoading(false); }
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
      // Create user document in Firestore
      await setDoc(userDocRef(result.user.uid), {
        name: signupName.trim(),
        email: signupEmail,
        college: '',
        branch: '',
        year: '',
        tags: [],
        createdAt: serverTimestamp()
      });
    } catch (err) { setSignupError(friendlyError(err.code)); }
    finally { setSignupLoading(false); }
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
    color: '#fff', fontSize: '15px', outline: 'none', marginBottom: '12px',
    fontFamily: 'Outfit, sans-serif', transition: 'border 0.2s'
  };
  const passWrapStyle = { position: 'relative', width: '100%', marginBottom: '12px' };
  const eyeStyle = { position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '15px' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', background: 'var(--bg-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '26px', fontWeight: 800, marginBottom: '32px', fontFamily: 'Outfit, sans-serif' }}>
        <i className="fa-solid fa-graduation-cap" style={{ color: 'var(--primary-earn)', fontSize: '30px' }}></i>
        <span>Campus Flow</span>
      </div>
      <div style={{ width: '100%', maxWidth: '380px', background: 'var(--surface)', borderRadius: '20px', padding: '30px 24px', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          {['login', 'signup'].map(m => (
            <button key={m} onClick={() => { setMode(m); setLoginError(''); setSignupError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s', background: mode === m ? (m === 'login' ? 'var(--primary-finance)' : 'var(--primary-earn)') : 'transparent', color: mode === m ? (m === 'login' ? '#000' : '#fff') : 'var(--text-secondary)' }}>
              {m === 'login' ? 'Login' : 'Create Account'}
            </button>
          ))}
        </div>

        {mode === 'login' && (
          <div className="fade-in">
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Wapas aa gaye! 👋</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px' }}>Apna account login karo</div>
            <input style={inputStyle} type="email" placeholder="Email Address" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <div style={passWrapStyle}>
              <input style={{ ...inputStyle, marginBottom: 0, paddingRight: '44px' }} type={showLoginPass ? 'text' : 'password'} placeholder="Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
              <i className={`fa-solid ${showLoginPass ? 'fa-eye-slash' : 'fa-eye'}`} style={eyeStyle} onClick={() => setShowLoginPass(!showLoginPass)}></i>
            </div>
            {loginError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ef4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-circle-exclamation"></i> {loginError}</div>}
            <button onClick={handleLogin} disabled={loginLoading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: loginLoading ? 'rgba(0,208,132,0.5)' : 'var(--primary-finance)', color: '#000', fontWeight: 700, fontSize: '15px', cursor: loginLoading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {loginLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Logging in...</> : <><i className="fa-solid fa-arrow-right-to-bracket"></i> Login</>}
            </button>
            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>Account nahi hai?{' '}<span style={{ color: 'var(--primary-earn)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('signup'); setLoginError(''); }}>Account banao</span></div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="fade-in">
            <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>Join Campus Flow 🚀</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px' }}>Free mein account banao</div>
            <input style={inputStyle} type="text" placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} />
            <input style={inputStyle} type="email" placeholder="College Email Address" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} />
            <div style={passWrapStyle}>
              <input style={{ ...inputStyle, marginBottom: 0, paddingRight: '44px' }} type={showSignupPass ? 'text' : 'password'} placeholder="Password (min. 6 characters)" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} />
              <i className={`fa-solid ${showSignupPass ? 'fa-eye-slash' : 'fa-eye'}`} style={eyeStyle} onClick={() => setShowSignupPass(!showSignupPass)}></i>
            </div>
            <div style={passWrapStyle}>
              <input style={{ ...inputStyle, marginBottom: 0, paddingRight: '44px' }} type={showSignupConfirm ? 'text' : 'password'} placeholder="Confirm Password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSignup()} />
              <i className={`fa-solid ${showSignupConfirm ? 'fa-eye-slash' : 'fa-eye'}`} style={eyeStyle} onClick={() => setShowSignupConfirm(!showSignupConfirm)}></i>
            </div>
            {signupConfirm.length > 0 && (
              <div style={{ fontSize: '12px', marginTop: '-6px', marginBottom: '10px', color: signupPassword === signupConfirm ? '#00d084' : '#ef4444', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <i className={`fa-solid ${signupPassword === signupConfirm ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                {signupPassword === signupConfirm ? 'Passwords match kar rahe hain' : 'Passwords alag hain'}
              </div>
            )}
            {signupError && <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#ef4444', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><i className="fa-solid fa-circle-exclamation"></i> {signupError}</div>}
            <button onClick={handleSignup} disabled={signupLoading} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: signupLoading ? 'rgba(139,92,246,0.5)' : 'var(--primary-earn)', color: '#fff', fontWeight: 700, fontSize: '15px', cursor: signupLoading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              {signupLoading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Account ban raha hai...</> : <><i className="fa-solid fa-user-plus"></i> Account Banao</>}
            </button>
            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '13px', color: 'var(--text-secondary)' }}>Pehle se account hai?{' '}<span style={{ color: 'var(--primary-finance)', cursor: 'pointer', fontWeight: 600 }} onClick={() => { setMode('login'); setSignupError(''); }}>Login karo</span></div>
          </div>
        )}
      </div>
      <div style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>Campus Flow • Students ke liye, students dwara</div>
    </div>
  );
};

// ─── PUBLIC SKILLS MARKETPLACE ────────────────
const SkillsMarketplace = ({ currentUser, currentUserName }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactModal, setContactModal] = useState(null); // skill object
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgSent, setMsgSent] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const q = query(publicSkillsRef(), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const skills = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(s => s.userId !== currentUser.uid); // don't show own skills
        setAllSkills(skills);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [currentUser.uid]);

  const filtered = allSkills.filter(s =>
    !filter ||
    s.title?.toLowerCase().includes(filter.toLowerCase()) ||
    s.desc?.toLowerCase().includes(filter.toLowerCase()) ||
    s.userName?.toLowerCase().includes(filter.toLowerCase())
  );

  const sendContactRequest = async () => {
    if (!msg.trim() || !contactModal) return;
    setSendingMsg(true);
    try {
      // Save message in recipient's inbox
      await addDoc(collection(db, 'users', contactModal.userId, 'messages'), {
        from: currentUser.uid,
        fromName: currentUserName || currentUser.email,
        skillTitle: contactModal.title,
        message: msg.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      setMsgSent(true);
      setMsg('');
      setTimeout(() => { setMsgSent(false); setContactModal(null); }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="fade-in">
      <div className="back-note" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <i className="fa-solid fa-users"></i> Campus ke students jo help offer kar rahe hain
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '20px' }}>
        <i className="fa-solid fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '14px' }}></i>
        <input
          type="text"
          className="input-field"
          placeholder="Skill ya naam se search karo..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ paddingLeft: '40px', width: '100%' }}
        />
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-circle-notch fa-spin" style={{ fontSize: '24px', marginBottom: '12px', display: 'block' }}></i>
          Loading skills...
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <i className="fa-solid fa-ghost" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
          {filter ? 'Koi match nahi mila.' : 'Abhi kisi ne skill publish nahi ki. Pehle tum karo! 💪'}
        </div>
      )}

      <div className="skills-grid">
        {filtered.map(skill => (
          <div key={skill.id} className="card skill-card" style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <div className="skill-title">{skill.title}</div>
              <span style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--primary-earn)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>{skill.price || 'Free'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                <i className="fa-solid fa-user" style={{ color: 'var(--text-secondary)' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{skill.userName || 'Anonymous'}</div>
                {skill.college && <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{skill.college}</div>}
              </div>
            </div>
            <div className="skill-desc">{skill.desc}</div>
            <button
              className="btn btn-outline"
              style={{ marginTop: 'auto', borderColor: 'var(--primary-earn)', color: 'var(--primary-earn)', padding: '10px', fontSize: '13px' }}
              onClick={() => { setContactModal(skill); setMsgSent(false); setMsg(''); }}
            >
              <i className="fa-solid fa-paper-plane"></i> Contact Karo
            </button>
          </div>
        ))}
      </div>

      {/* Contact Modal */}
      {contactModal && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="modal-title" style={{ fontSize: '17px', textAlign: 'left' }}>
                {contactModal.userName} ko message karo
              </div>
              <i className="fa-solid fa-xmark" style={{ cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '18px' }} onClick={() => setContactModal(null)}></i>
            </div>
            <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: '#fff' }}>{contactModal.title}</strong><br />
              {contactModal.price && <span>{contactModal.price}</span>}
            </div>
            {msgSent ? (
              <div style={{ textAlign: 'center', color: 'var(--primary-finance)', padding: '10px', fontSize: '15px' }}>
                <i className="fa-solid fa-check-circle" style={{ marginRight: '8px' }}></i> Message bhej diya!
              </div>
            ) : (
              <>
                <textarea
                  className="input-field"
                  rows="4"
                  placeholder="Apna message likho... (e.g. Hi, mujhe notes chahiye...)"
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  style={{ resize: 'vertical', width: '100%' }}
                ></textarea>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn" style={{ background: 'var(--primary-earn)', color: '#fff', fontWeight: 600 }} onClick={sendContactRequest} disabled={sendingMsg || !msg.trim()}>
                    {sendingMsg ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    {sendingMsg ? ' Bhej raha hai...' : ' Send Message'}
                  </button>
                  <button className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => setContactModal(null)}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── SUB-COMPONENTS ─────────────────────────────
const CategoryItem = ({ icon, name, color, amount, total }) => {
  const percent = total > 0 ? ((amount / total) * 100).toFixed(0) : 0;
  return (
    <div className="cat-item">
      <div className="cat-info">
        <div className="cat-icon" style={{ color, background: `${color}20` }}><i className={`fa-solid ${icon}`}></i></div>
        <div className="cat-details">
          <div className="cat-name">{name}</div>
          <div className="progress-bg" style={{ width: '120px' }}>
            <div className="progress-fill" style={{ background: color, width: `${percent}%` }}></div>
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

  const handleActionClick = () => {
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
    <div className="quick-btn" style={{ position: 'relative' }} onClick={handleActionClick}>
      {!isEditing && (
        <div style={{ position: 'absolute', top: '5px', right: '5px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', opacity: 0.7 }} onClick={(e) => { e.stopPropagation(); setIsEditing(true); setEditVal(presetAmount || defaultAmount || ''); }}>
          <i className="fa-solid fa-pen" style={{ fontSize: '11px' }}></i>
        </div>
      )}
      {isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{category}</span>
          <input type="number" placeholder="Amount" value={editVal} onChange={e => setEditVal(e.target.value)} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid var(--primary-finance)', background: 'rgba(0,0,0,0.5)', color: 'white', textAlign: 'center', fontSize: '13px' }} autoFocus />
          <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
            <button onClick={save} style={{ flex: 1, padding: '6px', fontSize: '11px', background: 'var(--primary-finance)', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Save</button>
            <button onClick={reset} style={{ padding: '6px 8px', fontSize: '11px', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }} title="Reset">✕</button>
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
  <div className={`card insight-card ${className}`} style={{ borderLeft: `4px solid ${iconColor}` }}>
    <div className="cat-icon" style={{ color: iconColor }}><i className={`fa-solid ${icon}`}></i></div>
    <div className="insight-content">
      <div className="insight-title">{title}</div>
      <div className="insight-desc">{desc}</div>
    </div>
  </div>
);

// ─── PROFILE VIEW ──────────────────────────────
const ProfileView = ({
  profileTab, setProfileTab, userData, setUserData, userAbout, setUserAbout,
  isEditingAbout, setIsEditingAbout, userSkills, setUserSkills,
  connections, newSkill, setNewSkill, showAddSkill, setShowAddSkill,
  expenses, onLogout, firebaseUser, onPublishSkill, onDeletePublishedSkill,
  publishedSkillIds
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
    if (newSkill.title && newSkill.desc) {
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
                <div className="card-title" style={{ marginBottom: '15px', fontSize: '18px' }}>Edit Profile</div>
                <input className="input-field" placeholder="Name" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} style={{ marginBottom: '10px' }} />
                <input className="input-field" placeholder="College Name" value={editForm.college} onChange={e => setEditForm({ ...editForm, college: e.target.value })} style={{ marginBottom: '10px' }} />
                <input className="input-field" placeholder="Branch" value={editForm.branch} onChange={e => setEditForm({ ...editForm, branch: e.target.value })} style={{ marginBottom: '10px' }} />
                <input className="input-field" placeholder="Year" value={editForm.year} onChange={e => setEditForm({ ...editForm, year: e.target.value })} style={{ marginBottom: '10px' }} />
                <input className="input-field" placeholder="Skills (comma separated)" value={editTagsStr} onChange={e => setEditTagsStr(e.target.value)} style={{ marginBottom: '15px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-finance" onClick={saveProfile}>Save Changes</button>
                  <button className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => setIsEditingProfile(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="profile-hero card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="hero-top">
                    <div className="hero-avatar"><i className="fa-solid fa-user"></i></div>
                    <div className="hero-info">
                      <h2>{userData.name}</h2>
                      <p className="subtitle">{userData.college || 'College add karo'}</p>
                      <p className="subtitle" style={{ marginBottom: 0 }}>{userData.branch || 'Branch'} • {userData.year || 'Year'}</p>
                      {firebaseUser?.email && <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>{firebaseUser.email}</p>}
                    </div>
                  </div>
                  <button className="btn btn-outline" style={{ width: 'auto', padding: '6px 12px', fontSize: '12px' }} onClick={startEditingProfile}>
                    <i className="fa-solid fa-pen"></i> Edit
                  </button>
                </div>
                <div className="hero-tags" style={{ marginTop: '15px' }}>
                  {userData.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>
              </div>
            )}

            <div className="section-title">Quick Stats</div>
            <div className="stats-grid">
              <div className="stat-card"><i className="fa-solid fa-file-pdf"></i><div className="stat-details"><span className="stat-num">{userData.stats?.uploads || 0}</span><span className="stat-label">Notes Uploaded</span></div></div>
              <div className="stat-card"><i className="fa-solid fa-check-circle"></i><div className="stat-details"><span className="stat-num">{userData.stats?.workDone || 0}</span><span className="stat-label">Work Done</span></div></div>
              <div className="stat-card earn-theme"><i className="fa-solid fa-hand-holding-dollar"></i><div className="stat-details"><span className="stat-num">₹{userData.stats?.earned || 0}</span><span className="stat-label">Total Earned</span></div></div>
              <div className="stat-card finance-theme"><i className="fa-solid fa-wallet"></i><div className="stat-details"><span className="stat-num">₹{expenses.reduce((a, b) => a + b.amount, 0)}</span><span className="stat-label">Total Spent</span></div></div>
            </div>
          </div>
        )}

        {profileTab === 'about' && (
          <div className="fade-in">
            <div className="card about-card">
              <div className="card-header" style={{ justifyContent: 'space-between' }}>
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
                  <div className="about-item"><div className="about-label">Bio</div><textarea className="input-field" value={userAbout.bio} onChange={e => setUserAbout({ ...userAbout, bio: e.target.value })} rows="3"></textarea></div>
                  <div className="about-item"><div className="about-label">Goals</div><input className="input-field" value={userAbout.goals} onChange={e => setUserAbout({ ...userAbout, goals: e.target.value })} /></div>
                  <div className="about-item"><div className="about-label">Subjects of Interest</div><input className="input-field" value={userAbout.interests} onChange={e => setUserAbout({ ...userAbout, interests: e.target.value })} /></div>
                  <div className="about-item"><div className="about-label">Availability</div><input className="input-field" value={userAbout.availability} onChange={e => setUserAbout({ ...userAbout, availability: e.target.value })} /></div>
                </div>
              )}
            </div>
          </div>
        )}

        {profileTab === 'skills' && (
          <div className="fade-in">
            <div className="card-header" style={{ justifyContent: 'space-between', marginBottom: '15px' }}>
              <div className="section-title" style={{ margin: 0 }}>My Skills & Services</div>
              <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }} onClick={() => setShowAddSkill(!showAddSkill)}>
                <i className="fa-solid fa-plus"></i> Add
              </button>
            </div>

            {/* Info note about publishing */}
            <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '10px', padding: '12px', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <i className="fa-solid fa-info-circle" style={{ color: 'var(--primary-earn)', marginTop: '2px', flexShrink: 0 }}></i>
              <span>Skill add karke <strong style={{ color: '#fff' }}>Publish</strong> karo taki dusre students tumhe Earn section mein dekh sakein aur contact kar sakein.</span>
            </div>

            {showAddSkill && (
              <div className="card add-skill-form fade-in" style={{ marginBottom: '20px' }}>
                <div className="card-title" style={{ marginBottom: '15px', fontSize: '16px' }}>Add New Skill</div>
                <input className="input-field" placeholder="Skill Title (e.g. Handwritten Notes, Coding Help)" value={newSkill.title} onChange={e => setNewSkill({ ...newSkill, title: e.target.value })} style={{ marginBottom: '10px' }} />
                <textarea className="input-field" placeholder="Description — kya offer kar rahe ho?" rows="2" value={newSkill.desc} onChange={e => setNewSkill({ ...newSkill, desc: e.target.value })} style={{ marginBottom: '10px' }}></textarea>
                <input className="input-field" placeholder="Price (e.g. ₹100/unit or Free)" value={newSkill.price} onChange={e => setNewSkill({ ...newSkill, price: e.target.value })} style={{ marginBottom: '15px' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-finance" onClick={handleAddSkill}>Save Skill</button>
                  <button className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => setShowAddSkill(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div className="skills-grid" style={{ marginTop: '15px' }}>
              {userSkills.map(skill => {
                const isPublished = publishedSkillIds.includes(skill.id.toString());
                return (
                  <div key={skill.id} className="card skill-card" style={{ cursor: 'default' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div className="skill-title">{skill.title}</div>
                      {isPublished && <span style={{ background: 'rgba(0,208,132,0.15)', color: 'var(--primary-finance)', padding: '3px 8px', borderRadius: '20px', fontSize: '11px', flexShrink: 0 }}>Live ✓</span>}
                    </div>
                    <div className="skill-price">{skill.price || 'Free / Negotiable'}</div>
                    <div className="skill-desc">{skill.desc}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                      {isPublished ? (
                        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '8px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => onDeletePublishedSkill(skill.id.toString())}>
                          <i className="fa-solid fa-eye-slash"></i> Unpublish
                        </button>
                      ) : (
                        <button className="btn btn-outline" style={{ fontSize: '12px', padding: '8px', borderColor: 'var(--primary-earn)', color: 'var(--primary-earn)' }} onClick={() => onPublishSkill(skill)}>
                          <i className="fa-solid fa-globe"></i> Marketplace pe Publish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profileTab === 'history' && (
          <div className="fade-in history-view">
            <div className="section-title" style={{ marginTop: 0 }}>Expense History</div>
            <div className="history-list">
              {expenses.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Koi expense nahi abhi tak.</div>}
              {expenses.slice(0, 20).map(exp => (
                <div key={exp.id} className="history-item">
                  <div className="hi-left"><div className="hi-title">{exp.category}</div><div className="hi-sub">{new Date(exp.date).toLocaleDateString('en-IN')}</div></div>
                  <div className="hi-right" style={{ color: 'var(--danger)', fontWeight: 'bold' }}>-₹{exp.amount}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileTab === 'connections' && (
          <div className="fade-in connections-view">
            <div className="search-bar" style={{ marginBottom: '20px', position: 'relative' }}>
              <i className="fa-solid fa-search" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }}></i>
              <input type="text" className="input-field" placeholder="Search collegemates, skills..." style={{ paddingLeft: '40px' }} />
            </div>
            <div className="section-title">My Network</div>
            <div className="connections-list">
              {connections.map(conn => (
                <div key={conn.id} className="connection-card card" style={{ flexDirection: 'row', alignItems: 'center', padding: '15px', gap: '15px', marginBottom: '10px' }}>
                  <div className="conn-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-user"></i></div>
                  <div className="conn-info" style={{ flex: 1 }}>
                    <div className="conn-name" style={{ fontWeight: 600 }}>{conn.name}</div>
                    <div className="conn-sub" style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{conn.branch}</div>
                  </div>
                  <div className="conn-action"><span className="tag sm">{conn.type}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {profileTab === 'security' && (
          <div className="fade-in">
            <div className="card security-card">
              <div className="card-title" style={{ marginBottom: '15px' }}>Account Info</div>
              <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Email</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{firebaseUser?.email || '—'}</div>
              </div>
              <div style={{ padding: '12px 0' }}>
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>Login Method</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>Email & Password</div>
              </div>
            </div>
            <div className="card security-card" style={{ marginTop: '15px' }}>
              <div className="card-title" style={{ marginBottom: '15px' }}>Account Session</div>
              <div className="sec-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: 'none' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--danger)' }}>Logout</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Securely sign out of your account</div>
                </div>
                <button className="btn btn-outline" style={{ width: 'auto', padding: '8px 15px', fontSize: '13px', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={onLogout}>
                  <i className="fa-solid fa-arrow-right-from-bracket" style={{ marginRight: '5px' }}></i> Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── MESSAGES VIEW ─────────────────────────────
const MessagesView = ({ currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const fetchMessages = async () => {
      try {
        const q = query(collection(db, 'users', currentUser.uid, 'messages'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchMessages();
  }, [currentUser]);

  return (
    <div className="messages-view fade-in">
      <div className="title">Messages</div>
      {loading && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px' }}><i className="fa-solid fa-circle-notch fa-spin"></i> Loading...</div>}
      {!loading && messages.length === 0 && (
        <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>
          <i className="fa-regular fa-envelope-open" style={{ fontSize: '32px', marginBottom: '12px', display: 'block' }}></i>
          Koi message nahi abhi tak. Jab koi tumhari skill mein interested hoga, yahan aayega!
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map(m => (
          <div key={m.id} className="card" style={{ cursor: 'default', padding: '16px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><i className="fa-solid fa-user" style={{ fontSize: '12px', color: 'var(--primary-earn)' }}></i></div>
                {m.fromName || 'Unknown'}
              </div>
              <span style={{ background: 'rgba(139,92,246,0.12)', color: 'var(--primary-earn)', padding: '3px 9px', borderRadius: '20px', fontSize: '11px' }}>{m.skillTitle}</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>{m.message}</div>
            {m.createdAt?.seconds && (
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {new Date(m.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────
const App = () => {
  const [activeTab, setActiveTab] = useState('finance');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [earnView, setEarnView] = useState('select');

  const [profileTab, setProfileTab] = useState('profile');

  // ── User Profile ──
  const defaultUserData = { name: '', college: '', branch: '', year: '', tags: [], stats: { uploads: 0, workDone: 0, earned: 0, spent: 0 } };
  const [userData, setUserData] = useState(defaultUserData);
  const [userAbout, setUserAbout] = useState({ bio: '', goals: '', interests: '', availability: '' });
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [userSkills, setUserSkills] = useState([]);
  const [connections, setConnections] = useState([]);
  const [newSkill, setNewSkill] = useState({ title: '', desc: '', price: '' });
  const [showAddSkill, setShowAddSkill] = useState(false);

  // ── Published skills (IDs synced to Firestore publicSkills) ──
  const [publishedSkillIds, setPublishedSkillIds] = useState([]);

  // ── Finance ──
  const [balance, setBalance] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [savingGoal, setSavingGoal] = useState(10000);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [chartFilter, setChartFilter] = useState(7);
  const [chartType, setChartType] = useState('circular');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCategory, setModalCategory] = useState('');
  const [modalAmount, setModalAmount] = useState('');
  const defaultPresets = { Food: 100, Travel: 50, Tea: null, Stationary: null, Others: null };
  const [quickAddPresets, setQuickAddPresets] = useState(defaultPresets);

  // ── Load user data from Firestore after login ──
  const loadUserData = useCallback(async (uid) => {
    setDataLoading(true);
    try {
      // Profile
      const profileSnap = await getDoc(userDocRef(uid));
      if (profileSnap.exists()) {
        const d = profileSnap.data();
        setUserData({ name: d.name || '', college: d.college || '', branch: d.branch || '', year: d.year || '', tags: d.tags || [], stats: d.stats || defaultUserData.stats });
      }
      // About
      const aboutSnap = await getDoc(aboutRef(uid));
      if (aboutSnap.exists()) setUserAbout(aboutSnap.data());
      // Balance
      const balSnap = await getDoc(balanceRef(uid));
      if (balSnap.exists()) setBalance(balSnap.data().value || 0); else setBalance(0);
      // Goal
      const goalSnap = await getDoc(goalRef(uid));
      if (goalSnap.exists()) setSavingGoal(goalSnap.data().value || 10000);
      // Presets
      const presSnap = await getDoc(presetsRef(uid));
      if (presSnap.exists()) setQuickAddPresets(presSnap.data());
      // Expenses
      try {
        const expSnap = await getDocs(expensesRef(uid));
        const exps = expSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(exps);
      } catch (e) { setExpenses([]); }
      // Skills
      try {
        const skillSnap = await getDocs(skillsRef(uid));
        setUserSkills(skillSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { setUserSkills([]); }
      // Published skill IDs
      try {
        const pubSnap = await getDocs(query(publicSkillsRef()));
        const myPubs = pubSnap.docs.filter(d => d.data().userId === uid).map(d => d.data().localId?.toString());
        setPublishedSkillIds(myPubs.filter(Boolean));
      } catch (e) { setPublishedSkillIds([]); }
    } catch (e) { console.error('loadUserData error:', e); }
    finally { setDataLoading(false); }
  }, []);

  // ── Firebase Auth ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsLoggedIn(true);
        loadUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setIsLoggedIn(false);
        setUserData(defaultUserData);
        setBalance(0);
        setExpenses([]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [loadUserData]);

  // ── Persist userData to Firestore ──
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try { await setDoc(userDocRef(user.uid), { name: userData.name, college: userData.college, branch: userData.branch, year: userData.year, tags: userData.tags, stats: userData.stats || {} }, { merge: true }); }
      catch (e) { console.error(e); }
    }, 800);
    return () => clearTimeout(timer);
  }, [userData, user]);

  // ── Persist userAbout ──
  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(async () => {
      try { await setDoc(aboutRef(user.uid), userAbout, { merge: true }); }
      catch (e) { console.error(e); }
    }, 800);
    return () => clearTimeout(timer);
  }, [userAbout, user]);

  // ── Persist balance ──
  useEffect(() => {
    if (!user || dataLoading) return;
    const timer = setTimeout(async () => {
      try { await setDoc(balanceRef(user.uid), { value: balance }); }
      catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(timer);
  }, [balance, user, dataLoading]);

  // ── Persist presets ──
  useEffect(() => {
    if (!user || dataLoading) return;
    const timer = setTimeout(async () => {
      try { await setDoc(presetsRef(user.uid), quickAddPresets); }
      catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(timer);
  }, [quickAddPresets, user, dataLoading]);

  // ── Persist saving goal ──
  useEffect(() => {
    if (!user || dataLoading) return;
    const timer = setTimeout(async () => {
      try { await setDoc(goalRef(user.uid), { value: savingGoal }); }
      catch (e) { console.error(e); }
    }, 500);
    return () => clearTimeout(timer);
  }, [savingGoal, user, dataLoading]);

  // ── Persist userSkills ──
  useEffect(() => {
    if (!user || dataLoading) return;
    const timer = setTimeout(async () => {
      try {
        // Overwrite all skills docs
        for (const skill of userSkills) {
          await setDoc(doc(skillsRef(user.uid), skill.id.toString()), { title: skill.title, desc: skill.desc, price: skill.price || '' });
        }
      } catch (e) { console.error(e); }
    }, 800);
    return () => clearTimeout(timer);
  }, [userSkills, user, dataLoading]);

  // ── Add Expense (with Firestore) ──
  const addExpense = async (category, amount) => {
    if (balance - amount < 0) { alert('Insufficient Balance!'); return; }
    const newExp = { category, amount: Number(amount), date: new Date().toISOString() };
    setBalance(prev => prev - amount);
    setExpenses(prev => [{ id: Date.now().toString(), ...newExp }, ...prev]);
    if (user) {
      try { await addDoc(expensesRef(user.uid), newExp); }
      catch (e) { console.error(e); }
    }
  };

  // ── Publish skill to marketplace ──
  const handlePublishSkill = async (skill) => {
    if (!user) return;
    try {
      await addDoc(publicSkillsRef(), {
        userId: user.uid,
        localId: skill.id.toString(),
        title: skill.title,
        desc: skill.desc,
        price: skill.price || '',
        userName: userData.name || user.email,
        college: userData.college || '',
        branch: userData.branch || '',
        createdAt: serverTimestamp()
      });
      setPublishedSkillIds(prev => [...prev, skill.id.toString()]);
      alert(`"${skill.title}" marketplace pe publish ho gaya! 🎉`);
    } catch (e) { console.error(e); alert('Publish nahi hua, dobara try karo.'); }
  };

  // ── Unpublish skill ──
  const handleDeletePublishedSkill = async (localId) => {
    if (!user) return;
    try {
      const snap = await getDocs(publicSkillsRef());
      const matchDoc = snap.docs.find(d => d.data().userId === user.uid && d.data().localId === localId);
      if (matchDoc) await deleteDoc(doc(db, 'publicSkills', matchDoc.id));
      setPublishedSkillIds(prev => prev.filter(id => id !== localId));
    } catch (e) { console.error(e); }
  };

  // ── Finance calcs ──
  const totalSpent = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
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

  const chartData = Array.from({ length: chartFilter }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - ((chartFilter - 1) - i));
    const dayLabel = chartFilter === 7 ? d.toLocaleDateString('en-US', { weekday: 'short' }) : d.getDate();
    const dayStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
    const dayEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
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

  const openModal = (category) => { setModalCategory(category); setModalAmount(''); setModalOpen(true); };
  const handleModalSubmit = () => { const amt = parseInt(modalAmount); if (!isNaN(amt) && amt > 0) { addExpense(modalCategory, amt); setModalOpen(false); } };
  const handleAddMoney = () => { const amt = parseInt(addMoneyAmount); if (!isNaN(amt) && amt > 0) { setBalance(prev => prev + amt); setAddMoneyAmount(''); setShowAddMoney(false); } };
  const handleQuickAddClick = (category, amount) => { if (amount) { addExpense(category, amount); } else { openModal(category); } };
  const handleSavePreset = (category, val) => setQuickAddPresets(prev => ({ ...prev, [category]: val }));
  const handleResetPreset = (category) => setQuickAddPresets(prev => ({ ...prev, [category]: defaultPresets[category] }));

  const navigateTo = (tab) => { setActiveTab(tab); if (tab === 'earn') setEarnView('select'); };

  const handleLogout = async () => {
    if (window.confirm('Logout karna chahte ho?')) {
      try { await signOut(auth); setActiveTab('finance'); } catch (error) { console.error('Logout error', error); }
    }
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)' }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fa-solid fa-graduation-cap" style={{ fontSize: '40px', color: 'var(--primary-earn)', marginBottom: '16px', display: 'block' }}></i>
          <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Loading Campus Flow...</div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return <AuthScreen />;

  return (
    <div className="container app-container fade-in">
      {/* Header */}
      <div className="app-header">
        <div className="app-logo">
          <i className="fa-solid fa-graduation-cap"></i>
          <span>Campus Flow</span>
        </div>
        <div className="user-avatar" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowNotifications(!showNotifications)}>
          <i className="fa-regular fa-bell"></i>
          {notifications.length > 0 && <span style={{ position: 'absolute', top: '0px', right: '0px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>}
          {showNotifications && (
            <>
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setShowNotifications(false); }}></div>
              <div className="fade-in" style={{ position: 'absolute', top: '50px', right: '-10px', width: '280px', zIndex: 100, padding: '15px', background: 'var(--surface)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                <div style={{ fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px', fontSize: '15px' }}>Notifications</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', padding: '25px 0' }}>No notifications yet</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="finance-view fade-in">
          <div className="title">Finance Tracker</div>
          {dataLoading && <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}><i className="fa-solid fa-circle-notch fa-spin"></i> Syncing data...</div>}
          <div className="balance-display">
            <div className="subtitle">Total Balance</div>
            <div className="balance-row">
              <div className="balance-amount">₹{balance.toLocaleString()}</div>
              {!showAddMoney && (
                <button className="btn btn-outline" style={{ padding: '10px 20px', width: 'auto', fontSize: '14px', borderRadius: '25px', border: '1px solid var(--primary-finance)' }} onClick={() => setShowAddMoney(true)}>
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
                <input type="number" className="input-field" placeholder="Amount (₹)..." value={addMoneyAmount} onChange={e => setAddMoneyAmount(e.target.value)} />
                <button className="btn-add" style={{ padding: '10px 20px' }} onClick={handleAddMoney}>Add</button>
                <button className="btn-outline" style={{ padding: '10px', borderRadius: '12px', border: 'none', width: 'auto' }} onClick={() => setShowAddMoney(false)}><i className="fa-solid fa-xmark"></i></button>
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
                    <i className={`fa-solid fa-chart-simple ${chartType === 'bar' ? 'active' : ''}`} onClick={() => setChartType('bar')}></i>
                    <i className={`fa-solid fa-chart-line ${chartType === 'line' ? 'active' : ''}`} onClick={() => setChartType('line')}></i>
                    <i className={`fa-solid fa-circle-notch ${chartType === 'circular' ? 'active' : ''}`} onClick={() => setChartType('circular')}></i>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {chartType === 'bar' && chartData.map((data, idx) => (
                  <div className="chart-bar-wrapper" key={idx}>
                    <div className={`chart-bar ${data.isToday ? 'today' : ''}`} style={{ height: `${(data.amount / maxChartAmt) * 100}%` }}></div>
                    {chartFilter === 7 && <div className="chart-label">{String(data.label)[0]}</div>}
                  </div>
                ))}
                {chartType === 'line' && (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <svg className="line-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polyline fill="none" stroke="var(--primary-finance)" strokeWidth="2" points={chartData.map((d, i) => `${(i / (chartFilter - 1)) * 100},${100 - ((d.amount / maxChartAmt) * 100)}`).join(' ')} />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 5px' }}>
                      <span className="chart-label">{chartData[0].label}</span>
                      <span className="chart-label">{chartData[chartData.length - 1].label}</span>
                    </div>
                  </div>
                )}
                {chartType === 'circular' && (
                  <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="circular-chart" style={{ background: getCircularGradient() }}>
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

              <div className="section-title" style={{ marginTop: '30px' }}>Insights for You</div>
              <div className="insights-grid">
                {maxCategoryVal > 0 && <InsightCard icon="fa-lightbulb" iconColor="#f59e0b" title="Spending Insight" desc={`You spent ₹${maxCategoryVal} on ${maxCategory} this week (${maxCategoryPercentage}% of total).`} />}
                <InsightCard icon="fa-triangle-exclamation" iconColor={riskStatus === 'safe' ? 'var(--primary-finance)' : 'var(--danger)'} title="Budget Warning" desc={daysLeft > 14 ? `You are on track! (${daysLeft} days safe limit left)` : `Spending too high! Reduce average daily spend to stretch ₹${balance}.`} />
                {maxCategoryVal > 0 && savingReductionPerDay > 0 && <InsightCard icon="fa-coins" iconColor="#10b981" title="Smart Saving Suggestion" desc={`Reduce ${maxCategory} spending by ₹${savingReductionPerDay}/day to save ₹${potentialMonthlySavings}/month.`} />}
                {totalSpent > 0 && <InsightCard icon="fa-bullseye" iconColor="var(--primary-earn)" title="Earn Suggestion" desc={`You spent ₹${totalSpent}. Recover this by completing ${tasksToRecover} small tasks.`} />}
                <InsightCard className="full-width" icon="fa-chart-pie" iconColor="#3b82f6" title="Weekly Summary" desc={`This week you spent ₹${totalSpent} and retained ₹${balance}.`} />
              </div>
            </div>

            <div className="finance-right">
              <div className="section-title">Overview</div>
              <div className="grid-2">
                <div className="stat-box"><span className="subtitle" style={{ fontSize: '12px', marginBottom: '0' }}>Spent This Week</span><span className="stat-val" style={{ color: 'var(--danger)' }}>₹{totalSpent}</span></div>
                <div className="stat-box"><span className="subtitle" style={{ fontSize: '12px', marginBottom: '0' }}>Avg Daily Spend</span><span className="stat-val">₹{avgDailySpend}</span></div>
              </div>
              <div className="section-title" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Saving Goal</span>
                {!isEditingGoal && <i className="fa-solid fa-pen" style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px' }} onClick={() => { setIsEditingGoal(true); setGoalInput(savingGoal); }}></i>}
              </div>
              <div className="stat-box" style={{ marginBottom: '20px' }}>
                {isEditingGoal ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" value={goalInput} onChange={e => setGoalInput(e.target.value)} className="input-field" style={{ padding: '8px', fontSize: '14px', flex: 1 }} autoFocus />
                    <button className="btn-add" style={{ padding: '8px 15px', fontSize: '13px' }} onClick={() => { setSavingGoal(Number(goalInput) || 0); setIsEditingGoal(false); }}>Save</button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Progress to ₹{savingGoal}</span>
                      <span style={{ fontWeight: 600 }}>{savingGoal > 0 ? Math.min(100, ((balance / savingGoal) * 100)).toFixed(0) : 0}%</span>
                    </div>
                    <div className="progress-bg" style={{ height: '8px', marginTop: 0 }}>
                      <div className="progress-fill" style={{ background: 'var(--primary-finance)', width: `${savingGoal > 0 ? Math.min(100, (balance / savingGoal) * 100) : 0}%` }}></div>
                    </div>
                  </>
                )}
              </div>

              <div className="section-title">Spending Categories</div>
              <div className="categories-list">
                <CategoryItem icon="fa-burger" name="Food" color="#f59e0b" amount={expenses.filter(e => e.category === 'Food').reduce((a, b) => a + b.amount, 0)} total={totalSpent} />
                <CategoryItem icon="fa-bus" name="Travel" color="#3b82f6" amount={expenses.filter(e => e.category === 'Travel').reduce((a, b) => a + b.amount, 0)} total={totalSpent} />
                <CategoryItem icon="fa-box" name="Others" color="#8b5cf6" amount={expenses.filter(e => e.category === 'Others').reduce((a, b) => a + b.amount, 0)} total={totalSpent} />
                <CategoryItem icon="fa-pen" name="Stationary" color="#00d084" amount={expenses.filter(e => e.category === 'Stationary').reduce((a, b) => a + b.amount, 0)} total={totalSpent} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Earn Tab */}
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
                  <div className="role-title">Find Help</div>
                  <div className="role-desc">Hire peers to learn concepts, buy notes, or get project guidance.</div>
                </div>
              </div>
            </div>
          )}

          {earnView === 'work' && (
            <div className="fade-in">
              <div className="back-btn" onClick={() => setEarnView('select')}><i className="fa-solid fa-arrow-left"></i> Back to Roles</div>
              <div className="title" style={{ color: 'var(--primary-earn)' }}>Offer Your Skills</div>
              <div className="subtitle">Profile → Skills tab mein skill add karo, phir marketplace pe publish karo.</div>
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
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button className="btn" style={{ background: 'var(--primary-earn)', color: '#fff', fontWeight: 600, flex: 1, minWidth: '160px' }} onClick={() => { navigateTo('profile'); setProfileTab('skills'); }}>
                  <i className="fa-solid fa-plus"></i> Apni Skill Add Karo
                </button>
                <button className="btn btn-outline" style={{ flex: 1, minWidth: '160px' }} onClick={() => setEarnView('marketplace')}>
                  <i className="fa-solid fa-store"></i> Marketplace Dekho
                </button>
              </div>
            </div>
          )}

          {earnView === 'help' && (
            <div className="fade-in">
              <div className="back-btn" onClick={() => setEarnView('select')}><i className="fa-solid fa-arrow-left"></i> Back to Roles</div>
              <div className="title" style={{ color: '#3b82f6' }}>Find Help</div>
              <div className="subtitle">Campus ke skilled students se directly help lo.</div>
              <div className="disclaimer">
                <i className="fa-solid fa-circle-info"></i>
                <div><strong>Platform Rule:</strong> Providers can only guide or tutor you. You must complete your own assignments.</div>
              </div>
              <button className="btn" style={{ background: '#3b82f6', color: '#fff', fontWeight: 600, marginBottom: '20px' }} onClick={() => setEarnView('marketplace')}>
                <i className="fa-solid fa-store"></i> Skills Marketplace Dekho
              </button>
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

          {earnView === 'marketplace' && (
            <div className="fade-in">
              <div className="back-btn" onClick={() => setEarnView('select')}><i className="fa-solid fa-arrow-left"></i> Back</div>
              <div className="title" style={{ color: 'var(--primary-earn)' }}>Skills Marketplace</div>
              <SkillsMarketplace currentUser={user} currentUserName={userData.name} />
            </div>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === 'messages' && <MessagesView currentUser={user} />}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <ProfileView
          profileTab={profileTab} setProfileTab={setProfileTab}
          userData={userData} setUserData={setUserData}
          userAbout={userAbout} setUserAbout={setUserAbout}
          isEditingAbout={isEditingAbout} setIsEditingAbout={setIsEditingAbout}
          userSkills={userSkills} setUserSkills={setUserSkills}
          connections={connections} setConnections={() => {}}
          newSkill={newSkill} setNewSkill={setNewSkill}
          showAddSkill={showAddSkill} setShowAddSkill={setShowAddSkill}
          expenses={expenses}
          onLogout={handleLogout}
          firebaseUser={user}
          onPublishSkill={handlePublishSkill}
          onDeletePublishedSkill={handleDeletePublishedSkill}
          publishedSkillIds={publishedSkillIds}
        />
      )}

      {/* Amount Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content fade-in">
            <div className="modal-title">Enter Amount for {modalCategory}</div>
            <input type="number" className="input-field" placeholder="Amount (₹)..." autoFocus value={modalAmount} onChange={e => setModalAmount(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleModalSubmit()} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-finance" onClick={handleModalSubmit}>Add Expense</button>
              <button className="btn btn-outline" style={{ flex: 0.5 }} onClick={() => setModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="main-nav">
        <div className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => navigateTo('finance')}><i className="fa-solid fa-wallet"></i><span>Finance</span></div>
        <div className={`nav-item ${activeTab === 'earn' ? 'active' : ''}`} onClick={() => navigateTo('earn')}><i className="fa-solid fa-briefcase"></i><span>Earn</span></div>
        <div className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => navigateTo('messages')}><i className="fa-solid fa-envelope"></i><span>Messages</span></div>
        <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => navigateTo('profile')}><i className="fa-solid fa-user"></i><span>Profile</span></div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
