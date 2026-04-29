import React, { useState, useEffect, useCallback, useRef } from 'react';
import SignaturePad from 'signature_pad';
import {
  LayoutDashboard, Users, FileText, Box, Clock, CreditCard,
  Tag, Mail, Smartphone, Settings2, ShieldCheck, Search,
  LogOut, RefreshCw, TrendingUp, DollarSign, Plus, Package,
  ChevronDown, ChevronRight, Database, Building2, Globe, MapPin, Store, Edit, X, Trash2,
  BookOpen, Zap, CheckSquare, MessageSquare, ListTodo, ClipboardCheck,
  Upload, PenTool, Send, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : 'https://bantos.cloud/datacenter-api');

// --- Componentes Compartidos ---
const Badge = ({ status }) => {
  const ok = ['Active', 'Signed', 'Paid', 'Ready', 'active', 'signed', 'ENABLED', 'VALIDATED', 'FIRMADO', 'SIGNED'].includes(status);
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
      {status || 'Active'}
    </span>
  );
};

const Table = ({ cols, rows, render }) => (
  <div className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
    <table className="w-full text-left text-sm font-bold text-slate-800">
      <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <tr>{cols.map(c => <th key={c} className="px-8 py-6">{c}</th>)}</tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} className="px-8 py-16 text-center text-slate-300 font-black uppercase tracking-widest text-[11px]">Sin datos — Ejecuta la Sincronización</td></tr>
          : rows.map((row, i) => <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all">{render(row)}</tr>)
        }
      </tbody>
    </table>
  </div>
);

const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex justify-between items-end mb-10">
    <div>
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">{title}</h2>
      {subtitle && <p className="text-slate-400 font-medium mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

// --- MODAL DE PRODUCTO ---
const ProductModal = ({ isOpen, onClose, product, onSave, session }) => {
  const [formData, setFormData] = useState({
    name: '', category: '', productReference: '', lockable: false, manufacturer: '', nonSerialized: false, description: '', picture_url: '', tac: '', build: '', default_managed_by: '', base_value: 0, productType: 'Handset', vat_rate: 0, ...product
  });
  useEffect(() => {
    if (product) setFormData({ ...product, nonSerialized: !product.is_serialized, productReference: product.reference || product.productReference });
    else setFormData({ name: '', category: '', productReference: '', lockable: false, manufacturer: '', nonSerialized: false, description: '', picture_url: '', tac: '', build: '', default_managed_by: '', base_value: 0, productType: 'Handset', vat_rate: 0 });
  }, [product]);
  if (!isOpen) return null;
  const Input = ({ label, value, field, type = 'text' }) => (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <input type={type} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={value} onChange={e => setFormData({...formData, [field]: e.target.value})} />
    </div>
  );
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Package size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Gestión de Catálogo Maestro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><LogOut size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto grid grid-cols-3 gap-8">
          <div className="col-span-2 grid grid-cols-2 gap-5">
            <div className="col-span-2"><p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Información Técnica</p></div>
            <Input label="Nombre del Producto (*)" value={formData.name} field="name" />
            <Input label="Referencia / SKU (*)" value={formData.productReference} field="productReference" />
            <Input label="Fabricante" value={formData.manufacturer} field="manufacturer" />
            <Input label="Categoría" value={formData.category} field="category" />
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Producto</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.productType} onChange={e => setFormData({...formData, productType: e.target.value})}>
                {['Handset', 'Standalone', 'Component', 'Package'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <Input label="TAC" value={formData.tac} field="tac" />
            <Input label="Build" value={formData.build} field="build" />
            <Input label="Default Managed By" value={formData.default_managed_by} field="default_managed_by" />
          </div>
          <div className="space-y-6">
            <div><p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Configuración & Comercial</p></div>
            <div className="bg-slate-50 p-6 rounded-[32px] space-y-5 border border-slate-100">
              <Input label="Precio Base ($)" value={formData.base_value} field="base_value" type="number" />
              <Input label="Tasa IVA (%)" value={formData.vat_rate} field="vat_rate" type="number" />
              <Input label="Picture URL" value={formData.picture_url} field="picture_url" />
            </div>
            <div className="space-y-4 px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setFormData({...formData, nonSerialized: !formData.nonSerialized})} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.nonSerialized ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200'}`}>{formData.nonSerialized && <CheckSquare size={12} />}</div>
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">No Serializado</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => setFormData({...formData, lockable: !formData.lockable})} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.lockable ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>{formData.lockable && <Zap size={12} />}</div>
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Lockable</span>
              </label>
            </div>
          </div>
          <div className="col-span-3 space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción Detallada</label>
            <textarea rows={3} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all resize-none text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <div className="flex-1" /><button onClick={() => onSave(formData)} className="px-14 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">{product ? 'Guardar Cambios' : 'Crear Producto Maestro'}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- MODAL DE COLECCIÓN DE DATOS ---
const DataCollectionModal = ({ isOpen, onClose, collection, onSave }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'onboarding', questions: [], ...collection
  });
  useEffect(() => {
    if (collection) setFormData({ ...collection, questions: collection.questions_json || [] });
    else setFormData({ name: '', category: 'onboarding', questions: [] });
  }, [collection]);
  if (!isOpen) return null;

  const addQuestion = () => setFormData({...formData, questions: [...formData.questions, { id: `q${Date.now()}`, text: '', type: 'text', required: false }]});
  const updateQuestion = (idx, q) => {
    const next = [...formData.questions];
    next[idx] = q;
    setFormData({...formData, questions: next});
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"><ClipboardCheck size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{collection ? 'Editar Flujo' : 'Nuevo Flujo de Datos'}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Configuración de Captura Dinámica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><LogOut size={20} /></button>
        </div>
        
        <div className="p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Formulario</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría / Tipo</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="onboarding">Onboarding</option>
                <option value="standalone">Standalone</option>
                <option value="client-linked">Client-linked</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Estructura de Preguntas ({formData.questions.length})</p>
              <button onClick={addQuestion} className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"><Plus size={14} /> Añadir Campo</button>
            </div>
            
            <div className="space-y-3">
              {formData.questions.map((q, i) => (
                <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-center">
                  <div className="flex-1 space-y-1">
                    <input placeholder="Texto de la pregunta" className="w-full bg-transparent font-bold text-slate-800 outline-none text-sm" value={q.text} onChange={e => updateQuestion(i, {...q, text: e.target.value})} />
                  </div>
                  <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-600 outline-none" value={q.type} onChange={e => updateQuestion(i, {...q, type: e.target.value})}>
                    <option value="text">Texto</option>
                    <option value="number">Número</option>
                    <option value="date">Fecha</option>
                    <option value="select">Selección</option>
                  </select>
                  <button onClick={() => setFormData({...formData, questions: formData.questions.filter((_, idx) => idx !== i)})} className="p-2 text-slate-300 hover:text-red-500 transition-all"><LogOut size={16} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <div className="flex-1" /><button onClick={() => onSave(formData)} className="px-14 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all">{collection ? 'Guardar Cambios' : 'Crear Flujo de Datos'}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- VISTAS ---
const DashboardView = ({ summary }) => (
  <div className="space-y-10">
    <PageHeader title="Dashboard" subtitle="Inteligencia operativa en tiempo real" />
    <div className="grid grid-cols-4 gap-6">
      {[
        { label: 'Recaudación Total', value: `$${Number(summary.totalPaid || 0).toLocaleString()}`, icon: DollarSign, bg: 'from-blue-600 to-indigo-800', white: true },
        { label: 'Clientes Activos', value: summary.totalClients || 0, icon: Users, bg: 'bg-white' },
        { label: 'Contratos', value: summary.totalContracts || 0, icon: FileText, bg: 'bg-white' },
        { label: 'Productos', value: summary.totalProducts || 0, icon: Tag, bg: 'bg-white' },
      ].map(({ label, value, icon: Icon, bg, white }) => (
        <div key={label} className={`p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 ${white ? `bg-gradient-to-br ${bg} text-white border-0 shadow-xl shadow-blue-600/20` : bg}`}>
          <Icon size={28} className={white ? 'text-white opacity-60' : 'text-blue-600 opacity-50'} />
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${white ? 'text-white opacity-70' : 'text-slate-400'}`}>{label}</p>
            <p className={`text-3xl font-black tracking-tighter ${white ? 'text-white' : 'text-slate-800'}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ClientsView = ({ clients }) => (
  <div className="space-y-8">
    <PageHeader title="Clientes" subtitle={`${clients.length} identidades certificadas`} />
    <Table cols={['Nombre Completo', 'ID Upya', 'Email', 'Estado']} rows={clients} render={c => (<><td className="px-8 py-5">{c.name}</td><td className="px-8 py-5 font-mono text-blue-600 text-xs">{c.upya_id}</td><td className="px-8 py-5 text-slate-400">{c.email || '—'}</td><td className="px-8 py-5"><Badge status={c.status} /></td></>)} />
  </div>
);

const CONTRACT_STATUSES = {
  SIGNED: ['SIGNED', 'FIRMADO'],
  APPROVED: ['APPROVED', 'APROBADO', 'LOCKED', 'ENABLED'],
  PENDING: ['PENDING', 'PENDIENTE'],
  REJECTED: ['REJECTED', 'NO APROBADO', 'CANCELLED']
};

const ContractsView = ({ contracts, onNew, onEdit, onSign }) => {
  const [filter, setFilter] = useState('all');

  const filtered = contracts.filter(c => {
    const s = (c.status || '').toUpperCase();
    if (filter === 'all') return true;
    if (filter === 'signed') return CONTRACT_STATUSES.SIGNED.includes(s);
    if (filter === 'approved') return CONTRACT_STATUSES.APPROVED.includes(s);
    if (filter === 'pending') return CONTRACT_STATUSES.PENDING.includes(s);
    if (filter === 'rejected') return CONTRACT_STATUSES.REJECTED.includes(s);
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <PageHeader title="Contratos" subtitle={`${contracts.length} deals registrados`} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm gap-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'signed', label: 'Firmados' },
              { id: 'approved', label: 'Aprobados' },
              { id: 'pending', label: 'Pendientes' },
              { id: 'rejected', label: 'No Aprobados' }
            ].map(f => (
              <button 
                key={f.id} 
                onClick={() => setFilter(f.id)}
                className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${filter === f.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button 
            onClick={onNew}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Nuevo Contrato
          </button>
        </div>
      </div>

      <Table 
        cols={['Contrato', 'Cliente', 'Producto', 'Plan', 'Progreso', 'Estado', 'Acciones']} 
        rows={filtered} 
        render={c => (
          <>
            <td className="px-8 py-5">
              <p className="font-black text-slate-900 tracking-tight">{c.contract_number || c.upya_id}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference ID</p>
            </td>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800">{c.client_name || '—'}</p>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{c.client_number || 'S/N'}</p>
            </td>
            <td className="px-8 py-5">
              <p className="font-black text-slate-900 text-xs">{c.product_name || 'N/A'}</p>
            </td>
            <td className="px-8 py-5">
              <p className="text-[11px] text-slate-500 font-bold">{c.deal_name || 'Plan Estándar'}</p>
            </td>
            <td className="px-8 py-5 w-48">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Pago: ${Number(c.paid_value || 0).toLocaleString()}</span>
                  <span>{Math.round((Number(c.paid_value || 0) / Number(c.total_value || 1)) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-700" style={{ width: `${(Number(c.paid_value || 0) / Number(c.total_value || 1)) * 100}%` }} />
                </div>
              </div>
            </td>
            <td className="px-8 py-5">
              <Badge status={c.status} />
            </td>
            <td className="px-8 py-5 flex items-center gap-2">
              <button 
                onClick={() => onEdit(c)} 
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
                title="Editar contrato"
              >
                <Settings2 size={16} />
              </button>
              {(c.contract_number && (c.contract_number.endsWith('.docx') || c.contract_number.endsWith('.pdf'))) && (
                <a 
                  href={`https://bantos.cloud/signed-contracts/${c.contract_number}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-all"
                  title="Ver documento firmado"
                >
                  <FileText size={16} />
                </a>
              )}
              {!CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase()) && (
                <button 
                  onClick={() => onSign(c)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                >
                  Firmar
                </button>
              )}
            </td>
          </>
        )} 
      />
    </div>
  );
};

const ContractModal = ({ isOpen, onClose, contract, onSave, clients, products }) => {
  const [activeMode, setActiveMode] = useState('form'); // 'form' or 'import'
  const [formData, setFormData] = useState({
    status: '', product_name: '', total_value: 0, paid_value: 0, client_id: '', deal_name: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [signature, setSignature] = useState(null);
  const canvasManualRef = useRef(null);
  const canvasImportRef = useRef(null);
  const signaturePadManualRef = useRef(null);
  const signaturePadImportRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (contract) {
      let client_id = contract.client_id;
      if (!client_id && contract.client_number && clients) {
        const found = clients.find(c => c.client_number === contract.client_number);
        if (found) client_id = found.upya_id;
      }
      setFormData({ ...contract, client_id: client_id || '' });
    }
    else {
      setFormData({ status: 'Signed', product_name: '', total_value: 0, paid_value: 0, client_id: '', deal_name: '' });
      setSelectedFile(null);
      setSignature(null);
      setActiveMode('form');
    }
  }, [contract, isOpen, clients]);

  useEffect(() => {
    let timer;
    if (isOpen) {
      // Retrasamos un poco más la inicialización para asegurar que el modal esté totalmente quieto
      timer = setTimeout(() => {
        const initPad = (canvas, refName) => {
          try {
            if (!canvas) return;
            
            // Si el offsetWidth es 0, el lienzo no es visible aún
            if (canvas.offsetWidth === 0) {
              console.warn(`Lienzo ${refName} tiene tamaño 0, reintentando...`);
              return;
            }

            const ratio = Math.max(window.devicePixelRatio || 1, 1);
            canvas.width = canvas.offsetWidth * ratio;
            canvas.height = canvas.offsetHeight * ratio;
            canvas.getContext("2d").scale(ratio, ratio);

            const pad = new SignaturePad(canvas, {
              backgroundColor: 'rgba(255, 255, 255, 0)',
              penColor: 'rgb(30, 64, 175)', // Azul cobalto intenso
              velocityFilterWeight: 0.7
            });
            
            if (refName === 'manual') signaturePadManualRef.current = pad;
            else signaturePadImportRef.current = pad;
            
            console.log(`Lienzo ${refName} calibrado a ${canvas.width}x${canvas.height}`);
          } catch (err) {
            console.error(`Error en ${refName}:`, err);
          }
        };

        if (activeMode === 'form') initPad(canvasManualRef.current, 'manual');
        else if (activeMode === 'import') initPad(canvasImportRef.current, 'import');
      }, 500);
    }
    return () => {
      clearTimeout(timer);
      signaturePadManualRef.current?.off();
      signaturePadImportRef.current?.off();
    };
  }, [isOpen, activeMode]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleClearSignature = () => {
    if (activeMode === 'form') signaturePadManualRef.current?.clear();
    else signaturePadImportRef.current?.clear();
  };

  const handleLocalSave = async () => {
    if (activeMode === 'import') {
      if (!selectedFile) {
        alert('Por favor, selecciona un archivo (.docx o .pdf)');
        return;
      }
      const signatureData = signaturePadImportRef.current?.toDataURL('image/png');
      const client = clients.find(c => c.upya_id === formData.client_id);
      
      const uploadData = new FormData();
      uploadData.append('file', selectedFile);
      uploadData.append('signatureData', signatureData || '');
      uploadData.append('client_id', formData.client_id);
      uploadData.append('client_name', client?.name || '');
      uploadData.append('email', client?.email || '');

      onSave(uploadData, true); // true indicates it's a multipart import
    } else {
      // Si hay firma en el canvas manual, guardamos como generación
      if (signaturePadManualRef.current && !signaturePadManualRef.current.isEmpty()) {
        const signatureData = signaturePadManualRef.current.toDataURL('image/png');
        const client = clients.find(c => c.upya_id === formData.client_id);
        const dataToSave = {
          contractData: { ...formData, client_name: client?.name || '' },
          signatureData
        };
        onSave(dataToSave, 'generate');
      } else {
        onSave(formData, false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{contract ? `Editar Contrato` : 'Nuevo Contrato'}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Deal / Suscripción</p>
            </div>
            
            {!contract && (
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 ml-4 shadow-sm">
                <button 
                  onClick={() => setActiveMode('form')}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeMode === 'form' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Formulario
                </button>
                <button 
                  onClick={() => setActiveMode('import')}
                  className={`px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeMode === 'import' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Importar & Firmar
                </button>
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-600 hover:shadow-md transition-all border border-slate-100"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {activeMode === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Users size={14} /> Información del Cliente</h3>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cliente Asociado</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.client_id || ''} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                        <option value="">Seleccionar cliente...</option>
                        {(clients || []).map(c => <option key={c.upya_id} value={c.upya_id}>{c.name} ({c.client_number})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado del Contrato</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                        {['Signed', 'Approved', 'Pending', 'Rejected', 'Locked', 'Enabled', 'Paidoff'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2"><CreditCard size={14} /> Detalles del Plan</h3>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Producto / Dispositivo</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-sm appearance-none" value={formData.product_name || ''} onChange={e => setFormData({...formData, product_name: e.target.value})}>
                        <option value="">Seleccionar producto...</option>
                        {(products || []).map(p => <option key={p.upya_id} value={p.name}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Plan (Deal)</label>
                      <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-sm" value={formData.deal_name || ''} onChange={e => setFormData({...formData, deal_name: e.target.value})} placeholder="Ej. 12 Meses PAYG" />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 grid grid-cols-2 gap-8">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Valor Total del Contrato</label>
                    <input type="number" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.total_value || 0} onChange={e => setFormData({...formData, total_value: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Monto Pagado a la Fecha</label>
                    <input type="number" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.paid_value || 0} onChange={e => setFormData({...formData, paid_value: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><PenTool size={14} /> Firma Digital del Contrato</h3>
                  
                  {contract && contract.signature_image ? (
                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-10 flex flex-col items-center gap-6 relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Verificada</div>
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                        <ShieldCheck size={40} className="text-emerald-500" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Firma Protegida e Inmutable</p>
                        <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Registrada digitalmente el {new Date(contract.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <img src={contract.signature_image} alt="Firma guardada" className="max-h-32 opacity-90 mix-blend-multiply transition-all hover:scale-105" />
                      <div className="pt-4 border-t border-emerald-100 w-full text-center">
                        <p className="text-[9px] text-emerald-700/50 font-bold uppercase tracking-widest italic">Esta firma es parte integral del documento y no puede ser modificada</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-2 relative group overflow-hidden">
                      <canvas 
                        ref={canvasManualRef} 
                        className="w-full h-48 cursor-crosshair bg-white rounded-[24px] relative z-[100] border border-blue-200" 
                        style={{ touchAction: 'none', pointerEvents: 'auto' }}
                      />
                      <div className="absolute bottom-6 right-6 flex gap-2 z-[110]">
                        <button 
                          onClick={handleClearSignature}
                          className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                          title="Limpiar firma"
                        >
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">Al firmar aquí, se generará automáticamente un documento .docx basado en el formulario</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="import" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Upload size={14} /> Importación de Documento</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Cliente Asociado</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.client_id || ''} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                        <option value="">Seleccionar cliente...</option>
                        {(clients || []).map(c => <option key={c.upya_id} value={c.upya_id}>{c.name} ({c.client_number})</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Documento (.docx o .pdf)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-video border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${selectedFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'}`}
                      >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf" onChange={handleFileChange} />
                        {selectedFile ? (
                          <>
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm"><FileText size={32} /></div>
                            <div className="text-center px-6">
                              <p className="text-sm font-black text-slate-800 line-clamp-1">{selectedFile.name}</p>
                              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Archivo Listo</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-white text-slate-300 rounded-2xl shadow-sm border border-slate-100"><Upload size={32} /></div>
                            <div className="text-center">
                              <p className="text-sm font-black text-slate-800">Seleccionar Documento</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">O arrastra el archivo aquí</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><PenTool size={14} /> Firma del Cliente</h3>
                      
                      {contract && contract.signature_image ? (
                        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-10 flex flex-col items-center gap-6 relative overflow-hidden">
                          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Verificada</div>
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                            <ShieldCheck size={40} className="text-emerald-500" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-xs font-black text-emerald-900 uppercase tracking-tight">Firma Protegida e Inmutable</p>
                            <p className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest">Vinculada al documento importado</p>
                          </div>
                          <img src={contract.signature_image} alt="Firma actual" className="max-h-32 mix-blend-multiply opacity-90 transition-all hover:scale-105" />
                        </div>
                      ) : (
                        <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-2 relative group overflow-hidden">
                          <canvas 
                            ref={canvasImportRef} 
                            className="w-full h-64 cursor-crosshair bg-white rounded-[24px] relative z-[100] border border-blue-200" 
                            style={{ touchAction: 'none', pointerEvents: 'auto' }}
                          />
                          <div className="absolute bottom-6 right-6 flex gap-2 z-[110]">
                            <button 
                              onClick={handleClearSignature}
                              className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                              title="Limpiar firma"
                            >
                              <RefreshCw size={16} />
                            </button>
                          </div>
                          <div className="absolute top-6 left-6 pointer-events-none">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Área de firma digital</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-3 rounded-2xl border border-slate-100">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        <span>Sello digital seguro Bantos Sign</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button 
            onClick={handleLocalSave} 
            className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg ${activeMode === 'import' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'}`}
          >
            {activeMode === 'import' ? 'Firmar & Importar' : (contract ? 'Guardar Cambios' : 'Crear Contrato')}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const SignatureModal = ({ isOpen, onClose, contract, onSave }) => {
  const canvasRef = useRef(null);
  const signaturePadRef = useRef(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 0)',
        penColor: 'rgb(15, 23, 42)'
      });

      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvasRef.current.width = canvasRef.current.offsetWidth * ratio;
        canvasRef.current.height = canvasRef.current.offsetHeight * ratio;
        canvasRef.current.getContext("2d").scale(ratio, ratio);
        signaturePadRef.current.clear();
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      return () => window.removeEventListener("resize", resizeCanvas);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClear = () => signaturePadRef.current?.clear();
  
  const handleSign = () => {
    if (signaturePadRef.current?.isEmpty()) {
      alert('Por favor, dibuja tu firma antes de continuar.');
      return;
    }
    const signatureData = signaturePadRef.current.toDataURL('image/png');
    onSave(signatureData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Firmar Contrato</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {contract?.contract_number || contract?.upya_id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8 text-center">
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Dibuja tu firma en el recuadro</h3>
            <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto">Al firmar este documento, aceptas los términos y condiciones del contrato de crédito de Bantos.</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600/5 rounded-3xl blur-xl group-hover:bg-blue-600/10 transition-all" />
            <div className="relative bg-white border-2 border-slate-100 rounded-[32px] p-2 shadow-inner">
              <canvas ref={canvasRef} className="w-full h-64 cursor-crosshair touch-none" />
              <button 
                onClick={handleClear}
                className="absolute bottom-6 right-6 p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                title="Limpiar firma"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Firma digital segura y encriptada</span>
          </div>
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button onClick={handleSign} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">Confirmar Firma</button>
        </div>
      </motion.div>
    </div>
  );
};

const InventoryView = ({ inventory }) => (
  <div className="space-y-8">
    <PageHeader title="Inventario" subtitle={`${inventory.length} activos técnicos`} />
    <Table cols={['Serial Number', 'Modelo', 'Estado']} rows={inventory} render={a => (<><td className="px-8 py-5 font-mono text-xs">{a.serial_number}</td><td className="px-8 py-5 text-slate-500">{a.model}</td><td className="px-8 py-5"><Badge status={a.status} /></td></>)} />
  </div>
);

const ACCEPTED_STATUSES = ['PAID', 'VALIDATED', 'ACCEPTED', 'ACEPTADO', 'PAGADO', 'VALIDADO'];
const FAILED_STATUSES = ['FAILED', 'FALLADO', 'REJECTED', 'CANCELED', 'RECHAZADO', 'CANCELADO', 'REVERSED'];
const UNASSIGNED_STATUSES = ['UNASSIGNED', 'NO ASIGNADO', 'PENDING_ASSIGNMENT', 'PENDIENTE', 'UNASSIGNED_PAYMENT'];
const FINAL_STATUSES = [...ACCEPTED_STATUSES]; // Solo los aceptados son finales/bloqueados ahora

const PaymentsView = ({ payments, onEdit, onCreate }) => {
  const [filter, setFilter] = useState('all');
  
  const filtered = payments.filter(p => {
    const s = (p.status || '').toUpperCase();
    if (filter === 'all') return true;
    if (filter === 'accepted') return ACCEPTED_STATUSES.includes(s);
    if (filter === 'unassigned') return UNASSIGNED_STATUSES.includes(s);
    if (filter === 'failed') return FAILED_STATUSES.includes(s);
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <PageHeader title="Pagos" subtitle={`${filtered.length} transacciones registradas`} />
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-10">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'accepted', label: 'Aceptados' },
            { id: 'unassigned', label: 'No Asignados' },
            { id: 'failed', label: 'Fallados' }
          ].map(f => (
            <button 
              key={f.id} 
              onClick={() => setFilter(f.id)} 
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={onCreate} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-all">
          <Plus size={16} /> Nuevo Pago
        </button>
      </div>

      <Table 
        cols={['Fecha', 'Contrato', 'Cliente', 'Monto', 'Método', 'Estado', 'Acciones']} 
        rows={filtered} 
        render={p => (
          <>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
              <p className="text-[10px] text-slate-400 font-medium">{p.payment_date ? new Date(p.payment_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
            </td>
            <td className="px-8 py-5">
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-black tracking-wider uppercase border border-slate-200">{p.contract_id || '—'}</span>
            </td>
            <td className="px-8 py-5">
              <p className="font-black text-slate-900 leading-tight">{p.client_name || '—'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">{p.client_number || 'S/N'}</span>
                {p.product_name && <span className="text-[10px] text-slate-400 font-bold">{p.product_name}</span>}
              </div>
            </td>
            <td className="px-8 py-5 font-black text-slate-900">${Number(p.amount || 0).toLocaleString()}</td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400"><CreditCard size={14} /></div>
                <span className="text-slate-600 font-medium">{p.method || '—'}</span>
              </div>
            </td>
            <td className="px-8 py-5"><Badge status={p.status} /></td>
            <td className="px-8 py-5">
              <button 
                onClick={() => onEdit(p)} 
                className={`p-2 rounded-lg transition-all ${FINAL_STATUSES.includes((p.status || '').toUpperCase()) ? 'text-slate-200 cursor-not-allowed' : 'hover:bg-blue-50 text-slate-300 hover:text-blue-600'}`}
                title={FINAL_STATUSES.includes((p.status || '').toUpperCase()) ? 'No se puede editar un pago ya aceptado' : 'Editar pago'}
              >
                <Settings2 size={16} />
              </button>
            </td>
          </>
        )} 
      />
    </div>
  );
};

const PaymentModal = ({ isOpen, onClose, payment, onSave, clients }) => {
  const [formData, setFormData] = useState({
    amount: 0, method: 'Transferencia', status: 'Pending', contract_id: '', client_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    account_number: '', card_holder: '', is_recurring: false, recurring_dates: []
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        ...payment,
        is_recurring: !!payment.is_recurring,
        payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        recurring_dates: payment.recurring_dates ? (typeof payment.recurring_dates === 'string' ? JSON.parse(payment.recurring_dates) : payment.recurring_dates) : []
      });
    } else {
      setFormData({
        amount: 0, method: 'Transferencia', status: 'Pending', contract_id: '', client_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        account_number: '', card_holder: '', is_recurring: false, recurring_dates: []
      });
    }
  }, [payment]);

  if (!isOpen) return null;

  const statusUpper = (formData.status || '').toUpperCase();
  const isReadOnly = FINAL_STATUSES.includes(statusUpper);
  const isAccepted = ACCEPTED_STATUSES.includes(statusUpper);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><CreditCard size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{payment ? (isReadOnly ? 'Detalle de Pago' : 'Editar Pago') : 'Nuevo Registro de Pago'}</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Gestión de Cobranza & Conciliación</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto grid grid-cols-2 gap-10">
          <div className="space-y-6">
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Información del Pago</p>
            
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2 space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Monto ($)</label>
                <input disabled={isReadOnly} type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Método</label>
                <select disabled={isReadOnly} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})}>
                  {['Transferencia', 'Tarjeta Crédito', 'Tarjeta Débito', 'Efectivo', 'Cheque', 'CLABE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
                <select disabled={isReadOnly} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {['Pending', 'Paid', 'Failed', 'Unassigned'].map(s => <option key={s} value={s}>{s === 'Pending' ? 'Pendiente' : s === 'Paid' ? 'Pagado/Aceptado' : s === 'Failed' ? 'Fallido' : 'No Asignado'}</option>)}
                </select>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de Pago</label>
                <input disabled={isReadOnly} type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} />
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Vincular Cliente</label>
                <select 
                  disabled={isReadOnly} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm appearance-none" 
                  value={formData.client_id || ''} 
                  onChange={e => setFormData({...formData, client_id: e.target.value})}
                >
                  <option value="">Seleccionar cliente...</option>
                  {(clients || []).map(c => (
                    <option key={c.upya_id} value={c.upya_id}>{c.name} ({c.client_number})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">ID Contrato / Upya</label>
                <input disabled={isReadOnly} type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-sm" value={formData.contract_id || ''} onChange={e => setFormData({...formData, contract_id: e.target.value})} placeholder="CTR-XXXX" />
              </div>
            </div>
 
            <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div onClick={() => !isReadOnly && setFormData({...formData, is_recurring: !formData.is_recurring})} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_recurring ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white'}`}>{!!formData.is_recurring && <CheckSquare size={14} />}</div>
                <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Habilitar Pago Recurrente</span>
              </label>
 
              {!!formData.is_recurring && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-blue-400 ml-1">Días de Recurrencia (Ej. 01, 15)</label>
                  <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 px-5 font-bold text-slate-800 text-sm" placeholder="Separados por coma" value={formData.recurring_dates.join(', ')} onChange={e => setFormData({...formData, recurring_dates: e.target.value.split(',').map(s => s.trim())})} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Datos de Cuenta / Tarjeta</p>
            
            <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 space-y-6">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Titular de la Cuenta</label>
                <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-sm" value={formData.card_holder || ''} onChange={e => setFormData({...formData, card_holder: e.target.value})} placeholder="Nombre como aparece en tarjeta" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Tarjeta / Cuenta / CLABE</label>
                <div className="relative">
                  <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-sm pr-12" value={formData.account_number || ''} onChange={e => setFormData({...formData, account_number: e.target.value})} placeholder="**** **** **** ****" />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300"><Box size={18} /></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Vencimiento</label>
                  <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 text-sm" placeholder="MM/YY" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">CVV</label>
                  <input disabled={isReadOnly} type="password" maxlength="4" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 text-sm" placeholder="***" />
                </div>
              </div>
            </div>

            {isReadOnly && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><ShieldCheck size={18} /></div>
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                  Este registro está <span className="font-black uppercase">Protegido</span>. 
                  Al estar en estado aceptado o pagado, no se permiten modificaciones para asegurar la integridad financiera.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 transition-all">Cerrar</button>
          <div className="flex-1" />
          {!isReadOnly && (
            <button onClick={() => onSave(formData)} className="px-14 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">
              {payment ? 'Actualizar Pago' : 'Registrar Solicitud'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const ProductsView = ({ products, onEdit, onCreate }) => {
  const [filter, setFilter] = useState('all');
  const filtered = products.filter(p => filter === 'all' || (filter === 'serialized' ? p.is_serialized : !p.is_serialized));
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <PageHeader title="Productos" subtitle={`${filtered.length} modelos en catálogo`} />
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-10">{['all', 'serialized', 'non-serialized'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f === 'all' ? 'Todos' : f === 'serialized' ? 'Serializados' : 'No Ser.'}</button>))}</div>
      </div>
      <div className="flex justify-end mb-4"><button onClick={onCreate} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"><Plus size={16} /> Nuevo Producto</button></div>
      <Table cols={['Nombre', 'Referencia', 'Categoría', 'Tipo', 'Acciones']} rows={filtered} render={p => (<><td className="px-8 py-5"><p className="font-bold text-slate-800">{p.name}</p><p className="text-[10px] text-slate-400 font-medium">{p.manufacturer}</p></td><td className="px-8 py-5 font-mono text-blue-600 text-xs">{p.reference || p.productReference}</td><td className="px-8 py-5 text-slate-500">{p.category}</td><td className="px-8 py-5"><span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${p.is_serialized ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{p.is_serialized ? 'Serializado' : 'No Ser.'}</span></td><td className="px-8 py-5"><button onClick={() => onEdit(p)} className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition-all"><Settings2 size={16} /></button></td></>)} />
    </div>
  );
};

const DataCollectionView = ({ collections, onEdit, onCreate }) => {
  const [filter, setFilter] = useState('onboarding');
  const filtered = collections.filter(c => c.category === filter);
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <PageHeader title="Colección de Datos" subtitle={`${filtered.length} flujos configurados`} />
        <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl mb-10">
          {['onboarding', 'standalone', 'client-linked'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end mb-4"><button onClick={onCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all"><Plus size={16} /> Nuevo Formulario</button></div>
      <Table cols={['Nombre del Flujo', 'Campos', 'Estado', 'Acciones']} rows={filtered} render={c => (<><td className="px-8 py-5 font-bold text-slate-800">{c.name}</td><td className="px-8 py-5 text-slate-400">{(c.questions_json || []).length} campos</td><td className="px-8 py-5"><Badge status={c.status} /></td><td className="px-8 py-5"><button onClick={() => onEdit(c)} className="p-2 hover:bg-emerald-50 text-slate-300 hover:text-emerald-600 rounded-lg transition-all"><Settings2 size={16} /></button></td></>)} />
    </div>
  );
};

const SyncView = ({ onSync, loading }) => (
  <div className="space-y-8">
    <PageHeader title="Sincronización" subtitle="Puente de Datos Upya ↔ Bantos" />
    <div className="bg-white p-16 rounded-[40px] border border-slate-100 shadow-sm text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-[28px] flex items-center justify-center mx-auto mb-8"><RefreshCw size={40} className={`text-blue-600 ${loading ? 'animate-spin' : ''}`} /></div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-3">Sincronización Maestra</h3>
      <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto">Descarga en cascada de Clientes, Contratos, Inventario y Formularios desde el entorno de producción Upya.</p>
      <button onClick={onSync} disabled={loading} className="bg-blue-600 text-white px-14 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50">{loading ? 'Descargando datos...' : 'Iniciar Sincronización'}</button>
    </div>
  </div>
);

const AuditView = ({ audit }) => (
  <div className="space-y-8">
    <PageHeader title="Auditoría" subtitle={`${audit.length} registros de trazabilidad operativa`} />
    <Table cols={['Fecha', 'Usuario', 'Tipo', 'ID Recurso', 'Estado']} rows={audit} render={r => (<><td className="px-8 py-5 text-slate-400 text-xs">{r.fecha_registro ? new Date(r.fecha_registro).toLocaleString('es-MX') : '—'}</td><td className="px-8 py-5 font-bold">{r.cliente || 'Sistema'}</td><td className="px-8 py-5 font-black text-[10px] uppercase tracking-wider text-blue-600">{r.tipo || 'SYNC'}</td><td className="px-8 py-5 font-mono text-slate-400 text-xs">{r.ref_contrato}</td><td className="px-8 py-5"><Badge status={r.estado} /></td></>)} />
  </div>
);

const TermsView = ({ deals }) => (
  <div className="space-y-8">
    <PageHeader 
      title="Términos & Condiciones (Deals)" 
      subtitle="Gobernanza de planes financieros y términos de venta de Upya" 
    />
    
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShieldCheck size={28} /></div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Planes PAYG</p>
          <p className="text-2xl font-black text-slate-800">{deals.filter(d => d.type === 'PAYG').length}</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><CreditCard size={28} /></div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instalments</p>
          <p className="text-2xl font-black text-slate-800">{deals.filter(d => d.type === 'INSTALMENTS').length}</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600"><Tag size={28} /></div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Planes</p>
          <p className="text-2xl font-black text-slate-800">{deals.length}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Listado de Términos (Homologado con Upya)</p>
      </div>
      <Table 
        cols={['Tipo', 'Nombre del Plan', 'Producto Asociado', 'Costo Total', 'Estado']} 
        rows={deals} 
        render={d => (
          <>
            <td className="px-8 py-5">
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${d.type === 'PAYG' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{d.type}</span>
            </td>
            <td className="px-8 py-5 font-bold text-slate-800">{d.name}</td>
            <td className="px-8 py-5 text-slate-500 text-sm">{d.product_name || 'N/A'}</td>
            <td className="px-8 py-5 font-mono text-xs text-blue-600">{d.total_cost || 'Open'}</td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-wider text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {d.status || 'Active'}
              </div>
            </td>
          </>
        )} 
      />
    </div>
  </div>
);

const OrganizationView = ({ structure }) => {
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState(null);
  
  const toggle = (id) => setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const renderLevel = (parentId = null, level = 0) => {
    const items = structure.filter(i => i.parent_id === parentId);
    if (items.length === 0) return null;

    return (
      <div className={`${level > 0 ? 'ml-10 border-l-2 border-slate-100 pl-6 mt-3' : 'space-y-4'}`}>
        {items.map(item => {
          const hasChildren = structure.some(i => i.parent_id === item.upya_id);
          const isExpanded = expanded.includes(item.upya_id);
          const isSelected = selected?.upya_id === item.upya_id;
          
          const icons = {
            Country: Globe,
            Organisation: Building2,
            Branch: MapPin,
            Shop: Store
          };
          const Icon = icons[item.type] || Building2;

          return (
            <div key={item.upya_id} className="group">
              <div 
                onClick={() => {
                  if (hasChildren) toggle(item.upya_id);
                  setSelected(item);
                }}
                className={`flex items-center gap-4 p-4 rounded-[20px] transition-all cursor-pointer ${
                  isSelected ? 'bg-blue-50 border-blue-200 border shadow-sm' : 
                  level === 0 ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  item.type === 'Country' ? 'bg-blue-600 text-white' :
                  item.type === 'Organisation' ? 'bg-emerald-500 text-white' :
                  item.type === 'Branch' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{item.type}</p>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{item.name}</p>
                </div>
                {hasChildren && (
                  <div className={`p-1.5 rounded-lg transition-all ${isExpanded ? 'text-slate-900 rotate-180' : 'text-slate-300'}`}>
                    <ChevronDown size={16} />
                  </div>
                )}
              </div>
              {isExpanded && renderLevel(item.upya_id, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-10">
      <PageHeader title="Estructura Organizacional" subtitle="Jerarquía de operaciones y puntos de venta sincronizada con Upya" />
      
      <div className="flex gap-10 items-start">
        {/* Tree Sidebar */}
        <div className="flex-1 max-w-2xl">
          <div className="bg-slate-100/50 p-6 rounded-[32px] border border-slate-200/50">
            {renderLevel(null)}
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-96 sticky top-8">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div 
                key={selected.upya_id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden"
              >
                <div className={`p-8 ${
                  selected.type === 'Country' ? 'bg-blue-600' :
                  selected.type === 'Organisation' ? 'bg-emerald-600' :
                  selected.type === 'Branch' ? 'bg-amber-600' : 'bg-slate-700'
                } text-white`}>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{selected.type}</p>
                  <h4 className="text-2xl font-black tracking-tighter leading-tight">{selected.name}</h4>
                </div>
                
                <div className="p-8 space-y-6">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Identificación</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System ID</p>
                        <p className="text-xs font-mono font-bold text-slate-800">{selected.entity_number || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">External ID</p>
                        <p className="text-xs font-mono font-bold text-slate-800">{selected.external_id || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Información Legal</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrador</p>
                        <p className="text-xs font-bold text-slate-800">{selected.administrator || 'No asignado'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={14} /></div>
                        <p className="text-xs font-bold text-slate-600">{selected.email || 'Sin correo'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Smartphone size={14} /></div>
                        <p className="text-xs font-bold text-slate-600">{selected.mobile || 'Sin teléfono'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Ubicación</p>
                    <div className="flex gap-3">
                      <div className="p-2 bg-slate-50 rounded-lg text-slate-400 shrink-0"><MapPin size={14} /></div>
                      <p className="text-xs font-bold text-slate-600 leading-relaxed">{selected.address || 'Sin dirección registrada'}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-200 mx-auto mb-4 border border-slate-100">
                  <Database size={24} />
                </div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Selecciona una entidad para ver detalles</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const ActionsView = ({ onNavigate }) => {
  // Replicando los datos de la imagen
  const incompleteActions = [
    { id: '1776283487910', date: 'Apr 15, 2026, 02:04 PM', action: 'Nuevo Cliente', clientName: 'Juan lora', reportNumber: '1776283487910' },
    { id: '1774625055001', date: 'Mar 27, 2026, 09:24 AM', action: 'Nuevo Cliente', clientName: 'Adriano Melo', reportNumber: '1774625055001' },
    { id: '1774624488645', date: 'Mar 27, 2026, 09:14 AM', action: 'Nuevo Cliente', clientName: 'Adriano Melo', reportNumber: '1774624488645' },
    { id: '1774548847669', date: 'Mar 26, 2026, 12:14 PM', action: 'Nuevo Cliente', clientName: 'ecec edcec', reportNumber: '1774548847669' }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* New action Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Nueva acción</h2>
          <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 text-slate-400 transition-colors bg-white shadow-sm">
            <RefreshCw size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <button onClick={() => onNavigate('Nuevo Cliente')} className="bg-white hover:bg-slate-50 hover:border-blue-200 hover:shadow-md transition-all p-6 rounded-[24px] flex items-center gap-5 text-slate-800 text-left border border-slate-100 shadow-sm group">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="font-bold text-lg">Nuevo Cliente</span>
          </button>
          <button onClick={() => onNavigate('Detalles del plan')} className="bg-white hover:bg-slate-50 hover:border-blue-200 hover:shadow-md transition-all p-6 rounded-[24px] flex items-center gap-5 text-slate-800 text-left border border-slate-100 shadow-sm group">
            <div className="w-14 h-14 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <FileText size={24} />
            </div>
            <span className="font-bold text-lg">Detalles del plan</span>
          </button>
        </div>
      </div>

      {/* Incomplete actions Section */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6 pb-4 border-b border-slate-100">Acciones incompletas</h2>
        
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client name</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Report number</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {incompleteActions.map((item, i) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{item.date}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-800">{item.action}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-600">{item.clientName}</td>
                  <td className="px-8 py-5 text-sm font-mono text-slate-400">{item.reportNumber}</td>
                  <td className="px-8 py-5 flex items-center justify-end gap-3">
                    <button onClick={() => onNavigate(item.action, item)} className="flex items-center gap-2 bg-slate-100 hover:bg-blue-600 hover:text-white hover:shadow-md text-blue-600 font-bold px-5 py-2.5 rounded-xl transition-all text-xs">
                      <ClipboardCheck size={16} /> Completar ahora
                    </button>
                    <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ActionFormView = ({ actionType, prefillData, onBack, deals, products }) => {
  const [selectedDeal, setSelectedDeal] = useState(deals && deals.length > 0 ? deals[0].upya_id : '');
  const [currentStep, setCurrentStep] = useState(1);
  
  const steps = actionType === 'Detalles del plan' 
    ? ['Selección de Plan', 'Resumen Financiero'] 
    : ['Dispositivos', 'Información personal', 'Contactos', 'Documentos', 'Contrato', 'Firma'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all text-slate-500">
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Completar: {actionType}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {prefillData ? `Reporte #${prefillData.reportNumber} - Cliente: ${prefillData.clientName}` : 'Iniciando nueva recolección'}
            </p>
          </div>
        </div>
        {prefillData && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-sm flex items-center gap-2">
            <Clock size={16} /> En progreso (Borrador)
          </div>
        )}
      </div>

      <div className="flex gap-8">
        {/* Sidebar: Progress Stepper */}
        <div className="w-1/4 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 self-start sticky top-8">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Progreso del Formulario</h3>
          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={step} className="flex gap-4 cursor-pointer" onClick={() => setCurrentStep(idx + 1)}>
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${currentStep > idx + 1 ? 'bg-emerald-500 text-white' : currentStep === idx + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                    {currentStep > idx + 1 ? <CheckSquare size={14} /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && <div className={`w-0.5 h-10 mt-2 ${currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
                </div>
                <div className="mt-1">
                  <p className={`text-sm font-bold ${currentStep === idx + 1 ? 'text-blue-600' : currentStep > idx + 1 ? 'text-slate-800' : 'text-slate-400'}`}>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Form Inputs */}
        <div className="w-3/4 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10 flex flex-col min-h-[600px]">
          <div className="flex-1 space-y-8">
            <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">{steps[currentStep - 1]}</h3>
            
            {actionType === 'Detalles del plan' ? (
              <div className="grid grid-cols-2 gap-8">
                {currentStep === 1 && (
                  <div className="col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Términos y Condiciones (Deal)</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800" value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)}>
                      {deals && deals.length > 0 ? deals.map(d => <option key={d.upya_id} value={d.upya_id}>{d.name} ({d.type})</option>) : <option>Sin planes disponibles</option>}
                    </select>
                  </div>
                )}
                
                {currentStep === 2 && deals && selectedDeal && (
                  <div className="col-span-2 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 grid grid-cols-3 gap-6">
                    {(() => {
                      const deal = deals.find(d => d.upya_id === selectedDeal);
                      if (!deal) return null;
                      return (
                        <>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Costo Total</p>
                            <p className="text-2xl font-black text-indigo-900">${deal.total_cost || '0'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Duración (Meses)</p>
                            <p className="text-2xl font-black text-indigo-900">{deal.duration_months || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Requiere Depósito</p>
                            <p className="text-2xl font-black text-indigo-900">{deal.deposit_required ? 'Sí' : 'No'}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              /* Flujo General: 6 Secciones */
              <div className="grid grid-cols-2 gap-8">
                {currentStep === 1 && ( /* Dispositivos */
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Modelo del Dispositivo / Producto</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800">
                        {products && products.length > 0 ? (
                          products.map(p => <option key={p.upya_id} value={p.name}>{p.name}</option>)
                        ) : (
                          <>
                            <option>Kit Solar Básico 50W</option>
                            <option>Kit Solar Plus 100W</option>
                            <option>Refrigerador Solar 12V</option>
                          </>
                        )}
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Número de Serie o Token PayG</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Ej. A1B2C3D4E5" />
                    </div>
                    <div className="col-span-2">
                      <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-blue-800">
                        <Smartphone size={24} />
                        <span className="font-bold text-sm">Escanea el código de barras en el empaque para autocompletar la serie.</span>
                      </div>
                    </div>
                  </>
                )}
                {currentStep === 2 && ( /* Información personal */
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Nombre(s)</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" defaultValue={prefillData?.clientName?.split(' ')[0] || ''} placeholder="Ej. Juan" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Apellidos</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" defaultValue={prefillData?.clientName?.split(' ').slice(1).join(' ') || ''} placeholder="Ej. Lora" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Fecha de Nacimiento</label>
                      <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Género</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800">
                        <option>Femenino</option><option>Masculino</option><option>Otro</option>
                      </select>
                    </div>
                  </>
                )}
                {currentStep === 3 && ( /* Contactos */
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Teléfono Principal (Móvil)</label>
                      <input type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="+52 ..." />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Teléfono de Emergencia/Referencia</label>
                      <input type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="+52 ..." />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Dirección de Residencia</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800 min-h-[100px]" placeholder="Calle, Número, Colonia, Ciudad, Estado, C.P."></textarea>
                    </div>
                  </>
                )}
                {currentStep === 4 && ( /* Documentos */
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Identificación</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800">
                        <option>INE / IFE</option><option>Pasaporte</option><option>Cédula Profesional</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Número de Documento</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Ej. 0000111122223" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Captura Identificación (Frente)</label>
                      <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
                        <div className="text-center"><Box size={24} className="mx-auto mb-2" /><span className="text-sm font-bold">Tomar Foto</span></div>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Captura Comprobante Domicilio</label>
                      <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer">
                        <div className="text-center"><FileText size={24} className="mx-auto mb-2" /><span className="text-sm font-bold">Tomar Foto</span></div>
                      </div>
                    </div>
                  </>
                )}
                {currentStep === 5 && ( /* Contrato */
                  <>
                    <div className="col-span-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Términos de Pago Asociados</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800">
                        {deals && deals.length > 0 ? deals.map(d => <option key={d.upya_id} value={d.upya_id}>{d.name}</option>) : <option>Sin planes</option>}
                      </select>
                    </div>
                    <div className="col-span-2 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300" defaultChecked />
                      <div>
                        <p className="font-bold text-slate-800">Aceptación de Contrato</p>
                        <p className="text-sm text-slate-500">Confirmo que he explicado al cliente los términos de pago, penalizaciones por mora y condiciones de uso del servicio. El cliente acepta continuar.</p>
                      </div>
                    </div>
                  </>
                )}
                {currentStep === 6 && ( /* Firma */
                  <div className="col-span-2 space-y-6 text-center">
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">Firma Digital del Cliente</p>
                    <div className="w-full h-48 bg-slate-50 border-2 border-dashed border-slate-300 rounded-3xl relative flex flex-col items-center justify-center text-slate-400">
                      <Edit size={32} className="mb-2 opacity-50" />
                      <span>El cliente debe firmar aquí</span>
                      <button className="absolute bottom-4 right-4 text-xs font-bold text-slate-500 hover:text-slate-800">Limpiar Firma</button>
                    </div>
                    <div>
                      <input type="text" className="w-64 mx-auto px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800 text-center" placeholder="Aclaración de firma" defaultValue={prefillData?.clientName || ''} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-center">
            <button onClick={onBack} className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold transition-colors">Guardar Borrador y Salir</button>
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(currentStep - 1)} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors">Atrás</button>
              )}
              {currentStep < steps.length ? (
                <button onClick={() => setCurrentStep(currentStep + 1)} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-white font-bold rounded-2xl transition-all">Siguiente</button>
              ) : (
                <button onClick={onBack} className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white font-bold rounded-2xl transition-all flex items-center gap-2">
                  <CheckSquare size={20} /> Finalizar y Enviar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionModal = ({ open, onClose, onSave, action = null }) => {
  const [formData, setFormData] = useState({
    description: '',
    type: 'Soporte',
    status: 'Pendiente',
    assigned_to: 'Armando Afa',
    due_date: '',
    client_id: '',
    contract_id: ''
  });

  useEffect(() => {
    if (action) {
      setFormData({
        description: action.description || '',
        type: action.type || 'Soporte',
        status: action.status || 'Pendiente',
        assigned_to: action.assigned_to || '',
        due_date: action.due_date ? new Date(action.due_date).toISOString().split('T')[0] : '',
        client_id: action.client_id || '',
        contract_id: action.contract_id || ''
      });
    } else {
      setFormData({ description: '', type: 'Soporte', status: 'Pendiente', assigned_to: '', due_date: '', client_id: '', contract_id: '' });
    }
  }, [action]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Zap size={20} /></div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{action ? 'Editar Acción' : 'Nueva Acción'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Descripción / Asunto</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ej. Revisar instalación..." />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option>Soporte</option><option>Mantenimiento</option><option>Cobranza</option><option>Instalación</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option>Pendiente</option><option>En Proceso</option><option>Completado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Asignado a</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} placeholder="Nombre del agente" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Fecha Límite</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 font-bold rounded-xl transition-colors">Cancelar</button>
          <button onClick={() => { onSave(formData); onClose(); }} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors shadow-md">Guardar Acción</button>
        </div>
      </div>
    </div>
  );
};

const PlaceholderView = ({ title, subtitle }) => (
  <div className="space-y-8">
    <PageHeader title={title} subtitle={subtitle} />
    <div className="bg-white p-20 rounded-[40px] border border-slate-100 shadow-sm text-center">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6"><Zap size={32} className="text-slate-200" /></div>
      <p className="text-slate-300 font-black uppercase tracking-widest text-sm">Módulo en preparación</p>
    </div>
  </div>
);

// --- APP PRINCIPAL ---
const App = () => {
  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem('bantos_session')); } catch { return null; } });
  const [view, setView] = useState('manage-dashboard');
  const [expandedMenus, setExpandedMenus] = useState(['setup', 'records']);
  const [summary, setSummary] = useState({ totalClients: 0, totalContracts: 0, totalInventory: 0, totalProducts: 0, totalDataCollections: 0, totalPaid: 0 });
  const [data, setData] = useState({ clients: [], contracts: [], inventory: [], payments: [], products: [], paymentPlans: [], orgStructure: [], actions: [], audit: [], dataCollections: [] });
  const [syncing, setSyncing] = useState(false);
  const [modalState, setModalState] = useState({ type: null, open: false, item: null });
  const [actionFormState, setActionFormState] = useState({ open: false, actionType: null, prefillData: null });

  const refreshData = useCallback(async () => {
    if (!session) return;
    try {
      const [sumRes, cliRes, conRes, invRes, payRes, proRes, ppRes, orgRes, actRes, dcRes, audRes] = await Promise.allSettled([
        axios.get(`${API}/backoffice/summary`),
        axios.get(`${API}/backoffice/clients`),
        axios.get(`${API}/backoffice/contracts`),
        axios.get(`${API}/backoffice/inventory`),
        axios.get(`${API}/backoffice/payments`),
        axios.get(`${API}/backoffice/products`),
        axios.get(`${API}/backoffice/payment-plans`),
        axios.get(`${API}/backoffice/org-structure`),
        axios.get(`${API}/backoffice/actions`),
        axios.get(`${API}/backoffice/data-collections`),
        axios.get(`${API}/backoffice/audit`),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data);
      setData({
        clients: cliRes.status === 'fulfilled' ? cliRes.value.data : [],
        contracts: conRes.status === 'fulfilled' ? conRes.value.data : [],
        inventory: invRes.status === 'fulfilled' ? invRes.value.data : [],
        payments: payRes.status === 'fulfilled' ? payRes.value.data : [],
        products: proRes.status === 'fulfilled' ? proRes.value.data : [],
        paymentPlans: ppRes.status === 'fulfilled' ? ppRes.value.data : [],
        orgStructure: orgRes.status === 'fulfilled' ? orgRes.value.data : [],
        actions: actRes.status === 'fulfilled' ? actRes.value.data : [],
        dataCollections: dcRes.status === 'fulfilled' ? dcRes.value.data : [],
        audit: audRes.status === 'fulfilled' ? audRes.value.data : [],
      });
    } catch (e) { console.error(e); }
  }, [session]);

  useEffect(() => { refreshData(); }, [view, refreshData]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await axios.post(`${API}/sync/bootstrap`, { username: session.user.username, password: session.user.password });
      await refreshData();
      alert(`✅ Sincronización exitosa\n• Clientes: ${res.data.clients}\n• Contratos: ${res.data.contracts}\n• Productos: ${res.data.products}\n• Colecciones: ${res.data.dataCollections}\n• Pagos: ${res.data.payments}`);
    } catch { alert('Error de conexión'); }
    finally { setSyncing(false); }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      if (modalState.item) {
        await axios.put(`${API}/backoffice/payments/${modalState.item.upya_id}`, paymentData);
      } else {
        await axios.post(`${API}/backoffice/payments`, paymentData);
      }
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar el pago');
    }
  };

  const handleSaveContract = async (contractData, mode = false) => {
    try {
      const id = modalState.item?.upya_id;
      if (mode === true) { // Import
        await axios.post(`${API}/backoffice/contracts/import-and-sign`, contractData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (mode === 'generate') { // Generate from form
        await axios.post(`${API}/backoffice/contracts/generate-and-sign`, contractData);
      } else {
        if (id) {
          await axios.put(`${API}/backoffice/contracts/${id}`, contractData);
        } else {
          await axios.post(`${API}/backoffice/contracts`, contractData);
        }
      }
      setModalState({ type: null, open: false, item: null });
      await refreshData();
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Error al guardar el contrato');
    }
  };

  const handleSaveSignature = async (signatureData) => {
    try {
      const id = modalState.item?.upya_id;
      await axios.post(`${API}/backoffice/contracts/${id}/sign`, { signatureData });
      setModalState({ type: null, open: false, item: null });
      await refreshData();
      alert('✅ Contrato firmado exitosamente');
    } catch (e) {
      alert(e.response?.data?.error || 'Error al firmar el contrato');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const payload = { username: session.user.username, password: session.user.password, productData };
      if (modalState.item) await axios.put(`${API}/backoffice/products/${modalState.item.upya_id}`, payload);
      else await axios.post(`${API}/backoffice/products`, payload);
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) { alert(e.message); }
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      const payload = { username: session.user.username, password: session.user.password, collectionData };
      if (modalState.item) await axios.put(`${API}/backoffice/data-collections/${modalState.item.upya_id}`, payload);
      else await axios.post(`${API}/backoffice/data-collections`, payload);
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) { alert(e.message); }
  };

  const handleSaveAction = async (formData) => {
    try {
      if (modalState.item) {
        await axios.put(`${API}/backoffice/actions/${modalState.item.upya_id}`, formData);
      } else {
        await axios.post(`${API}/backoffice/actions`, formData);
      }
      refreshData();
    } catch (e) {
      console.error('Error saving action:', e);
      alert('Error al guardar la acción');
    }
  };

  const handleNewContract = () => {
    console.log('Opening modal...');
    setModalState({ type: 'contract', open: true, item: null });
  };

  if (!session) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-[440px] bg-white rounded-[48px] p-14 shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-600/40"><ShieldCheck size={32} /></div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Bantos</h1>
        <p className="text-blue-600 font-black text-[11px] uppercase tracking-widest mb-10">Data Center</p>
        <div className="space-y-4">
          <input id="u" type="text" placeholder="Usuario" defaultValue="armando.afa" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
          <input id="p" type="password" placeholder="Contraseña" defaultValue="123456!" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
          <button onClick={async (e) => { 
            e.preventDefault();
            const u = document.getElementById('u').value; 
            const p = document.getElementById('p').value; 
            try {
              const btn = e.currentTarget;
              btn.innerText = 'Autenticando...';
              btn.disabled = true;
              const res = await axios.post(`${API}/backoffice/auth`, { username: u, password: p });
              if (res.data.success) {
                const s = { user: { username: u, password: p } }; 
                localStorage.setItem('bantos_session', JSON.stringify(s)); 
                setSession(s); 
              }
            } catch (err) {
              alert('Credenciales incorrectas o denegadas por Upya.');
              e.currentTarget.innerText = 'Acceder';
              e.currentTarget.disabled = false;
            }
          }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 transition-all">Acceder</button>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { section: 'Operación', items: [
      { id: 'manage-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'setup', label: 'Setup', icon: Settings2, children: [
        { id: 'setup-products', label: 'Productos', icon: Tag },
        { id: 'setup-data-collection', label: 'Colección de datos', icon: Database },
        { id: 'setup-terms', label: 'Términos & Condiciones', icon: ShieldCheck },
        { id: 'setup-templates', label: 'Plantillas', icon: FileText },
        { id: 'setup-org', label: 'Organización', icon: Building2 },
        { id: 'setup-users', label: 'Usuarios', icon: Users },
      ]},
      { id: 'records', label: 'Registro', icon: BookOpen, children: [
        { id: 'record-actions', label: 'Acciones', icon: Zap },
        { id: 'record-todos', label: 'To-Dos', icon: CheckSquare },
        { id: 'manage-clients', label: 'Clientes', icon: Users },
        { id: 'manage-contracts', label: 'Contratos', icon: FileText },
        { id: 'manage-inventory', label: 'Inventario', icon: Box },
        { id: 'record-comms', label: 'Comunicaciones', icon: MessageSquare },
        { id: 'manage-payments', label: 'Pagos', icon: CreditCard },
      ]},
      { id: 'manage-audit', label: 'Auditoría', icon: Clock },
    ]},
    { section: 'Estructura', items: [ { id: 'setup-system', label: 'Sincronización', icon: RefreshCw }, { id: 'setup-messaging', label: 'Mensajería', icon: Mail }, { id: 'setup-config', label: 'Sistema', icon: Settings2 } ]},
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-8 shrink-0">
        <div className="flex items-center gap-3 mb-10"><div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30"><ShieldCheck size={22} /></div><div className="leading-none"><p className="font-black text-slate-900 text-base tracking-tight">Bantos</p><p className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Data Center</p></div></div>
        <nav className="flex-1 space-y-6 overflow-y-auto">
          {navItems.map(({ section, items }) => (
            <div key={section}>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300 px-4 mb-3">{section}</p>
              <div className="space-y-0.5">{items.map(({ id, label, icon: Icon, children }) => (
                <div key={id} className="space-y-1">
                  <button onClick={() => { if (children) { setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]); } else { setView(id); } }} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${view === id || (children && children.some(c => c.id === view)) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <div className="flex items-center gap-3"><Icon size={18} /> {label}</div>
                    {children && (expandedMenus.includes(id) ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />)}
                  </button>
                  {children && expandedMenus.includes(id) && (<div className="ml-4 pl-4 border-l border-slate-100 space-y-1 mt-1">{children.map(child => (<button key={child.id} onClick={() => setView(child.id)} className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg font-bold text-[12px] transition-all ${view === child.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}><child.icon size={14} /> {child.label}</button>))}</div>)}
                </div>
              ))}</div>
            </div>
          ))}
        </nav>
        <button onClick={() => { localStorage.removeItem('bantos_session'); window.location.reload(); }} className="mt-8 flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-sm hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><LogOut size={18} /> Salir</button>
      </aside>

      <main className="flex-1 overflow-y-auto p-12">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            {view === 'manage-dashboard' && <DashboardView summary={summary} />}
            {view === 'manage-clients' && <ClientsView clients={data.clients} />}
            {view === 'manage-contracts' && (
              <ContractsView 
                contracts={data.contracts} 
                onNew={handleNewContract}
                onEdit={(c) => setModalState({ type: 'contract', open: true, item: c })} 
                onSign={(c) => setModalState({ type: 'signature', open: true, item: c })}
              />
            )}
            {view === 'manage-inventory' && <InventoryView inventory={data.inventory} />}
            {view === 'manage-audit' && <AuditView audit={data.audit} />}
            {view === 'setup-system' && <SyncView onSync={handleSync} loading={syncing} />}
            {view === 'setup-products' && <ProductsView products={data.products} onEdit={(p) => setModalState({ type: 'product', open: true, item: p })} onCreate={() => setModalState({ type: 'product', open: true, item: null })} />}
            {view === 'setup-data-collection' && <DataCollectionView collections={data.dataCollections} onEdit={(c) => setModalState({ type: 'collection', open: true, item: c })} onCreate={() => setModalState({ type: 'collection', open: true, item: null })} />}
            {view === 'setup-terms' && <TermsView deals={data.paymentPlans} />}
            {view === 'setup-org' && <OrganizationView structure={data.orgStructure} />}
            
            {/* Navigational state for Actions Form vs List */}
            {view === 'record-actions' && !actionFormState.open && (
              <ActionsView onNavigate={(actionType, prefillData = null) => setActionFormState({ open: true, actionType, prefillData })} />
            )}
              {view === 'record-actions' && actionFormState.open && (
                <ActionFormView actionType={actionFormState.actionType} prefillData={actionFormState.prefillData} deals={data.paymentPlans} products={data.products} onBack={() => setActionFormState({ open: false, actionType: null, prefillData: null })} />
              )}

            {view === 'manage-payments' && <PaymentsView payments={data.payments} onEdit={(p) => setModalState({ type: 'payment', open: true, item: p })} onCreate={() => setModalState({ type: 'payment', open: true, item: null })} />}
            
            {/* Fallbacks */}
            {['setup-templates', 'setup-users', 'record-todos', 'record-comms'].includes(view) && (
              <PlaceholderView 
                title={navItems.flatMap(n => n.items).flatMap(i => [i, ...(i.children || [])]).find(x => x.id === view)?.label || 'Módulo'} 
                subtitle="Funcionalidad programada para la siguiente fase" 
              />
            )}
          </motion.div>
        </AnimatePresence>

        <ProductModal open={modalState.open && modalState.type === 'product'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveProduct} product={modalState.item} />
        <DataCollectionModal open={modalState.open && modalState.type === 'collection'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveCollection} collection={modalState.item} />
        <ActionModal open={modalState.open && modalState.type === 'action'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveAction} action={modalState.item} />
        <PaymentModal isOpen={modalState.open && modalState.type === 'payment'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSavePayment} payment={modalState.item} clients={data.clients} />
        <ContractModal isOpen={modalState.open && modalState.type === 'contract'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveContract} contract={modalState.item} clients={data.clients} products={data.products} />
        <SignatureModal isOpen={modalState.open && modalState.type === 'signature'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveSignature} contract={modalState.item} />
      </main>
    </div>
  );
};

export default App;
