import { useState, useEffect, createContext, useContext } from "react";

const API = "https://meetup-backend-m2.onrender.com";
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

const CATEGORIES = ["Sports","Music","Tech","Art","Food","Travel","Fitness","Games","Learning","Social"];
const CATEGORY_ICONS = {
  Sports:"⚽", Music:"🎵", Tech:"💻", Art:"🎨", Food:"🍕",
  Travel:"✈️", Fitness:"💪", Games:"🎮", Learning:"📚", Social:"🎉"
};

// ─── API HELPER ───────────────────────────────────────────────
function api(path, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
}

// ─── TOAST ────────────────────────────────────────────────────
function toast(msg, type = "success") {
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 400); }, 3200);
}

// ─── AUTH PROVIDER ────────────────────────────────────────────
// FIX: On app start, if user has no ID (saved from old session), auto-fetch /me to resolve it
function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) return;
    try {
      const parsed = JSON.parse(stored);
      // If user exists but has no id, fetch /me to get the real id
      if (parsed && !parsed.id) {
        fetch(`${API}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        })
          .then(r => r.ok ? r.json() : null)
          .then(me => {
            if (me) {
              const updated = { email: me.email, fullName: me.fullName, id: me.id };
              localStorage.setItem("user", JSON.stringify(updated));
              setUser(updated);
            }
          })
          .catch(() => {});
      }
    } catch {}
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// ─── NAV ──────────────────────────────────────────────────────
function Nav({ page, setPage }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-logo" onClick={() => setPage("home")}>
          <span className="logo-dot" />
          MeetUpIn
        </div>
        {user && (
          <div className="nav-links">
            <button className={`nav-link ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>Explore</button>
            <button className={`nav-link ${page === "create" ? "active" : ""}`} onClick={() => setPage("create")}>+ Create</button>
            <button className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}>My Space</button>
            <div className="nav-avatar" onClick={() => setMenuOpen(!menuOpen)}>
              {user.fullName?.charAt(0).toUpperCase()}
              {menuOpen && (
                <div className="avatar-menu">
                  <div className="avatar-menu-name">{user.fullName}</div>
                  <div className="avatar-menu-email">{user.email}</div>
                  <div className="avatar-menu-divider" />
                  <button onClick={logout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        )}
        {!user && (
          <div className="nav-links">
            <button className="nav-link" onClick={() => setPage("login")}>Sign in</button>
            <button className="btn-primary" onClick={() => setPage("register")}>Join free</button>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── HOME / EXPLORE ───────────────────────────────────────────
function HomePage({ setPage, setSelectedActivity }) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api("/activities/getallactivitys")
      .then(r => r.json())
      .then(data => { setActivities(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activities.filter(a => {
    const matchCat = filter === "All" || a.category === filter;
    const matchSearch = !search ||
      a.title?.toLowerCase().includes(search.toLowerCase()) ||
      a.location?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="page">
      {!user && (
        <div className="hero">
          <div className="hero-tag">Connect • Explore • Belong</div>
          <h1 className="hero-title">Find your people.<br />Find your activity.</h1>
          <p className="hero-sub">Discover local events, join group activities, and meet people who share your passions.</p>
          <div className="hero-btns">
            <button className="btn-primary btn-lg" onClick={() => setPage("register")}>Get started free</button>
            <button className="btn-ghost btn-lg" onClick={() => setPage("login")}>Sign in</button>
          </div>
          <div className="hero-stats">
            <div><span className="stat-num">{activities.length}</span><span className="stat-label">Activities</span></div>
            <div className="stat-divider" />
            <div><span className="stat-num">{CATEGORIES.length}</span><span className="stat-label">Categories</span></div>
            <div className="stat-divider" />
            <div><span className="stat-num">∞</span><span className="stat-label">Connections</span></div>
          </div>
        </div>
      )}

      <div className="explore-header">
        <h2 className="section-title">{user ? "Explore Activities" : "What's happening"}</h2>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            placeholder="Search by title or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "#888" }}
            >✕</button>
          )}
        </div>
      </div>

      <div className="cat-filter">
        {["All", ...CATEGORIES].map(c => (
          <button key={c} className={`cat-chip ${filter === c ? "active" : ""}`} onClick={() => setFilter(c)}>
            {c !== "All" && <span>{CATEGORY_ICONS[c]}</span>} {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌵</div>
          <p>No activities found. Try a different filter.</p>
          {user && <button className="btn-primary" onClick={() => setPage("create")}>Create one!</button>}
        </div>
      ) : (
        <div className="activity-grid">
          {filtered.map(a => (
            <ActivityCard
              key={a.id}
              activity={a}
              onClick={() => { setSelectedActivity(a); setPage("activity"); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── ACTIVITY CARD ────────────────────────────────────────────
function ActivityCard({ activity: a, onClick }) {
  const colors = ["card-teal", "card-purple", "card-coral", "card-amber", "card-blue"];
  const colorClass = colors[a.id % colors.length];
  return (
    <div className={`activity-card ${colorClass}`} onClick={onClick}>
      <div className="card-category">
        <span>{CATEGORY_ICONS[a.category] || "📌"}</span> {a.category}
      </div>
      <h3 className="card-title">{a.title}</h3>
      <p className="card-desc">{a.description?.slice(0, 90)}{a.description?.length > 90 ? "…" : ""}</p>
      <div className="card-meta">
        <span className="meta-item">📍 {a.location}</span>
        <span className="meta-item">📅 {a.eventDate}</span>
      </div>
      <div className="card-footer">
        <span className="card-host">by {a.createdBy?.fullName || "Unknown"}</span>
        <span className="card-slots">👥 {a.maxMembers} spots</span>
      </div>
    </div>
  );
}

// ─── ACTIVITY DETAIL ──────────────────────────────────────────
function ActivityPage({ activity: a, setPage }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [myRequest, setMyRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const isCreator = user && a?.createdBy?.id === user.id;

  useEffect(() => {
    if (!a) return;
    api(`/joinrequests/activity/${a.id}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRequests(data);
          if (user) setMyRequest(data.find(r => r.user?.id === user.id) || null);
        }
      })
      .catch(() => {});
  }, [a, user]);

  const handleJoin = async () => {
    if (!user) { setPage("login"); return; }
    setLoading(true);
    try {
      // FIX: Backend reads user from JWT — userId can be null, backend ignores it
      const res = await api("/joinrequests/", {
        method: "POST",
        body: JSON.stringify({ activityId: a.id }),
      });
      const data = await res.json();
      if (res.ok) { setMyRequest(data); toast("Join request sent! ✅"); }
      else toast(typeof data === "string" ? data : "Already requested", "error");
    } catch { toast("Error sending request", "error"); }
    setLoading(false);
  };

  const handleAction = async (requestId, action) => {
    const res = await api(`/joinrequests/${requestId}/${action}`, { method: "PUT" });
    if (res.ok) {
      toast(`Request ${action}d ✅`);
      const updated = await api(`/joinrequests/activity/${a.id}`).then(r => r.json());
      if (Array.isArray(updated)) setRequests(updated);
    } else {
      toast("Action failed", "error");
    }
  };

  if (!a) return <div className="page"><p>Activity not found.</p></div>;

  const colors = ["card-teal", "card-purple", "card-coral", "card-amber", "card-blue"];
  const colorClass = colors[a.id % colors.length];

  return (
    <div className="page">
      <button className="back-btn" onClick={() => setPage("home")}>← Back</button>
      <div className={`detail-hero ${colorClass}`}>
        <div className="detail-category">{CATEGORY_ICONS[a.category]} {a.category}</div>
        <h1 className="detail-title">{a.title}</h1>
        <div className="detail-meta-row">
          <span>📍 {a.location}</span>
          <span>📅 {a.eventDate} at {a.eventTime}</span>
          <span>👥 {a.maxMembers} max spots</span>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-left">
          <div className="detail-section">
            <h3>About this activity</h3>
            <p>{a.description}</p>
          </div>

          <div className="detail-section">
            <h3>Hosted by</h3>
            <div className="host-card">
              <div className="host-avatar">{a.createdBy?.fullName?.charAt(0).toUpperCase()}</div>
              <div>
                <div className="host-name">{a.createdBy?.fullName}</div>
                <div className="host-label">Activity Host</div>
              </div>
            </div>
          </div>

          {isCreator && (
            <div className="detail-section">
              <h3>Join Requests ({requests.length})</h3>
              {requests.length === 0 ? (
                <p className="muted">No requests yet.</p>
              ) : (
                <div className="requests-list">
                  {requests.map(r => (
                    <div key={r.id} className="request-item">
                      <div className="request-avatar">{r.user?.fullName?.charAt(0).toUpperCase()}</div>
                      <div className="request-info">
                        <div className="request-name">{r.user?.fullName}</div>
                        <div className={`request-status status-${r.requestStatus?.toLowerCase()}`}>
                          {r.requestStatus}
                        </div>
                      </div>
                      {r.requestStatus === "PENDING" && (
                        <div className="request-actions">
                          <button className="btn-approve" onClick={() => handleAction(r.id, "approve")}>✓</button>
                          <button className="btn-reject" onClick={() => handleAction(r.id, "reject")}>✗</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="detail-right">
          <div className="join-card">
            <div className="join-card-title">Ready to join?</div>
            {!user ? (
              <>
                <p className="muted">Sign in to request a spot</p>
                <button className="btn-primary w-full" onClick={() => setPage("login")}>Sign in to join</button>
              </>
            ) : isCreator ? (
              <div className="creator-badge">🎯 You're hosting this</div>
            ) : myRequest ? (
              <div className={`status-badge status-${myRequest.requestStatus?.toLowerCase()}`}>
                {myRequest.requestStatus === "PENDING" && "⏳ Request pending"}
                {myRequest.requestStatus === "APPROVED" && "✅ You're in!"}
                {myRequest.requestStatus === "REJECTED" && "❌ Request declined"}
              </div>
            ) : (
              <button className="btn-primary w-full" onClick={handleJoin} disabled={loading}>
                {loading ? "Sending…" : "Request to join"}
              </button>
            )}
            <div className="join-card-meta">
              <div><span className="meta-label">Date</span><span>{a.eventDate}</span></div>
              <div><span className="meta-label">Time</span><span>{a.eventTime}</span></div>
              <div><span className="meta-label">Location</span><span>{a.location}</span></div>
              <div><span className="meta-label">Max members</span><span>{a.maxMembers}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CREATE ACTIVITY ──────────────────────────────────────────
// FIX: Only send the fields backend needs — NO userId — backend reads user from JWT token
function CreatePage({ setPage }) {
  const [form, setForm] = useState({
    title: "", description: "", category: "",
    location: "", eventDate: "", eventTime: "", maxMembers: 10,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category)           e.category    = "Pick a category";
    if (!form.location.trim())    e.location    = "Location is required";
    if (!form.eventDate)          e.eventDate   = "Date is required";
    if (!form.eventTime)          e.eventTime   = "Time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // FIX: Send ONLY these specific fields — no userId — backend gets user from JWT
      const res = await api("/activities/", {
        method: "POST",
        body: JSON.stringify({
          title:       form.title,
          description: form.description,
          category:    form.category,
          location:    form.location,
          eventDate:   form.eventDate,
          eventTime:   form.eventTime,
          maxMembers:  Number(form.maxMembers),
          // NO userId here — ActivityService.getCurrentUser() handles this
        }),
      });
      if (res.ok) {
        toast("Activity created! 🎉");
        setPage("home");
      } else {
        const d = await res.json().catch(() => ({}));
        toast(d?.message || "Error creating activity", "error");
      }
    } catch {
      toast("Network error — is the backend running?", "error");
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <div className="form-page">
        <div className="form-header">
          <h1>Create an Activity</h1>
          <p>Bring people together around what you love</p>
        </div>

        <div className="form-body">
          {/* Title */}
          <div className="form-group">
            <label>Activity Title</label>
            <input
              placeholder="e.g. Sunday Morning Football"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              className={errors.title ? "error" : ""}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              rows={4}
              placeholder="Tell people what this is about…"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className={errors.description ? "error" : ""}
            />
            {errors.description && <span className="form-error">{errors.description}</span>}
          </div>

          {/* Category + Location */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className={errors.category ? "error" : ""}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                placeholder="e.g. Cubbon Park, Bangalore"
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                className={errors.location ? "error" : ""}
              />
              {errors.location && <span className="form-error">{errors.location}</span>}
            </div>
          </div>

          {/* Date + Time + Max Members */}
          <div className="form-row">
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.eventDate}
                onChange={e => setForm({ ...form, eventDate: e.target.value })}
                className={errors.eventDate ? "error" : ""}
              />
              {errors.eventDate && <span className="form-error">{errors.eventDate}</span>}
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={form.eventTime}
                onChange={e => setForm({ ...form, eventTime: e.target.value })}
                className={errors.eventTime ? "error" : ""}
              />
              {errors.eventTime && <span className="form-error">{errors.eventTime}</span>}
            </div>
            <div className="form-group">
              <label>Max Members</label>
              <input
                type="number"
                min={2}
                max={1000}
                value={form.maxMembers}
                onChange={e => setForm({ ...form, maxMembers: e.target.value })}
              />
            </div>
          </div>

          {/* Visual category picker */}
          <div className="cat-preview">
            {CATEGORIES.map(c => (
              <div
                key={c}
                className={`cat-card ${form.category === c ? "selected" : ""}`}
                onClick={() => setForm({ ...form, category: c })}
              >
                <span className="cat-card-icon">{CATEGORY_ICONS[c]}</span>
                <span>{c}</span>
              </div>
            ))}
          </div>

          <div className="form-actions">
            <button className="btn-ghost" onClick={() => setPage("home")}>Cancel</button>
            <button className="btn-primary btn-lg" onClick={handleSubmit} disabled={loading}>
              {loading ? "Creating…" : "Create Activity →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────
function DashboardPage({ setPage, setSelectedActivity }) {
  const { user } = useAuth();
  const [myActivities, setMyActivities] = useState([]);
  const [myRequests, setMyRequests]     = useState([]);
  const [tab, setTab] = useState("hosted");

  useEffect(() => {
    if (!user || !user.id) return;
    api(`/activities/created/${user.id}`)
      .then(r => r.json())
      .then(d => setMyActivities(Array.isArray(d) ? d : []));
    api(`/joinrequests/user/${user.id}`)
      .then(r => r.json())
      .then(d => setMyRequests(Array.isArray(d) ? d : []));
  }, [user]);

  const approved = myRequests.filter(r => r.requestStatus === "APPROVED");
  const pending  = myRequests.filter(r => r.requestStatus === "PENDING");
  const rejected = myRequests.filter(r => r.requestStatus === "REJECTED");

  // Delete activity handler
  const handleDelete = async (e, activityId, activityTitle) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${activityTitle}"? This cannot be undone.`)) return;
    const res = await api(`/activities/${activityId}`, { method: "DELETE" });
    if (res.ok) {
      toast("Activity deleted ✅");
      setMyActivities(prev => prev.filter(a => a.id !== activityId));
    } else {
      toast("Failed to delete activity", "error");
    }
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <div className="dashboard-avatar">{user?.fullName?.charAt(0).toUpperCase()}</div>
        <div>
          <h1>Hey, {user?.fullName?.split(" ")[0]}! 👋</h1>
          <p className="muted">{user?.email}</p>
        </div>
        <button className="btn-primary ml-auto" onClick={() => setPage("create")}>+ New Activity</button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-big">{myActivities.length}</div>
          <div className="stat-label">Hosted</div>
        </div>
        <div className="stat-card accent-green">
          <div className="stat-big">{approved.length}</div>
          <div className="stat-label">Joined</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="stat-big">{pending.length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card accent-red">
          <div className="stat-big">{rejected.length}</div>
          <div className="stat-label">Declined</div>
        </div>
      </div>

      <div className="tab-bar">
        <button className={`tab ${tab === "hosted" ? "active" : ""}`} onClick={() => setTab("hosted")}>
          My Activities ({myActivities.length})
        </button>
        <button className={`tab ${tab === "joined" ? "active" : ""}`} onClick={() => setTab("joined")}>
          Join Requests ({myRequests.length})
        </button>
      </div>

      {/* MY HOSTED ACTIVITIES TAB — with delete button */}
      {tab === "hosted" && (
        myActivities.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <p>You haven't created any activities yet.</p>
            <button className="btn-primary" onClick={() => setPage("create")}>Create your first</button>
          </div>
        ) : (
          <div className="activity-grid">
            {myActivities.map(a => (
              <div key={a.id} style={{ position: "relative" }}>
                <ActivityCard
                  activity={a}
                  onClick={() => { setSelectedActivity(a); setPage("activity"); }}
                />
                {/* Delete button — only visible on host's own activities */}
                <button
                  onClick={(e) => handleDelete(e, a.id, a.title)}
                  style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    background: "rgba(163,45,45,0.12)",
                    color: "#a32d2d",
                    border: "1px solid rgba(163,45,45,0.25)",
                    borderRadius: "6px",
                    padding: "4px 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    cursor: "pointer",
                    zIndex: 10,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={e => e.target.style.background = "rgba(163,45,45,0.22)"}
                  onMouseLeave={e => e.target.style.background = "rgba(163,45,45,0.12)"}
                >
                  🗑 Delete
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* MY JOIN REQUESTS TAB */}
      {tab === "joined" && (
        myRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🌱</div>
            <p>You haven't requested to join any activities yet.</p>
            <button className="btn-primary" onClick={() => setPage("home")}>Explore activities</button>
          </div>
        ) : (
          <div className="requests-grid">
            {myRequests.map(r => (
              <div key={r.id} className="my-request-card">
                <div className="mrq-top">
                  <div className={`mrq-status status-${r.requestStatus?.toLowerCase()}`}>{r.requestStatus}</div>
                  <div className="mrq-cat">{CATEGORY_ICONS[r.activity?.category]} {r.activity?.category}</div>
                </div>
                <h4 className="mrq-title">{r.activity?.title}</h4>
                <p className="mrq-loc">📍 {r.activity?.location}</p>
                <p className="mrq-date">📅 {r.activity?.eventDate}</p>
                <button
                  className="btn-ghost btn-sm"
                  onClick={() => { setSelectedActivity(r.activity); setPage("activity"); }}
                >
                  View activity
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────
// FIX: Uses /api/users/me to get the real user ID after login
// This requires the /me endpoint to exist in UserController.java
function LoginPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      // Step 1: Get JWT token
      const tokenRes = await api("/api/users/login", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!tokenRes.ok) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }
      const token = await tokenRes.text();

      // Step 2: Call /me to get the real user object with ID
      // This requires @GetMapping("/me") in UserController.java
      let userData = { email: form.email, fullName: form.email.split("@")[0], id: null };
      try {
        const meRes = await fetch(`${API}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (meRes.ok) {
          const me = await meRes.json();
          userData = { email: me.email, fullName: me.fullName, id: me.id };
        }
      } catch (e) {
        console.warn("Could not fetch /me — user ID will be null:", e);
      }

      login(userData, token);
      toast("Welcome back! 👋");
      setPage("home");

    } catch {
      setError("Network error. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">MeetUpIn</div>
        <h2>Welcome back</h2>
        <p className="muted">Sign in to your account</p>
        {error && <div className="alert-error">{error}</div>}
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <p className="auth-switch">
          No account? <button onClick={() => setPage("register")}>Create one</button>
        </p>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────
function RegisterPage({ setPage }) {
  const { login } = useAuth();
  const [form, setForm]     = useState({ fullName: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const handleSubmit = async () => {
    setError(""); setLoading(true);
    try {
      // Step 1: Register
      const res = await api("/api/users/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.message || "Registration failed");
        setLoading(false);
        return;
      }
      const newUser = await res.json();

      // Step 2: Auto-login to get token
      const tokenRes = await api("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email: form.email, password: form.password }),
      });

      if (tokenRes.ok) {
        const token = await tokenRes.text();
        // newUser from register already has the real id
        login(
          { id: newUser.id, fullName: newUser.fullName, email: newUser.email },
          token
        );
        toast("Account created! 🎉");
        setPage("home");
      } else {
        setPage("login");
      }
    } catch {
      setError("Network error. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">MeetUpIn</div>
        <h2>Create your account</h2>
        <p className="muted">Join thousands of activity lovers</p>
        {error && <div className="alert-error">{error}</div>}
        <div className="form-group">
          <label>Full Name</label>
          <input
            placeholder="Bharath Kumar"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div className="form-group">
          <label>Password <span className="hint">(min 5 chars)</span></label>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
        </div>
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating account…" : "Create account →"}
        </button>
        <p className="auth-switch">
          Have an account? <button onClick={() => setPage("login")}>Sign in</button>
        </p>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────
export default function App() {
  const [page, setPage]                     = useState("home");
  const [selectedActivity, setSelectedActivity] = useState(null);

  return (
    <AuthProvider>
      <div className="app">
        <Nav page={page} setPage={setPage} />
        <main className="main">
          {page === "home"      && <HomePage      setPage={setPage} setSelectedActivity={setSelectedActivity} />}
          {page === "activity"  && <ActivityPage  activity={selectedActivity} setPage={setPage} />}
          {page === "create"    && <CreatePage    setPage={setPage} />}
          {page === "dashboard" && <DashboardPage setPage={setPage} setSelectedActivity={setSelectedActivity} />}
          {page === "login"     && <LoginPage     setPage={setPage} />}
          {page === "register"  && <RegisterPage  setPage={setPage} />}
        </main>
      </div>
    </AuthProvider>
  );
}
