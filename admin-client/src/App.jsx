import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, ShieldCheck, Plus, Search, LogOut, Check, X, Edit2, AlertCircle, RefreshCw, Trash2, ShieldAlert
} from 'lucide-react';
import './App.css';

const API_BASE = 'https://bantos.cloud/datacenter-api';
const isLocal = window.location.hostname === 'localhost';
const API = isLocal ? 'http://localhost:4000/api' : API_BASE;

function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('bantos_superadmin_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Tabs: dashboard, tenants, users
  const [activeTab, setActiveTab] = useState('dashboard');

  // Stats / Data
  const [tenantsWithStats, setTenantsWithStats] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [users, setUsers] = useState([]);

  // Modals & CRUD state
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState(null);
  const [tenantForm, setTenantForm] = useState({
    tenant_id: '',
    company_name: '',
    upya_user: '',
    upya_pass: '',
    status: 'active'
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    username: '',
    email: '',
    password: '',
    tenant_id: '',
    role: 'agent',
    status: 'active'
  });

  const [showScopeModal, setShowScopeModal] = useState(false);
  const [editingUserForScope, setEditingUserForScope] = useState(null);
  const [scopeForm, setScopeForm] = useState({
    org_id: '',
    role: 'STAFF',
    tenant_id: ''
  });

  // Search Filters
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, activeTab]);

  const loadData = () => {
    fetchTenants();
    fetchUsers();
    fetchTenantsStats();
  };

  const fetchTenantsStats = async () => {
    try {
      const res = await fetch(`${API}/superadmin/tenants/stats`);
      const data = await res.json();
      if (Array.isArray(data)) setTenantsWithStats(data);
    } catch (e) {
      console.error('Error fetching tenant stats:', e);
    }
  };

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API}/superadmin/tenants`);
      const data = await res.json();
      if (Array.isArray(data)) setTenants(data);
    } catch (e) {
      console.error('Error fetching tenants:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/superadmin/users`);
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      console.error('Error fetching users:', e);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    try {
      const res = await fetch(`${API}/superadmin/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('bantos_superadmin_session', JSON.stringify(data.user));
        setSession(data.user);
      } else {
        setLoginError(data.message || 'Credenciales inválidas');
      }
    } catch (err) {
      setLoginError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bantos_superadmin_session');
    setSession(null);
  };

  // --- TENANT CRUD ---
  const openNewTenantModal = () => {
    setEditingTenant(null);
    setTenantForm({ tenant_id: '', company_name: '', upya_user: '', upya_pass: '', status: 'active' });
    setShowTenantModal(true);
  };

  const openEditTenantModal = (t) => {
    setEditingTenant(t);
    setTenantForm({
      tenant_id: t.tenant_id,
      company_name: t.company_name || '',
      upya_user: t.upya_user || '',
      upya_pass: t.upya_pass || '',
      status: t.status || 'active'
    });
    setShowTenantModal(true);
  };

  const handleSaveTenant = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEdit = !!editingTenant;
    const url = isEdit ? `${API}/superadmin/tenants/${editingTenant.tenant_id}` : `${API}/superadmin/tenants`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowTenantModal(false);
        loadData();
      } else {
        alert(data.error || 'Error al guardar tenant');
      }
    } catch (e) {
      alert('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTenant = async (tenantId) => {
    if (!confirm(`¿Estás seguro de eliminar el Tenant "${tenantId}"? Se perderán las referencias en cascada.`)) return;
    try {
      const res = await fetch(`${API}/superadmin/tenants/${tenantId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || 'Error al eliminar tenant');
      }
    } catch (e) {
      alert('Error de red');
    }
  };

  // --- USER CRUD ---
  const openNewUserModal = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      email: '',
      password: '',
      tenant_id: '',
      role: 'agent',
      status: 'active',
      org_id: '',
      scope_role: 'STAFF'
    });
    setShowUserModal(true);
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setUserForm({
      username: u.username || '',
      email: u.email || '',
      password: '', // Dejar vacío si no se cambia
      tenant_id: u.tenant_id ? u.tenant_id : 'NULL',
      role: u.role || 'agent',
      status: u.status || 'active',
      org_id: u.org_id || '',
      scope_role: u.scope_role || 'STAFF'
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    const isEdit = !!editingUser;
    const url = isEdit ? `${API}/superadmin/users/${editingUser.id}` : `${API}/superadmin/users`;
    const method = isEdit ? 'PUT' : 'POST';

    const payload = { ...userForm };
    if (isEdit && !payload.password) {
      delete payload.password; // No actualizar pass si está vacío
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setShowUserModal(false);
        loadData();
      } else {
        alert(data.error || 'Error al guardar usuario');
      }
    } catch (e) {
      alert('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      const res = await fetch(`${API}/superadmin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || 'Error al eliminar usuario');
      }
    } catch (e) {
      alert('Error de red');
    }
  };

  const handleUpdateScopes = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/superadmin/users/${editingUserForScope.id}/scopes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scopeForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowScopeModal(false);
        setEditingUserForScope(null);
        loadData();
      } else {
        alert(data.error || 'Error al actualizar scopes');
      }
    } catch (e) {
      alert('Error de red');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="logo-section">
            <div className="logo-box">
              <Building2 size={28} className="logo-icon" />
            </div>
            <h2>Bantos Cloud</h2>
            <p>Panel de Administración Global</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Usuario Super Admin</label>
              <input 
                type="text" 
                placeholder="Ingresa tu usuario"
                value={loginData.username}
                onChange={e => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input 
                type="password" 
                placeholder="Ingresa tu contraseña"
                value={loginData.password}
                onChange={e => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>
            {loginError && (
              <div className="login-error">
                <AlertCircle size={16} />
                <span>{loginError}</span>
              </div>
            )}
            <button type="submit" disabled={loading} className="btn btn-primary btn-block">
              {loading ? <RefreshCw className="animate-spin" size={16} /> : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Aggregate Metrics for Dashboard Cards
  const totalVolume = tenantsWithStats.reduce((acc, t) => ({
    devices: acc.devices + (t.devices_count || 0),
    plans: acc.plans + (t.plans_count || 0),
    contracts: acc.contracts + (t.contracts_count || 0),
    payments: acc.payments + (t.payments_count || 0)
  }), { devices: 0, plans: 0, contracts: 0, payments: 0 });

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-box">
            <Building2 size={24} className="logo-icon" />
          </div>
          <div>
            <h3>Bantos Admin</h3>
            <span>Super Admin Console</span>
          </div>
        </div>

        <nav className="nav-menu">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSearchQuery(''); }}
          >
            <RefreshCw size={18} />
            <span>Dashboard Global</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'tenants' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tenants'); setSearchQuery(''); }}
          >
            <Building2 size={18} />
            <span>Aprovisionar Tenants</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setSearchQuery(''); }}
          >
            <Users size={18} />
            <span>Control de Usuarios</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">SA</div>
            <div className="user-info">
              <p>{session.username}</p>
              <span>Global Administrator</span>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-logout" title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <div>
            <h2>
              {activeTab === 'dashboard' && 'Dashboard de Volumen Multitenant'}
              {activeTab === 'tenants' && 'Aprovisionamiento de Tenants'}
              {activeTab === 'users' && 'Gestión de Usuarios y Permisos'}
            </h2>
            <p>Infraestructura global, control de autenticación y flujos de datos.</p>
          </div>
          {activeTab !== 'dashboard' && (
            <button 
              className="btn btn-primary"
              onClick={activeTab === 'tenants' ? openNewTenantModal : openNewUserModal}
            >
              <Plus size={18} />
              <span>{activeTab === 'tenants' ? 'Nuevo Tenant' : 'Nuevo Usuario'}</span>
            </button>
          )}
        </header>

        {/* Global Toolbar for Search (except dashboard) */}
        {activeTab !== 'dashboard' && (
          <div className="toolbar">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input 
                type="text" 
                placeholder={`Buscar en ${activeTab === 'tenants' ? 'tenants' : 'usuarios'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-view-content">
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon text-indigo"><Building2 size={24} /></div>
                <div>
                  <h3>Tenants Registrados</h3>
                  <p className="kpi-value">{tenantsWithStats.length}</p>
                  <span>Empresas activas en la nube</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon text-emerald"><Users size={24} /></div>
                <div>
                  <h3>Contratos Totales</h3>
                  <p className="kpi-value">{totalVolume.contracts}</p>
                  <span>Gestionados globalmente</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon text-blue"><Plus size={24} /></div>
                <div>
                  <h3>Transacciones/Pagos</h3>
                  <p className="kpi-value">{totalVolume.payments}</p>
                  <span>Recaudados por la pasarela</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon"><RefreshCw size={24} /></div>
                <div>
                  <h3>Dispositivos Totales</h3>
                  <p className="kpi-value">{totalVolume.devices}</p>
                  <span>Monitoreados / Trustonic</span>
                </div>
              </div>
            </div>

            <h3 className="section-title">Volumen de Información por Tenant</h3>
            <div className="card-table">
              <table>
                <thead>
                  <tr>
                    <th>Tenant ID</th>
                    <th>Nombre Comercial</th>
                    <th>Estado</th>
                    <th>Dispositivos</th>
                    <th>Planes (T&C)</th>
                    <th>Contratos</th>
                    <th>Pagos</th>
                    <th>Volumen General</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantsWithStats.map(t => {
                    const totalRows = t.devices_count + t.plans_count + t.contracts_count + t.payments_count;
                    return (
                      <tr key={t.id}>
                        <td className="font-bold text-indigo">{t.tenant_id}</td>
                        <td>{t.company_name || '—'}</td>
                        <td>
                          <span className={`badge badge-${t.status === 'active' ? 'success' : 'danger'}`}>
                            {t.status === 'active' ? 'Activo' : 'Inactivo'}
                          </span>
                        </td>
                        <td>{t.devices_count}</td>
                        <td>{t.plans_count}</td>
                        <td>{t.contracts_count}</td>
                        <td>{t.payments_count}</td>
                        <td className="font-bold">{totalRows} registros</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. TENANTS MANAGEMENT VIEW */}
        {activeTab === 'tenants' && (
          <div className="card-table">
            <table>
              <thead>
                <tr>
                  <th>Tenant ID</th>
                  <th>Nombre Comercial</th>
                  <th>Usuario Upya</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants
                  .filter(t => t.tenant_id.toLowerCase().includes(searchQuery.toLowerCase()) || (t.company_name && t.company_name.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map(t => (
                    <tr key={t.id}>
                      <td className="font-bold text-indigo">{t.tenant_id}</td>
                      <td>{t.company_name || '—'}</td>
                      <td>{t.upya_user || '—'}</td>
                      <td>
                        <span className={`badge badge-${t.status === 'active' ? 'success' : 'danger'}`}>
                          {t.status === 'active' ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" onClick={() => openEditTenantModal(t)} title="Editar"><Edit2 size={16} /></button>
                          <button className="btn-icon text-danger" onClick={() => handleDeleteTenant(t.tenant_id)} title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. USERS MANAGEMENT VIEW */}
        {activeTab === 'users' && (
          <div className="card-table">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Tenant ID</th>
                  <th>Rol General</th>
                  <th>Estado</th>
                  <th>Sucursal / Org</th>
                  <th>Rol Org</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users
                  .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || (u.tenant_id && u.tenant_id.toLowerCase().includes(searchQuery.toLowerCase())))
                  .map(u => (
                    <tr key={u.id}>
                      <td className="font-bold">{u.username}</td>
                      <td>{u.email || '—'}</td>
                      <td className="text-muted">{u.tenant_id || 'Super Admin Global'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-primary' : 'badge-light'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${u.status === 'active' ? 'success' : 'danger'}`}>
                          {u.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td>{u.org_name ? `${u.org_name} (${u.org_type})` : '—'}</td>
                      <td>{u.scope_role || '—'}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-icon" 
                            title="Gestionar Alcance y Permisos"
                            onClick={() => openEditUserModal(u)}
                          >
                            <ShieldCheck size={16} className="text-indigo" />
                          </button>
                          <button className="btn-icon" onClick={() => openEditUserModal(u)} title="Editar"><Edit2 size={16} /></button>
                          <button className="btn-icon text-danger" onClick={() => handleDeleteUser(u.id)} title="Eliminar"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* TENANT MODAL (Create / Edit) */}
      {showTenantModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingTenant ? 'Editar Tenant' : 'Registrar Nuevo Tenant'}</h3>
              <button className="btn-icon" onClick={() => setShowTenantModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveTenant}>
              <div className="form-group">
                <label>Tenant ID (Identificador único)</label>
                <input 
                  type="text" 
                  value={tenantForm.tenant_id}
                  onChange={e => setTenantForm({ ...tenantForm, tenant_id: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                  disabled={!!editingTenant}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre de la Empresa</label>
                <input 
                  type="text" 
                  value={tenantForm.company_name}
                  onChange={e => setTenantForm({ ...tenantForm, company_name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Usuario API Upya</label>
                <input 
                  type="text" 
                  value={tenantForm.upya_user}
                  onChange={e => setTenantForm({ ...tenantForm, upya_user: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contraseña API Upya</label>
                <input 
                  type="password" 
                  value={tenantForm.upya_pass}
                  onChange={e => setTenantForm({ ...tenantForm, upya_pass: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Estado del Tenant</label>
                <select 
                  value={tenantForm.status} 
                  onChange={e => setTenantForm({ ...tenantForm, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="suspended">Suspendido / Deshabilitado</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowTenantModal(false)}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER MODAL (Create / Edit) */}
      {showUserModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</h3>
              <button className="btn-icon" onClick={() => setShowUserModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Nombre de Usuario</label>
                <input 
                  type="text" 
                  value={userForm.username}
                  onChange={e => setUserForm({ ...userForm, username: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  value={userForm.email}
                  onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña {editingUser && '(Dejar vacío para mantener actual)'}</label>
                <input 
                  type="password" 
                  placeholder={editingUser ? 'Nueva contraseña (opcional)' : 'Ingresa contraseña'}
                  value={userForm.password}
                  onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                  required={!editingUser}
                />
              </div>
              <div className="form-group">
                <label>Asignar Tenant</label>
                <select 
                  value={userForm.tenant_id}
                  onChange={e => setUserForm({ ...userForm, tenant_id: e.target.value })}
                  required
                >
                  <option value="">Selecciona un tenant</option>
                  <option value="NULL">Sin Tenant (Super Admin Global)</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.tenant_id}>{t.tenant_id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Rol General</label>
                <select 
                  value={userForm.role}
                  onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                >
                  <option value="admin">Administrador</option>
                  <option value="manager">Manager</option>
                  <option value="agent">Agente</option>
                </select>
              </div>
              <div className="form-group">
                <label>Estado del Usuario</label>
                <select 
                  value={userForm.status} 
                  onChange={e => setUserForm({ ...userForm, status: e.target.value })}
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo / Deshabilitado</option>
                </select>
              </div>
              <div className="form-group">
                <label>ID de la Organización (Org ID de Upya)</label>
                <input 
                  type="text" 
                  placeholder="ej. org-sucursal-centro" 
                  value={userForm.org_id}
                  onChange={e => setUserForm({ ...userForm, org_id: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Rol de Acceso en Sucursal</label>
                <select 
                  value={userForm.scope_role}
                  onChange={e => setUserForm({ ...userForm, scope_role: e.target.value })}
                >
                  <option value="STAFF">STAFF / Operativo</option>
                  <option value="MANAGER">MANAGER / Encargado</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowUserModal(false)}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Guardar Usuario</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCOPE MODAL */}
      {showScopeModal && editingUserForScope && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Administrar Alcance y Permisos</h3>
              <button className="btn-icon" onClick={() => setShowScopeModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateScopes}>
              <div className="form-group">
                <label>Usuario</label>
                <input type="text" value={editingUserForScope.username} disabled />
              </div>
              <div className="form-group">
                <label>ID de la Organización (Org ID de Upya)</label>
                <input 
                  type="text" 
                  value={scopeForm.org_id}
                  onChange={e => setScopeForm({ ...scopeForm, org_id: e.target.value, tenant_id: editingUserForScope.tenant_id })}
                  placeholder="ej. org-sucursal-centro"
                />
              </div>
              <div className="form-group">
                <label>Rol de Acceso en Sucursal</label>
                <select 
                  value={scopeForm.role}
                  onChange={e => setScopeForm({ ...scopeForm, role: e.target.value })}
                >
                  <option value="STAFF">STAFF</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowScopeModal(false)}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Guardar Configuración</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
