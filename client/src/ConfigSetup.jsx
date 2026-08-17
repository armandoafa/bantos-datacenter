import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Settings, Save, Mail, Server, Lock, User, Monitor, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : 'https://bantos.cloud/datacenter-api');

export default function ConfigSetup({ session }) {
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: '',
    smtp_user: '',
    smtp_pass: '',
    smtp_secure: true
  });
  const [whitelabelData, setWhitelabelData] = useState({
    whitelabel_name: '',
    whitelabel_logo: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (session?.tenantId) {
      fetchSettings();
    }
  }, [session?.tenantId]);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(`${API}/backoffice/settings?tenantId=${session.tenantId}`);
      if (res.data) {
        setFormData({
          smtp_host: res.data.smtp_host || '',
          smtp_port: res.data.smtp_port || '',
          smtp_user: res.data.smtp_user || '',
          smtp_pass: '', // Never populate password for security
          smtp_secure: res.data.smtp_secure !== undefined ? res.data.smtp_secure : true
        });
        setWhitelabelData({
          whitelabel_name: res.data.whitelabel_name || '',
          whitelabel_logo: res.data.whitelabel_logo || ''
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveWhitelabel = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      await axios.post(`${API}/backoffice/settings`, {
        tenantId: session.tenantId,
        ...whitelabelData
      });
      // Trigger a window event so App.jsx re-fetches the config
      window.dispatchEvent(new Event('whitelabel-updated'));
      setSuccessMsg('Personalización guardada exitosamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Error saving whitelabel data:', err);
      alert('Error guardando la personalización: ' + err.message);
    }
    setLoading(false);
  };

  const handleSaveSMTP = async () => {
    setLoading(true);
    setSuccessMsg('');
    try {
      await axios.post(`${API}/backoffice/settings`, {
        tenantId: session.tenantId,
        ...formData
      });
      setSuccessMsg('Configuración SMTP guardada exitosamente.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
      alert('Hubo un error guardando la configuración SMTP: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
          <Settings size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Configuración del Sistema</h2>
          <p className="text-slate-500 text-sm mt-0.5">Administra los parámetros técnicos y de integración de tu plataforma</p>
        </div>
      </div>

      {/* Personalización White Label */}
      <div className="bg-white rounded-[24px] border-2 border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Monitor className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Personalización (White Label)</h3>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-sm text-slate-500 mb-2">
            Configura el nombre y logotipo de tu plataforma para personalizar la experiencia de tus usuarios.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Tenant (Empresa)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="ej. Mi Empresa S.A."
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-5 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                  value={whitelabelData.whitelabel_name}
                  onChange={e => setWhitelabelData({...whitelabelData, whitelabel_name: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Logotipo (Subir Imagen)</label>
              <div className="flex items-center gap-4">
                {whitelabelData.whitelabel_logo ? (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 flex-shrink-0">
                    <img src={whitelabelData.whitelabel_logo} alt="Logo preview" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="text-slate-400" size={20} />
                  </div>
                )}
                <div className="flex-1">
                  <input 
                    type="file"
                    accept="image/*"
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-all cursor-pointer"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setWhitelabelData({...whitelabelData, whitelabel_logo: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {whitelabelData.whitelabel_logo && (
                    <button 
                      onClick={() => setWhitelabelData({...whitelabelData, whitelabel_logo: ''})}
                      className="text-[10px] font-bold text-red-500 mt-1 hover:text-red-600 transition-colors"
                    >
                      Remover Logotipo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            {successMsg === 'Personalización guardada exitosamente.' && <span className="text-emerald-600 font-bold text-sm">{successMsg}</span>}
          </div>
          <button 
            onClick={handleSaveWhitelabel}
            disabled={loading}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Personalización'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border-2 border-slate-100 shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Mail className="text-slate-400" size={20} />
          <h3 className="font-bold text-slate-800">Servidor de Correos (SMTP)</h3>
        </div>
        <div className="p-6 md:p-8 space-y-6">
          <p className="text-sm text-slate-500 mb-2">
            Configura las credenciales de tu servidor de correo para habilitar el envío automático de <b>Estados de Cuenta (PDF)</b> y <b>Recordatorios de Pago</b> a tus clientes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Servidor (Host)</label>
              <div className="relative">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="ej. smtp.gmail.com"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-5 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all"
                  value={formData.smtp_host}
                  onChange={e => setFormData({...formData, smtp_host: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Puerto</label>
              <div className="relative">
                <Server className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="number"
                  placeholder="ej. 465 o 587"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-5 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all"
                  value={formData.smtp_port}
                  onChange={e => setFormData({...formData, smtp_port: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Usuario / Email</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text"
                  placeholder="ej. notificaciones@miempresa.com"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-5 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all"
                  value={formData.smtp_user}
                  onChange={e => setFormData({...formData, smtp_user: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  placeholder="Ingresa la contraseña"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-12 pr-5 font-bold text-slate-700 focus:border-emerald-500 outline-none transition-all"
                  value={formData.smtp_pass}
                  onChange={e => setFormData({...formData, smtp_pass: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input 
              type="checkbox" 
              id="smtp_secure"
              className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              checked={formData.smtp_secure}
              onChange={e => setFormData({...formData, smtp_secure: e.target.checked})}
            />
            <label htmlFor="smtp_secure" className="text-sm font-bold text-slate-700 cursor-pointer">
              Usar conexión segura (SSL/TLS)
            </label>
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            {successMsg === 'Configuración SMTP guardada exitosamente.' && <span className="text-emerald-600 font-bold text-sm">{successMsg}</span>}
          </div>
          <button 
            onClick={handleSaveSMTP}
            disabled={loading}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={18} /> {loading ? 'Guardando...' : 'Guardar Configuración SMTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
