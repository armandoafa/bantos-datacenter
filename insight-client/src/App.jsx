import React, { useState, useEffect } from 'react';
import { 
  BarChart3, FileText, Users, DollarSign, Smartphone, Calendar, Search, RefreshCw, Layers, TrendingUp, Info, Download
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const API_BASE = 'https://bantos.cloud/datacenter-api'; // O local en dev: 'http://localhost:4000/api'
const isLocal = window.location.hostname === 'localhost';
const API = isLocal ? 'http://localhost:4000/api' : API_BASE;

function App() {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportType, setReportType] = useState('');
  const [trustonicData, setTrustonicData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [clearingData, setClearingData] = useState([]);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, reports, trustonic, clearing
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [exportEndDate, setExportEndDate] = useState(new Date());
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    let eventSource;
    try {
      eventSource = new EventSource(`${API}/insight/stream`);
      
      eventSource.onopen = () => {
        console.log('⚡ Conectado al canal SSE en tiempo real de Bantos Insight');
        setIsLiveConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'PAYMENT_UPDATED') {
            console.log('⚡ Evento PAYMENT_UPDATED recibido vía SSE. Actualizando vistas en tiempo real...', data);
            fetchClearing();
            fetchDashboard();
          }
        } catch (err) {
          console.error('Error parsing SSE event data:', err);
        }
      };

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (e) {
      console.error('Error creando EventSource SSE:', e);
    }

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [selectedTenant]);

  useEffect(() => {
    fetchDashboard();
    fetchReports();
    fetchTrustonicStats();
    if (activeView === 'clearing') fetchClearing();
  }, [selectedTenant, reportType, activeView]);

  const fetchTenants = async () => {
    try {
      const res = await fetch(`${API}/superadmin/tenants`);
      const data = await res.json();
      if (Array.isArray(data)) setTenants(data);
    } catch (e) {
      console.error('Error fetching tenants list:', e);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const url = selectedTenant 
        ? `${API}/insight/dashboard?tenantId=${selectedTenant}` 
        : `${API}/insight/dashboard`;
      const res = await fetch(url);
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error('Error fetching dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrustonicStats = async () => {
    setLoading(true);
    try {
      const url = selectedTenant 
        ? `${API}/insight/trustonic-stats?tenantId=${selectedTenant}` 
        : `${API}/insight/trustonic-stats`;
      const res = await fetch(url);
      const data = await res.json();
      setTrustonicData(data);
    } catch (e) {
      console.error('Error fetching trustonic stats:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClearing = async () => {
    setLoading(true);
    try {
      const url = `${API}/insight/clearing`;
      const res = await fetch(url);
      const data = await res.json();
      setClearingData(data);
    } catch (e) {
      console.error('Error fetching clearing data:', e);
    } finally {
      setLoading(false);
    }
  };

  const exportClearingToCSV = () => {
    if (!clearingData || clearingData.length === 0) return;
    
    let filteredData = clearingData;
    
    if (exportStartDate || exportEndDate) {
      filteredData = clearingData.filter(c => {
        const d = new Date(c.payment_date);
        let valid = true;
        
        if (exportStartDate) {
          const start = new Date(exportStartDate);
          start.setHours(0, 0, 0, 0);
          if (d < start) valid = false;
        }
        if (exportEndDate) {
          const end = new Date(exportEndDate);
          end.setHours(23, 59, 59, 999);
          if (d > end) valid = false;
        }
        return valid;
      });
    }

    if (!filteredData || filteredData.length === 0) {
      alert('No hay transacciones en este período para exportar.');
      return;
    }

    const headers = ['Fecha', 'Tenant', 'Transaccion', 'Metodo', 'Monto Bruto', 'Comision', 'Monto Neto', 'Conciliacion', 'Estado Tx'];
    
    const rows = filteredData.map(c => {
      const d = new Date(c.payment_date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      const dateStr = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      
      const tenant = c.tenant_name || c.tenant_id || 'Comercializadora Romel';
      const txId = c.transaction_id || 'N/A';
      const method = c.method || 'Tarjeta Automatica';
      const reconciled = c.is_reconciled ? 'Conciliado' : 'Pendiente';
      const status = c.status?.toUpperCase() || 'PENDING';
      
      return [
        `"${dateStr}"`,
        `"${tenant}"`,
        `"${txId}"`,
        `"${method}"`,
        c.amount,
        c.estimated_fee,
        c.estimated_net,
        `"${reconciled}"`,
        `"${status}"`
      ];
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Conciliacion_Clearing_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSyncTrustonic = async () => {
    if (!window.confirm('¿Iniciar sincronización manual con Trustonic? Esto puede demorar unos minutos por el scraping.')) return;
    setSyncing(true);
    setSyncMessage(null);
    try {
      const res = await fetch(`${API}/insight/trustonic-sync`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSyncMessage({ type: 'success', text: data.message });
        fetchTrustonicStats(); // actualizar dashboard
        fetchReports(); // actualizar logs
      } else {
        setSyncMessage({ type: 'error', text: data.message || 'Error en sincronización' });
      }
    } catch (e) {
      setSyncMessage({ type: 'error', text: 'Error de red al intentar sincronizar' });
    } finally {
      setSyncing(false);
    }
  };

  const [reconciling, setReconciling] = useState(false);
  const [reconcileMessage, setReconcileMessage] = useState(null);

  const handleReconcileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('statement', file);

    setReconciling(true);
    setReconcileMessage(null);
    try {
      const res = await fetch(`${API}/insight/clearing/reconcile`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReconcileMessage({ type: 'success', text: `Conciliados: ${data.successCount}. No conciliados: ${data.unReconciledCount}. Total depósitos en estado de cuenta: ${data.totalDepositsFound}` });
        fetchClearing(); // Refresh the table
      } else {
        setReconcileMessage({ type: 'error', text: data.error || 'Error en conciliación' });
      }
    } catch (err) {
      setReconcileMessage({ type: 'error', text: 'Error de red al intentar conciliar' });
    } finally {
      setReconciling(false);
      e.target.value = null; // reset file input
    }
  };

  const fetchReports = async () => {
    try {
      let url = `${API}/insight/reports?limit=30`;
      if (selectedTenant) url += `&tenantId=${selectedTenant}`;
      if (reportType) url += `&type=${reportType}`;
      
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data)) setReports(data);
    } catch (e) {
      console.error('Error fetching reports:', e);
    }
  };

  return (
    <div className="insight-layout">
      {/* Header Bar */}
      <header className="insight-header">
        <div className="header-left">
          <div className="header-logo">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1>Bantos InSight</h1>
            <p>Monitoreo y Analíticas de Operaciones Multitenant</p>
          </div>
        </div>

        <div className="header-actions">
          {isLiveConnected && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #a7f3d0' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }}></span>
              ⚡ En Vivo
            </div>
          )}
          {/* Global Tenant Filter */}
          <div className="filter-group">
            <label>Filtrar por Tenant:</label>
            <select 
              value={selectedTenant}
              onChange={e => setSelectedTenant(e.target.value)}
              className="tenant-selector"
            >
              <option value="">Todos los Tenants (Consolidado)</option>
              {tenants.map(t => (
                <option key={t.id} value={t.tenant_id}>{t.company_name || t.tenant_id} ({t.tenant_id})</option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => { fetchDashboard(); fetchReports(); fetchTrustonicStats(); }} 
            className="btn-refresh" 
            title="Refrescar datos"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <TrendingUp size={18} />
          <span>Dashboard Analítico</span>
        </button>
        <button 
          className={`tab-btn ${activeView === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveView('reports')}
        >
          <FileText size={18} />
          <span>Reportes de Operaciones</span>
        </button>
        <button 
          className={`tab-btn ${activeView === 'trustonic' ? 'active' : ''}`}
          onClick={() => setActiveView('trustonic')}
        >
          <Smartphone size={18} />
          <span>Auditoría de Dispositivos (Trustonic)</span>
        </button>
        <button 
          className={`tab-btn ${activeView === 'clearing' ? 'active' : ''}`}
          onClick={() => setActiveView('clearing')}
        >
          <DollarSign size={18} />
          <span>Conciliación (Clearing)</span>
        </button>
      </div>

      {activeView === 'trustonic' && (
        <div className="dashboard-content">
          {/* Sync Header */}
          <div className="trustonic-sync-header">
            <div>
              <h2 style={{margin:0}}>Sincronización Web Scraper</h2>
              <p className="text-muted" style={{marginTop:'4px'}}>Obtén las últimas actualizaciones de la plataforma Trustonic</p>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
              {syncMessage && (
                <span className={`badge badge-${syncMessage.type === 'success' ? 'success' : 'danger'}`}>
                  {syncMessage.text}
                </span>
              )}
              <button 
                className="btn-primary" 
                onClick={handleSyncTrustonic}
                disabled={syncing}
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Sincronizando...' : 'Sincronizar Datos'}
              </button>
            </div>
          </div>

          <div className="kpi-grid" style={{marginTop: '20px'}}>
            <div className="kpi-card card-gradient">
              <div className="kpi-icon"><Smartphone size={24} /></div>
              <div>
                <h3>Dispositivos Sincronizados</h3>
                <p className="kpi-value">{trustonicData?.total?.toLocaleString() || 0}</p>
                <span>Total en base de datos local</span>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            {/* Status Breakdown */}
            <div className="chart-card">
              <h3>Estado de Dispositivos</h3>
              <p className="chart-subtitle">Distribución por estado (Active, Inactive, etc)</p>
              <div className="status-list">
                {trustonicData?.statusBreakdown && trustonicData.statusBreakdown.length > 0 ? (
                  trustonicData.statusBreakdown.map((s, idx) => (
                    <div key={idx} className="status-item">
                      <div className="status-meta">
                        <span className="status-dot" style={{ backgroundColor: s.status === 'Active' ? 'var(--color-success)' : s.status === 'Locked' ? 'var(--color-danger)' : '#64748b' }} />
                        <span className="status-name">{s.status || 'Desconocido'}</span>
                      </div>
                      <div className="status-bar-bg">
                        <div 
                          className="status-bar-fill" 
                          style={{ 
                            width: `${(s.count / (trustonicData?.total || 1)) * 100}%`,
                            backgroundColor: s.status === 'Active' ? 'var(--color-success)' : s.status === 'Locked' ? 'var(--color-danger)' : '#64748b'
                          }} 
                        />
                      </div>
                      <span className="status-count font-bold">{s.count.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty">No hay datos de estado.</div>
                )}
              </div>
            </div>

            {/* Brands Breakdown */}
            <div className="chart-card">
              <h3>Top Marcas</h3>
              <p className="chart-subtitle">Dispositivos por fabricante</p>
              <div className="status-list">
                {trustonicData?.brandBreakdown && trustonicData.brandBreakdown.length > 0 ? (
                  trustonicData.brandBreakdown.map((b, idx) => (
                    <div key={idx} className="status-item">
                      <div className="status-meta">
                        <span className="status-name">{b.brand || 'Desconocido'}</span>
                      </div>
                      <div className="status-bar-bg">
                        <div 
                          className="status-bar-fill" 
                          style={{ 
                            width: `${(b.count / (trustonicData?.total || 1)) * 100}%`,
                            backgroundColor: 'var(--color-indigo)'
                          }} 
                        />
                      </div>
                      <span className="status-count font-bold">{b.count.toLocaleString()}</span>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty">No hay datos de marcas.</div>
                )}
              </div>
            </div>
            
            {/* Growth */}
            <div className="chart-card">
              <h3>Crecimiento Mensual</h3>
              <p className="chart-subtitle">Dispositivos registrados por mes</p>
              <div className="bar-chart-container">
                {trustonicData?.growth && trustonicData.growth.length > 0 ? (
                  trustonicData.growth.map((g, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${Math.min(100, (g.count / Math.max(...trustonicData.growth.map(item => item.count))) * 100)}%` }}
                          title={`${g.count} dispositivos`}
                        />
                      </div>
                      <span className="bar-label">
  			{g.month && g.month.includes('-') 
    			? `${g.month.split('-')[1]}/${g.month.split('-')[0]}` 
    			: g.month}
		      </span>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty">No hay datos de crecimiento.</div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {activeView === 'dashboard' && dashboardData && (
        <div className="dashboard-content">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card card-gradient">
              <div className="kpi-icon"><DollarSign size={24} /></div>
              <div>
                <h3>Recaudación Total</h3>
                <p className="kpi-value">${dashboardData.paidValue.toLocaleString()} MXN</p>
                <span>De un valor de contrato de ${dashboardData.totalValue.toLocaleString()} MXN</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon text-indigo"><FileText size={24} /></div>
              <div>
                <h3>Contratos Registrados</h3>
                <p className="kpi-value">{dashboardData.totalContracts}</p>
                <span>Total de contratos de crédito / ventas</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon text-emerald"><Users size={24} /></div>
              <div>
                <h3>Clientes Activos</h3>
                <p className="kpi-value">{dashboardData.totalClients}</p>
                <span>Clientes validados y registrados</span>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon text-blue"><Smartphone size={24} /></div>
              <div>
                <h3>Dispositivos Financiados</h3>
                <p className="kpi-value">{dashboardData.totalDevices}</p>
                <span>Celulares serializados en stock / asignados</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            {/* Sales performance over months */}
            <div className="chart-card">
              <h3>Desempeño Mensual de Ventas</h3>
              <p className="chart-subtitle">Valor total registrado en los últimos meses</p>
              
              <div className="bar-chart-container">
                {dashboardData.monthlySales && dashboardData.monthlySales.length > 0 ? (
                  dashboardData.monthlySales.map((s, idx) => (
                    <div key={idx} className="chart-bar-item">
                      <div className="bar-wrapper">
                        <div 
                          className="bar-fill" 
                          style={{ height: `${Math.min(100, (Number(s.sales_val) / Math.max(...dashboardData.monthlySales.map(item => Number(item.sales_val) || 1))) * 100)}%` }}
                          title={`$${Number(s.sales_val).toLocaleString()}`}
                        />
                      </div>
                      <span className="bar-label">{s.month}</span>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty">No hay suficientes datos de ventas para mostrar gráficos.</div>
                )}
              </div>
            </div>

            {/* Contract status breakdown */}
            <div className="chart-card">
              <h3>Distribución de Estados de Contratos</h3>
              <p className="chart-subtitle">Resumen actual de contratos por estado operativo</p>
              
              <div className="status-list">
                {dashboardData.contractsByStatus && dashboardData.contractsByStatus.length > 0 ? (
                  dashboardData.contractsByStatus.map((c, idx) => (
                    <div key={idx} className="status-item">
                      <div className="status-meta">
                        <span className="status-dot" style={{ backgroundColor: c.status === 'signed' || c.status === 'approved' ? 'var(--color-success)' : '#64748b' }} />
                        <span className="status-name">{c.status.toUpperCase()}</span>
                      </div>
                      <div className="status-bar-bg">
                        <div 
                          className="status-bar-fill" 
                          style={{ 
                            width: `${(c.count / dashboardData.totalContracts) * 100}%`,
                            backgroundColor: c.status === 'signed' || c.status === 'approved' ? 'var(--color-success)' : '#64748b'
                          }} 
                        />
                      </div>
                      <span className="status-count font-bold">{c.count}</span>
                    </div>
                  ))
                ) : (
                  <div className="chart-empty">No hay registros de contratos.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'reports' && (
        <div className="reports-content">
          {/* Controls */}
          <div className="reports-toolbar">
            <div className="report-filter">
              <label>Tipo de Operación:</label>
              <select 
                value={reportType} 
                onChange={e => setReportType(e.target.value)}
                className="type-selector"
              >
                <option value="">Todas las Operaciones</option>
                <option value="CLIENT_CREATE">Registro de Cliente</option>
                <option value="CONTRACT_CREATE">Creación de Contrato</option>
                <option value="PAYMENT_REGISTER">Registro de Pago</option>
                <option value="PRODUCT_CREATE">Creación de Dispositivo (Catálogo)</option>
                <option value="PRODUCT_EDIT">Edición de Dispositivo (Productos)</option>
                <option value="USER_LOGIN">Inicio de Sesión</option>
                <option value="SYNC">Sincronización</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="reports-table-card">
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tenant</th>
                  <th>Tipo de Operación</th>
                  <th>Detalle / Referencia</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map(r => (
                    <tr key={r.id}>
                      <td className="text-muted">{new Date(r.created_at).toLocaleString('es-MX')}</td>
                      <td className="font-bold">{r.tenant_id}</td>
                      <td>
                        <span className="operation-type-badge">
                          {r.process_type}
                        </span>
                      </td>
                      <td>
                        <div className="detail-preview">
                          <span className="font-bold text-indigo">{r.process_id}</span>
                          {r.detail && (
                            <span className="detail-meta text-muted">
                              {typeof r.detail === 'string' ? r.detail : JSON.stringify(r.detail).substring(0, 100)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${r.status === 'SUCCESS' || r.status === 'Paid' || r.status === 'Active' ? 'success' : 'danger'}`}>
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">No se registraron operaciones para los filtros seleccionados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'clearing' && (
        <div className="reports-content">
          <div className="reports-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0 }}>Conciliación Financiera (Clearing)</h2>
              <p className="text-muted" style={{ marginTop: '4px' }}>Auditoría global de transacciones Dynamicore y cálculo de comisiones</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept=".csv,.pdf" 
                  id="reconcile-upload" 
                  style={{ display: 'none' }}
                  onChange={handleReconcileUpload}
                  disabled={reconciling}
                />
                <label 
                  htmlFor="reconcile-upload"
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#4f46e5' }}
                >
                  <FileText size={18} className={reconciling ? 'animate-pulse' : ''} />
                  {reconciling ? 'Conciliando...' : 'Subir Estado de Cuenta'}
                </label>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <DatePicker 
                  selected={exportStartDate}
                  onChange={date => setExportStartDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Fecha Inicio"
                  className="input-field"
                  isClearable
                />
                <span style={{ color: '#64748b' }}>-</span>
                <DatePicker 
                  selected={exportEndDate}
                  onChange={date => setExportEndDate(date)}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Fecha Final"
                  className="input-field"
                  isClearable
                />
                <button 
                  className="btn-primary" 
                  onClick={exportClearingToCSV}
                  disabled={loading || clearingData.length === 0}
                  style={{display: 'flex', alignItems: 'center', gap: '8px', background: '#10b981', border: '1px solid #10b981'}}
                >
                  <Download size={18} />
                  Exportar a Excel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={fetchClearing}
                  disabled={loading}
                  style={{display: 'flex', alignItems: 'center', gap: '8px'}}
                >
                  <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                  Refrescar Datos
                </button>
              </div>
            </div>
          </div>
          
          {reconcileMessage && (
            <div className={`alert alert-${reconcileMessage.type === 'success' ? 'success' : 'danger'}`} style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', backgroundColor: reconcileMessage.type === 'success' ? '#dcfce7' : '#fee2e2', color: reconcileMessage.type === 'success' ? '#166534' : '#991b1b' }}>
              {reconcileMessage.text}
            </div>
          )}

          <div className="kpi-grid" style={{marginTop: '20px'}}>
            <div className="kpi-card card-gradient">
              <div className="kpi-icon"><DollarSign size={24} /></div>
              <div>
                <h3>Total Transaccionado</h3>
                <p className="kpi-value">
                  ${clearingData.reduce((acc, curr) => acc + (curr.status?.toUpperCase() === 'PAID' ? Number(curr.amount) : 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <span>Suma bruta aprobada</span>
              </div>
            </div>
            <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #fef2f2 0%, #fef2f2 100%)', border: '1px solid #fee2e2' }}>
              <div className="kpi-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}><DollarSign size={24} /></div>
              <div>
                <h3 style={{ color: '#991b1b' }}>Comisiones Estimadas (Dynamicore)</h3>
                <p className="kpi-value" style={{ color: '#ef4444' }}>
                  ${clearingData.reduce((acc, curr) => acc + (curr.status?.toUpperCase() === 'PAID' ? Number(curr.estimated_fee) : 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <span style={{ color: '#b91c1c' }}>3.5% + $2.50 por Tx Exitosa</span>
              </div>
            </div>
            <div className="kpi-card" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #ecfdf5 100%)', border: '1px solid #d1fae5' }}>
              <div className="kpi-icon" style={{ backgroundColor: '#d1fae5', color: '#10b981' }}><DollarSign size={24} /></div>
              <div>
                <h3 style={{ color: '#065f46' }}>Monto a Conciliar (Neto Bantos)</h3>
                <p className="kpi-value" style={{ color: '#10b981' }}>
                  ${clearingData.reduce((acc, curr) => acc + (curr.status?.toUpperCase() === 'PAID' ? Number(curr.estimated_net) : 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </p>
                <span style={{ color: '#047857' }}>Ingreso neto bancario</span>
              </div>
            </div>
          </div>

          <div className="reports-table-card" style={{ marginTop: '20px' }}>
            <table>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tenant</th>
                  <th>Transacción</th>
                  <th>Método</th>
                  <th>Monto Bruto</th>
                  <th>Comisión</th>
                  <th>Monto Neto</th>
                  <th>Conciliación</th>
                  <th>Estado Tx</th>
                </tr>
              </thead>
              <tbody>
                {clearingData.length > 0 ? (
                  clearingData.map(c => (
                    <tr key={c.id}>
                      <td className="text-muted">{new Date(c.payment_date).toLocaleString('es-MX')}</td>
                      <td className="font-bold">{c.tenant_name || c.tenant_id || 'Comercializadora Romel'}</td>
                      <td>
                        <div className="detail-preview">
                          <span className="font-bold text-indigo">{c.transaction_id || 'N/A'}</span>
                          {c.is_recurring == 1 && <span className="badge badge-success" style={{ marginLeft: '8px', fontSize: '10px' }}>Automático</span>}
                        </div>
                      </td>
                      <td className="text-muted">{c.method || 'Tarjeta Automática'}</td>
                      <td className="font-bold">${Number(c.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="text-danger font-medium">-${Number(c.estimated_fee).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td className="text-success font-bold">${Number(c.estimated_net).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                      <td>
                        {c.is_reconciled ? (
                          <span className="badge badge-success" title={c.bank_reference || ''} style={{ background: '#dcfce7', color: '#166534' }}>✓ Conciliado</span>
                        ) : (
                          <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#92400e' }}>Pendiente</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${c.status?.toUpperCase() === 'PAID' || c.status?.toUpperCase() === 'ACCEPTED' ? 'success' : c.status?.toUpperCase() === 'FAILED' ? 'danger' : 'warning'}`}>
                          {c.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="empty-state">No hay transacciones registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
