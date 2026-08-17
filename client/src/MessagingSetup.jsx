import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Plus, X, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : 'https://bantos.cloud/datacenter-api');

const MODULE_VARIABLES = {
  'Ventas': ['{{NombreCliente}}', '{{NumeroCliente}}'],
  'Clientes': ['{{NombreCliente}}', '{{NumeroCliente}}'],
  'Contratos': ['{{NombreCliente}}', '{{NoContrato}}', '{{NombrePlan}}'],
  'Pagos': ['{{NombreCliente}}', '{{NoContrato}}', '{{MontoPago}}', '{{FolioVoucher}}']
};

export default function MessagingSetup({ session }) {
  const [templates, setTemplates] = useState([]);
  const [moduleFilter, setModuleFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  
  const fetchTemplates = async () => {
    try {
      const res = await axios.get(`${API}/backoffice/message-templates?tenantId=${session.tenantId}&module=${moduleFilter}`);
      setTemplates(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session.tenantId) fetchTemplates();
  }, [session.tenantId, moduleFilter]);

  const handleOpenModal = (template = null) => {
    setEditingTemplate(template || {
      module: 'Ventas',
      message_type: 'Bienvenida',
      message_text: '',
      logo_base64: ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta plantilla?')) return;
    try {
      await axios.delete(`${API}/backoffice/message-templates/${id}?tenantId=${session.tenantId}`);
      fetchTemplates();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Mail className="text-blue-600" /> Plantillas de Mensajes
          </h2>
          <p className="text-slate-500 text-sm mt-1">Configura las plantillas de mensajes para los distintos módulos</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <select 
            value={moduleFilter} 
            onChange={e => setModuleFilter(e.target.value)}
            className="bg-white border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none w-full md:w-auto appearance-none"
          >
            <option value="Todos">Todos los Módulos</option>
            <option value="Ventas">Ventas</option>
            <option value="Clientes">Clientes</option>
            <option value="Contratos">Contratos</option>
            <option value="Pagos">Pagos</option>
          </select>
          
          <button 
            onClick={() => handleOpenModal()} 
            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(tpl => (
          <div key={tpl.id} className="bg-white rounded-[24px] p-6 border-2 border-slate-100 shadow-sm flex flex-col relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 font-black text-[10px] uppercase tracking-widest rounded-lg mb-2">
                  {tpl.module}
                </span>
                <h3 className="font-bold text-slate-800 text-lg">{tpl.message_type}</h3>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(tpl)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                <button onClick={() => handleDelete(tpl.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
              </div>
            </div>
            
            {tpl.logo_base64 && (
              <div className="mb-4 h-12 flex items-center justify-start">
                <img src={tpl.logo_base64} alt="Logo" className="max-h-full max-w-full object-contain" />
              </div>
            )}
            
            <p className="text-sm text-slate-500 line-clamp-4 flex-1 whitespace-pre-wrap">
              {tpl.message_text}
            </p>
          </div>
        ))}
        
        {templates.length === 0 && (
          <div className="col-span-full py-16 text-center bg-white rounded-[32px] border-2 border-slate-100 border-dashed">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
              <Mail size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700">No hay plantillas</h3>
            <p className="text-slate-400 text-sm mt-1">Crea tu primera plantilla de mensaje usando el botón superior.</p>
          </div>
        )}
      </div>

      <MessageTemplateModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        template={editingTemplate} 
        session={session}
        onSave={fetchTemplates}
      />
    </div>
  );
}

function MessageTemplateModal({ isOpen, onClose, template, session, onSave }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (template) setFormData({ ...template });
  }, [template]);

  if (!isOpen) return null;

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'image/png') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo_base64: reader.result }));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Por favor selecciona una imagen PNG válida.");
    }
  };

  const insertVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      message_text: (prev.message_text || '') + variable
    }));
  };

  const handleSubmit = async () => {
    if (!formData.module || !formData.message_type || !formData.message_text) {
      return alert("Completa los campos obligatorios");
    }
    setLoading(true);
    try {
      const payload = { ...formData, tenantId: session.tenantId };
      if (formData.id) {
        await axios.put(`${API}/backoffice/message-templates/${formData.id}`, payload);
      } else {
        await axios.post(`${API}/backoffice/message-templates`, payload);
      }
      onSave();
      onClose();
    } catch (e) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-3xl rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[90vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Mail size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{formData.id ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">{session.company_name || 'Comercio'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Módulo</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" 
                value={formData.module || ''} 
                onChange={e => setFormData({...formData, module: e.target.value})}
              >
                <option value="Ventas">Ventas</option>
                <option value="Clientes">Clientes</option>
                <option value="Contratos">Contratos</option>
                <option value="Pagos">Pagos</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Mensaje</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" 
                value={formData.message_type || ''} 
                onChange={e => setFormData({...formData, message_type: e.target.value})}
              >
                <option value="Bienvenida">Bienvenida</option>
                <option value="Recordatorio">Recordatorio</option>
                <option value="Cobro">Cobro</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Logo PNG en Header (Opcional)</label>
            <div className="flex items-center gap-4">
              <div className="relative overflow-hidden w-full max-w-sm">
                <input type="file" accept="image/png" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div className="bg-slate-50 border-2 border-slate-100 border-dashed rounded-xl py-4 flex items-center justify-center gap-2 text-slate-500 font-bold hover:bg-slate-100 transition-colors">
                  <ImageIcon size={20} /> Seleccionar Logo .PNG
                </div>
              </div>
              {formData.logo_base64 && (
                <div className="h-16 flex items-center p-2 border-2 border-slate-100 rounded-xl relative group bg-white">
                  <img src={formData.logo_base64} alt="Preview" className="max-h-full object-contain" />
                  <button onClick={() => setFormData({...formData, logo_base64: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Texto del Mensaje</label>
              <div className="flex gap-2 flex-wrap justify-end">
                {(MODULE_VARIABLES[formData.module] || []).map(variable => (
                  <button key={variable} onClick={() => insertVariable(variable)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors">
                    + {variable}
                  </button>
                ))}
              </div>
            </div>
            <textarea 
              rows={6}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-4 px-5 font-bold text-slate-700 focus:border-blue-600 outline-none transition-all text-base resize-none" 
              value={formData.message_text || ''} 
              onChange={e => setFormData({...formData, message_text: e.target.value})}
              placeholder="Escribe el mensaje aquí..."
            />
          </div>
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 transition-all">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50">
            {loading ? 'Guardando...' : 'Guardar Plantilla'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
