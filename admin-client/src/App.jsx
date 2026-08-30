import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, Users, ShieldCheck, Plus, Search, LogOut, Check, X, Edit2, AlertCircle, RefreshCw, Trash2, ShieldAlert, Key, Smartphone
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
  const [licenses, setLicenses] = useState([]);
  const [trustonicInventory, setTrustonicInventory] = useState([]);
  const [trustonicSyncStatus, setTrustonicSyncStatus] = useState({ isSyncing: false, lastSync: null });
  const [deviceFilterTenant, setDeviceFilterTenant] = useState('');
  const [deviceFilterService, setDeviceFilterService] = useState('');
  const [deviceFilterMarca, setDeviceFilterMarca] = useState('');
  const [deviceFilterModelo, setDeviceFilterModelo] = useState('');
  const [deviceFilterStatus, setDeviceFilterStatus] = useState('');

  // Auto-update effect
  const prevSyncingRef = useRef(false);
  useEffect(() => {
    if (prevSyncingRef.current && !trustonicSyncStatus.isSyncing) {
      // It just finished syncing
      fetchTrustonicInventory();
    }
    prevSyncingRef.current = trustonicSyncStatus.isSyncing;
  }, [trustonicSyncStatus.isSyncing]);

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

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseForm, setLicenseForm] = useState({
    tenant_id: '',
    quantity: 1,
    unit_cost: 0
  });

  const [showEditLicenseModal, setShowEditLicenseModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [editLicenseForm, setEditLicenseForm] = useState({ device_imei: '', status: 'available', unit_cost: '' });

  // Filtros de la tabla de Licencias
  const [licenseFilterTenant, setLicenseFilterTenant] = useState('');
  const [licenseFilterImei, setLicenseFilterImei] = useState('');

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
  
  // Pagination
  const [devicePage, setDevicePage] = useState(1);
  const DEVICES_PER_PAGE = 15;

  const openEditLicenseModal = (l) => {
    setEditingLicense(l);
    setEditLicenseForm({ device_imei: l.device_imei || '', status: l.status || 'available', unit_cost: l.unit_cost || '' });
    setShowEditLicenseModal(true);
  };

  const handleSaveLicenseEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/superadmin/licenses/${editingLicense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editLicenseForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowEditLicenseModal(false);
        setEditingLicense(null);
        fetchLicenses();
      } else {
        alert(data.error || 'Error al guardar licencia');
      }
    } catch (e) {
      alert('Error de red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session, activeTab]);

  useEffect(() => {
    setDevicePage(1);
  }, [searchQuery, deviceFilterTenant, deviceFilterService, deviceFilterMarca, deviceFilterModelo, deviceFilterStatus]);

  const loadData = () => {
    fetchTenants();
    fetchUsers();
    fetchTenantsStats();
    if (activeTab === 'licenses') fetchLicenses();
    if (activeTab === 'devices' || activeTab === 'dashboard') {
      fetchTrustonicInventory();
      if (activeTab === 'devices') fetchTrustonicSyncStatus();
    }
  };

  const fetchTrustonicInventory = async () => {
    try {
      const res = await fetch(`${API}/superadmin/trustonic-inventory`);
      const data = await res.json();
      if (Array.isArray(data)) setTrustonicInventory(data);
    } catch (e) {
      console.error('Error fetching trustonic inventory:', e);
    }
  };

  const fetchTrustonicSyncStatus = async () => {
    try {
      const res = await fetch(`${API}/superadmin/trustonic-inventory/sync-status`);
      const data = await res.json();
      setTrustonicSyncStatus(data);
    } catch (e) {
      console.error('Error fetching trustonic sync status:', e);
    }
  };

  const handleSyncTrustonic = async () => {
    try {
      setTrustonicSyncStatus(prev => ({ ...prev, isSyncing: true }));
      const res = await fetch(`${API}/superadmin/trustonic-inventory/sync`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) {
        alert(data.error || 'Error al iniciar sincronización');
        setTrustonicSyncStatus(prev => ({ ...prev, isSyncing: false }));
      }
    } catch (e) {
      alert('Error de red al iniciar sincronización');
      setTrustonicSyncStatus(prev => ({ ...prev, isSyncing: false }));
    }
  };

  useEffect(() => {
    let interval;
    if (activeTab === 'devices' && trustonicSyncStatus.isSyncing) {
      interval = setInterval(() => {
        fetchTrustonicSyncStatus();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, trustonicSyncStatus.isSyncing]);

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

  const fetchLicenses = async () => {
    try {
      const res = await fetch(`${API}/superadmin/licenses`);
      const data = await res.json();
      if (Array.isArray(data)) setLicenses(data);
    } catch (e) {
      console.error('Error fetching licenses:', e);
    }
  };

  const handleGenerateLicenses = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API}/superadmin/licenses/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(licenseForm)
      });
      const data = await res.json();
      if (data.success) {
        setShowLicenseModal(false);
        setLicenseForm({ tenant_id: '', quantity: 1, unit_cost: 0 });
        loadData();
      } else {
        alert(data.error || 'Error al generar licencias');
      }
    } catch (e) {
      alert('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLicenseStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'suspended' ? 'available' : 'suspended';
    try {
      const res = await fetch(`${API}/superadmin/licenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || 'Error al actualizar licencia');
      }
    } catch (e) {
      alert('Error de red');
    }
  };

  const handleDeleteLicense = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta licencia?')) return;
    try {
      const res = await fetch(`${API}/superadmin/licenses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        loadData();
      } else {
        alert(data.error || 'Error al eliminar licencia');
      }
    } catch (e) {
      alert('Error de red');
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
    setUserForm({ username: '', email: '', password: '', tenant_id: '', role: 'agent', status: 'active' });
    setShowUserModal(true);
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setUserForm({
      username: u.username,
      email: u.email || '',
      password: '', // Dejar vacío si no se cambia
      tenant_id: u.tenant_id || '',
      role: u.role || 'agent',
      status: u.status || 'active'
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
          <button 
            className={`nav-item ${activeTab === 'licenses' ? 'active' : ''}`}
            onClick={() => { setActiveTab('licenses'); setSearchQuery(''); }}
          >
            <Key size={18} />
            <span>Licencias</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'devices' ? 'active' : ''}`}
            onClick={() => { 
              setActiveTab('devices'); 
              setSearchQuery(''); 
              setDeviceFilterMarca('');
              setDeviceFilterModelo('');
              setDeviceFilterStatus('');
            }}
          >
            <Smartphone size={18} />
            <span>Dispositivos</span>
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
              {activeTab === 'licenses' && 'Gestión de Licencias'}
              {activeTab === 'devices' && 'Inventario de Dispositivos'}
            </h2>
            <p>Infraestructura global, control de autenticación y flujos de datos.</p>
          </div>
          {activeTab !== 'dashboard' && activeTab !== 'devices' && (
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (activeTab === 'tenants') openNewTenantModal();
                else if (activeTab === 'users') openNewUserModal();
                else if (activeTab === 'licenses') setShowLicenseModal(true);
              }}
            >
              <Plus size={18} />
              <span>
                {activeTab === 'tenants' && 'Nuevo Tenant'}
                {activeTab === 'users' && 'Nuevo Usuario'}
                {activeTab === 'licenses' && 'Generar Licencias'}
              </span>
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
                placeholder={`Buscar en ${activeTab === 'tenants' ? 'tenants' : activeTab === 'users' ? 'usuarios' : activeTab === 'licenses' ? 'licencias' : 'dispositivos'}...`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            {activeTab === 'devices' && (
              <>
                <select className="filter-select" value={deviceFilterTenant} onChange={e => setDeviceFilterTenant(e.target.value)}>
                  <option value="">Todos los Tenants</option>
                  {[...new Set(trustonicInventory.map(d => d.tenant).filter(Boolean))].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select className="filter-select" value={deviceFilterService} onChange={e => setDeviceFilterService(e.target.value)}>
                  <option value="">Todos los Servicios</option>
                  {[...new Set(trustonicInventory.map(d => d.service).filter(Boolean))].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select className="filter-select" value={deviceFilterMarca} onChange={e => setDeviceFilterMarca(e.target.value)}>
                  <option value="">Todas las Marcas</option>
                  {[...new Set(trustonicInventory.map(d => d.brand).filter(Boolean))].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <select className="filter-select" value={deviceFilterModelo} onChange={e => setDeviceFilterModelo(e.target.value)}>
                  <option value="">Todos los Modelos</option>
                  {[...new Set(trustonicInventory.filter(d => !deviceFilterMarca || d.brand === deviceFilterMarca).map(d => d.model).filter(Boolean))].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select className="filter-select" value={deviceFilterStatus} onChange={e => setDeviceFilterStatus(e.target.value)}>
                  <option value="">Todos los Status</option>
                  {[...new Set(trustonicInventory.map(d => d.status).filter(Boolean))].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <div className="flex flex-col items-end gap-1 ml-auto">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSyncTrustonic}
                    disabled={trustonicSyncStatus.isSyncing}
                  >
                    <RefreshCw size={16} className={trustonicSyncStatus.isSyncing ? "animate-spin" : ""} />
                    {trustonicSyncStatus.isSyncing ? 'Conciliando...' : 'Conciliar con Trustonic'}
                  </button>
                  <span className="text-xs text-slate-500 font-medium mt-1">
                    {trustonicSyncStatus.isSyncing 
                      ? 'Sincronización con Trustonic en curso...' 
                      : trustonicSyncStatus.lastSync 
                        ? `Sincronizado con fecha: ${new Date(trustonicSyncStatus.lastSync).toLocaleString()}` 
                        : 'No se ha sincronizado'}
                  </span>
                </div>
              </>
            )}
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
                  <p className="kpi-value">{trustonicInventory.length || totalVolume.devices}</p>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '13px', marginTop: '4px', color: '#64748b' }}>
                    <span><strong>PREPAGO:</strong> {trustonicInventory.filter(d => d.service === 'PREPAID').length}</span>
                    <span><strong>POSTPAGO:</strong> {trustonicInventory.filter(d => d.service === 'POSTPAID').length}</span>
                  </div>
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
                    <th>Licencias (Disp/Tot)</th>
                    <th>Volumen General</th>
                  </tr>
                </thead>
                <tbody>
                  {tenantsWithStats.map(t => {
                    const totalRows = t.devices_count + t.plans_count + t.contracts_count + t.payments_count;
                    const availabilityPercentage = t.total_licenses > 0 ? (t.available_licenses / t.total_licenses) * 100 : 0;
                    const isLowLicenses = t.total_licenses > 0 && availabilityPercentage <= 10;
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
                        <td>
                          {t.total_licenses > 0 ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span>{t.available_licenses} / {t.total_licenses}</span>
                              {isLowLicenses && (
                                <span className="badge badge-warning text-xs flex items-center gap-1" title="Menos del 10% de licencias disponibles">
                                  <AlertCircle size={12} /> Low
                                </span>
                              )}
                            </div>
                          ) : '—'}
                        </td>
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
                            title="Gestionar Alcance"
                            onClick={() => {
                              setEditingUserForScope(u);
                              setScopeForm({
                                org_id: u.org_id || '',
                                role: u.scope_role || 'STAFF',
                                tenant_id: u.tenant_id || ''
                              });
                              setShowScopeModal(true);
                            }}
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

        {/* 4. LICENSES MANAGEMENT VIEW */}
        {activeTab === 'licenses' && (
          <div>
            {/* KPI Licencias */}
            <div className="kpi-grid" style={{ marginBottom: '24px' }}>
              <div className="kpi-card">
                <div className="kpi-icon text-indigo"><Key size={24} /></div>
                <div>
                  <h3>Disponibles</h3>
                  <p className="kpi-value">{licenses.filter(l => l.status === 'available').length}</p>
                  <span>Licencias sin usar</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon text-emerald"><Check size={24} /></div>
                <div>
                  <h3>Activas</h3>
                  <p className="kpi-value">{licenses.filter(l => l.status === 'active').length}</p>
                  <span>Asignadas a dispositivos</span>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon text-danger"><AlertCircle size={24} /></div>
                <div>
                  <h3>Suspendidas</h3>
                  <p className="kpi-value">{licenses.filter(l => l.status === 'suspended').length}</p>
                  <span>Uso bloqueado</span>
                </div>
              </div>
            </div>

            {/* Barra de filtros dedicada */}
            <div className="license-filters">
              <div className="filter-group">
                <label>Filtrar por Tenant</label>
                <select
                  value={licenseFilterTenant}
                  onChange={e => setLicenseFilterTenant(e.target.value)}
                >
                  <option value="">Todos los tenants</option>
                  {[...new Set(licenses.map(l => l.tenant_id))].map(tid => (
                    <option key={tid} value={tid}>{tid}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Filtrar por IMEI</label>
                <input
                  type="text"
                  placeholder="Ej. 356938035643809"
                  value={licenseFilterImei}
                  onChange={e => setLicenseFilterImei(e.target.value)}
                />
              </div>
            </div>

            <div className="card-table">
              <table>
                <thead>
                  <tr>
                    <th>License Key</th>
                    <th>Tenant</th>
                    <th>Dispositivo (IMEI)</th>
                    <th>Costo Unitario</th>
                    <th>Estado</th>
                    <th>Expiración</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses
                    .filter(l => {
                      const matchTenant = !licenseFilterTenant || l.tenant_id === licenseFilterTenant;
                      const matchImei = !licenseFilterImei || (l.device_imei && l.device_imei.toLowerCase().includes(licenseFilterImei.toLowerCase()));
                      return matchTenant && matchImei;
                    })
                    .map(l => (
                      <tr key={l.id}>
                        <td className="font-mono text-xs">{l.license_key}</td>
                        <td className="font-bold text-indigo">{l.tenant_id}</td>
                        <td>{l.device_imei || '—'}</td>
                        <td>${parseFloat(l.unit_cost).toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-${l.status === 'active' ? 'success' : l.status === 'available' ? 'primary' : 'danger'}`}>
                            {l.status === 'active' ? 'Activa' : l.status === 'available' ? 'Disponible' : 'Suspendida'}
                          </span>
                        </td>
                        <td>{l.expires_at ? new Date(l.expires_at).toLocaleDateString() : 'Sin expiración'}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon text-indigo"
                              onClick={() => openEditLicenseModal(l)}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className={`btn-icon ${l.status === 'suspended' ? 'text-success' : 'text-warning'}`}
                              onClick={() => handleToggleLicenseStatus(l.id, l.status)}
                              title={l.status === 'suspended' ? 'Activar' : 'Suspender'}
                            >
                              {l.status === 'suspended' ? <Check size={16} /> : <AlertCircle size={16} />}
                            </button>
                            <button
                              className="btn-icon text-danger"
                              onClick={() => handleDeleteLicense(l.id)}
                              title="Eliminar"
                              disabled={l.status === 'active'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'devices' && (() => {
          const filteredDevices = trustonicInventory.filter(device => {
            const matchesSearch = device.imei.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (device.brand || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (device.model || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (device.tenant || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (device.service || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (device.status || '').toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTenant = deviceFilterTenant === '' || device.tenant === deviceFilterTenant;
            const matchesService = deviceFilterService === '' || device.service === deviceFilterService;
            const matchesMarca = deviceFilterMarca === '' || device.brand === deviceFilterMarca;
            const matchesModelo = deviceFilterModelo === '' || device.model === deviceFilterModelo;
            const matchesStatus = deviceFilterStatus === '' || device.status === deviceFilterStatus;
            return matchesSearch && matchesTenant && matchesService && matchesMarca && matchesModelo && matchesStatus;
          });

          const totalPages = Math.ceil(filteredDevices.length / DEVICES_PER_PAGE);
          const startIndex = (devicePage - 1) * DEVICES_PER_PAGE;
          const paginatedDevices = filteredDevices.slice(startIndex, startIndex + DEVICES_PER_PAGE);

          return (
            <div className="table-container">
              <table className="card-table">
                <thead>
                  <tr>
                    <th>TENANT</th>
                    <th>SERVICIO</th>
                    <th>TAC</th>
                    <th>MARCA</th>
                    <th>MODELO</th>
                    <th>IMEI</th>
                    <th>STATUS</th>
                    <th>FECHA EXPIRACIÓN</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedDevices.map(device => (
                    <tr key={device.imei}>
                      <td>{device.tenant || '-'}</td>
                      <td>{device.service || '-'}</td>
                      <td>{device.tac || '-'}</td>
                      <td>{device.brand || '-'}</td>
                      <td>{device.model || '-'}</td>
                      <td className="font-mono text-sm">{device.imei}</td>
                      <td>
                        <span className={`status-badge ${device.status?.toLowerCase().includes('bloque') || device.status?.toLowerCase().includes('lock') ? 'inactive' : 'active'}`}>
                          {device.status || '-'}
                        </span>
                      </td>
                        <td>{device.expiration_date || '-'}</td>
                    </tr>
                  ))}
                  {trustonicInventory.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No hay dispositivos sincronizados. Haz clic en "Conciliar con Trustonic" para obtener el inventario.
                      </td>
                    </tr>
                  )}
                  {trustonicInventory.length > 0 && filteredDevices.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                        No se encontraron dispositivos que coincidan con los filtros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', padding: '20px' }}>
                  <button 
                    className="btn btn-light" 
                    disabled={devicePage === 1}
                    onClick={() => setDevicePage(prev => Math.max(prev - 1, 1))}
                  >
                    Anterior
                  </button>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                    Página {devicePage} de {totalPages} ({filteredDevices.length} registros)
                  </span>
                  <button 
                    className="btn btn-light" 
                    disabled={devicePage === totalPages || totalPages === 0}
                    onClick={() => setDevicePage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          );
        })()}
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
                  disabled={!!editingUser}
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

      {/* LICENSE MODAL */}
      {showLicenseModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Generar Licencias</h3>
              <button className="btn-icon" onClick={() => setShowLicenseModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleGenerateLicenses}>
              <div className="form-group">
                <label>Seleccionar Tenant</label>
                <select 
                  value={licenseForm.tenant_id}
                  onChange={e => setLicenseForm({ ...licenseForm, tenant_id: e.target.value })}
                  required
                >
                  <option value="">Selecciona un tenant</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.tenant_id}>{t.tenant_id}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Cantidad de Licencias a Generar</label>
                <input 
                  type="number" 
                  min="1"
                  max="1000"
                  value={licenseForm.quantity}
                  onChange={e => setLicenseForm({ ...licenseForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Costo Unitario (Informativo)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={licenseForm.unit_cost}
                  onChange={e => setLicenseForm({ ...licenseForm, unit_cost: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowLicenseModal(false)}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Generar</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showEditLicenseModal && editingLicense && (
        <div className="modal-backdrop">
          <div className="modal">
            <div className="modal-header">
              <h3>Editar Licencia</h3>
              <button className="btn-icon" onClick={() => setShowEditLicenseModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveLicenseEdit}>
              <div className="form-group">
                <label>Dispositivo (IMEI)</label>
                <input 
                  type="text" 
                  value={editLicenseForm.device_imei}
                  onChange={e => setEditLicenseForm({ ...editLicenseForm, device_imei: e.target.value })}
                  placeholder="Ej. 123456789012345"
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select 
                  value={editLicenseForm.status}
                  onChange={e => setEditLicenseForm({ ...editLicenseForm, status: e.target.value })}
                >
                  <option value="available">DISPONIBLE</option>
                  <option value="active">ACTIVA</option>
                  <option value="suspended">SUSPENDIDA</option>
                </select>
              </div>
              <div className="form-group">
                <label>Costo Unitario</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={editLicenseForm.unit_cost}
                  onChange={e => setEditLicenseForm({ ...editLicenseForm, unit_cost: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" onClick={() => setShowEditLicenseModal(false)}>Cancelar</button>
                <button type="submit" disabled={loading} className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
