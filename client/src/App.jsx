import React, { useState, useEffect, useCallback, useRef } from 'react';
import SignaturePad from 'signature_pad';
import {
  LayoutDashboard, Users, FileText, Box, Clock, CreditCard,
  Tag, Mail, Smartphone, Settings2, ShieldCheck, Search,
  LogOut, RefreshCw, TrendingUp, DollarSign, Plus, Package,
  ChevronDown, ChevronRight, Database, Building2, Globe, MapPin, Store, Edit, X, Trash2,
  BookOpen, Zap, CheckSquare, MessageSquare, ListTodo, ClipboardCheck,
  Upload, PenTool, Send, AlertCircle, Printer, Activity, Menu, Calendar,
  FileSpreadsheet, Check, Eye, EyeOff, MoreVertical, Lock, Unlock, Ban, CheckCircle2, Bell, KeyRound, ShieldAlert,
  Camera, Copy, QrCode, ExternalLink, ArrowRightLeft, RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import SupportAgent from './SupportAgent';
import MessagingSetup from './MessagingSetup';
import ConfigSetup from './ConfigSetup';
import { generateContractHTML, generateVoucherHTML } from './utils/pdf-templates.js';

const loadXLSXLib = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) return resolve(window.XLSX);
    const existingScript = document.getElementById('xlsx-cdn-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.XLSX));
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }
    const script = document.createElement('script');
    script.id = 'xlsx-cdn-script';
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = () => resolve(window.XLSX);
    script.onerror = (err) => reject(new Error('No se pudo cargar la librería de lectura de Excel desde CDN.'));
    document.head.appendChild(script);
  });
};

class ViewErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("View Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-red-600 space-y-3 text-center my-6">
          <h3 className="text-lg font-bold">Ocurrió un error al cargar este módulo</h3>
          <p className="text-xs font-mono bg-white p-3 rounded-xl border border-red-200">{String(this.state.error)}</p>
          <button onClick={() => this.setState({ hasError: false })} className="px-6 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md hover:bg-red-700">Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const API = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:4000/api' : 'https://bantos.cloud/datacenter-api');

// --- Componentes Compartidos ---
const Badge = ({ status }) => {
  const s = (status || '').toUpperCase();
  const ok = ['ACTIVE', 'SIGNED', 'PAID', 'READY', 'ENABLED', 'VALIDATED', 'FIRMADO'].includes(s);
  const pending = ['PENDING', 'PENDIENTE', 'LOCKED'].includes(s);
  const rejected = ['REJECTED', 'NO APROBADO', 'CANCELLED'].includes(s);

  let label = status;
  if (s === 'LOCKED') label = 'PENDIENTE';
  
  let colorClass = 'bg-blue-100 text-blue-700';
  if (ok) colorClass = 'bg-emerald-100 text-emerald-700';
  if (pending) colorClass = 'bg-amber-100 text-amber-700';
  if (rejected) colorClass = 'bg-red-100 text-red-700';

  return (
    <span className={`px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest ${colorClass}`}>
      {label}
    </span>
  );
};

const Table = ({ cols, rows, render, renderMobile }) => (
  <>
    <div className={`bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm ${renderMobile ? 'hidden md:block' : ''}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[15px] font-bold text-slate-800 whitespace-nowrap min-w-max">
          <thead className="bg-slate-50 border-b border-slate-100 text-[12px] font-black uppercase tracking-widest text-slate-400">
            <tr>{cols.map(c => <th key={c} className="px-8 py-6">{c}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={cols.length} className="px-8 py-16 text-center text-slate-300 font-black uppercase tracking-widest text-[12px]">Sin datos — Ejecuta la Sincronización</td></tr>
              : rows.map((row, i) => <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-all">{render(row)}</tr>)
            }
          </tbody>
        </table>
      </div>
    </div>
    {renderMobile && (
      <div className="md:hidden space-y-4 pb-8">
        {rows.length === 0
          ? <div className="p-5 md:p-8 text-center bg-white rounded-2xl border border-slate-100 text-slate-300 font-black uppercase tracking-widest text-[12px]">Sin datos</div>
          : rows.map((row, i) => <div key={i}>{renderMobile(row)}</div>)
        }
      </div>
    )}
  </>
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

const matchesProduct = (invModel, prodName) => {
  if (!invModel || !prodName) return false;
  const iM = invModel.toLowerCase();
  const pN = prodName.toLowerCase();
  if (iM === pN) return true;
  if (iM.includes(pN) || pN.includes(iM)) return true;
  
  const extractWords = (str) => str.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  const iMWords = extractWords(iM);
  const pNWords = extractWords(pN);
  
  const intersection = iMWords.filter(w => pNWords.includes(w));
  return intersection.length >= 2 && intersection.some(w => /\d/.test(w));
};

const ProductInput = ({ label, value, type = 'text', onChange, readOnly }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <input type={type} className={`w-full ${readOnly ? 'bg-slate-100/50 cursor-not-allowed text-slate-500' : 'bg-slate-50'} border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base`} value={value !== undefined && value !== null ? value : ''} onChange={onChange} readOnly={readOnly} />
  </div>
);

const SelectableOrCustomInput = ({ label, value, options = [], onChange, placeholder = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOption = (opt) => {
    onChange({ target: { value: opt } });
    setIsOpen(false);
  };

  const allOptions = Array.from(new Set(options.filter(Boolean)));

  return (
    <div className="space-y-1.5 relative" ref={containerRef}>
      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <input 
          type="text" 
          placeholder={placeholder || `Seleccionar o escribir ${label.toLowerCase()}...`}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 pl-5 pr-10 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" 
          value={value !== undefined && value !== null ? value : ''} 
          onChange={(e) => {
            onChange(e);
            setIsOpen(true);
          }} 
          onFocus={() => setIsOpen(true)}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
        >
          <ChevronDown size={18} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border-2 border-slate-100 rounded-2xl shadow-xl max-h-52 overflow-y-auto py-2">
          {allOptions.length > 0 ? (
            allOptions.map((opt, idx) => (
              <div
                key={idx}
                onClick={() => handleSelectOption(opt)}
                className={`px-5 py-2.5 font-bold text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center justify-between ${value === opt ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}
              >
                <span>{opt}</span>
                {value === opt && <Check size={16} className="text-blue-600" />}
              </div>
            ))
          ) : (
            <div className="px-5 py-3 text-xs text-slate-400 font-bold">
              {value ? `Escribe o guarda para registrar "${value}" como nuevo ${label.toLowerCase()}` : `No hay ${label.toLowerCase()}s guardados previamente. Escribe uno nuevo.`}
            </div>
          )}

          {value && !allOptions.includes(value) && (
            <div 
              onClick={() => handleSelectOption(value)}
              className="border-t border-slate-100 mt-1 pt-2 px-5 py-2 text-xs font-black text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-1.5"
            >
              <Plus size={14} /> Usar "{value}" como nuevo {label.toLowerCase()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const cleanHistoryList = (list) => {
  const cleanList = Array.from(new Set(list.filter(Boolean).map(x => typeof x === 'string' ? x.trim() : x)));
  return cleanList.filter(item => {
    // Filtrar caracteres parciales escritos tecla a tecla (ej: "Color N", "Color Ne", "Color Neg")
    const isMidWordPartial = cleanList.some(other => {
      if (other === item || !other.startsWith(item)) return false;
      const remainder = other.slice(item.length);
      return !remainder.startsWith(' ');
    });
    return !isMidWordPartial;
  });
};

const saveToCatalogHistory = (key, val) => {
  if (!val || typeof val !== 'string' || !val.trim()) return;
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    const cleaned = val.trim();
    if (!list.includes(cleaned)) {
      list.push(cleaned);
      localStorage.setItem(key, JSON.stringify(cleanHistoryList(list)));
    }
  } catch (e) {}
};

const getCatalogHistory = (key, initialItems = []) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    const combined = cleanHistoryList([...saved, ...initialItems]);
    return combined.sort();
  } catch (e) {
    return cleanHistoryList(initialItems).sort();
  }
};

// --- MODAL DE PRODUCTO ---
const ProductModal = ({ isOpen, onClose, product, onSave, session, inventory = [], products = [], users = [], onAddInventory, onEditInventory, refreshData }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [isAddImeiOpen, setIsAddImeiOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignSellerId, setAssignSellerId] = useState('');
  const [editingInventoryItem, setEditingInventoryItem] = useState(null);
  const [newImei, setNewImei] = useState('');
  const [newVariant, setNewVariant] = useState('');
  const [imeiError, setImeiError] = useState('');
  const [isSubmittingImei, setIsSubmittingImei] = useState(false);

  const [formData, setFormData] = useState({
    name: '', model: '', variant: '', category: '', productReference: '', lockable: false, manufacturer: '', is_serialized: true, description: '', picture_url: '', tac: '', build: '', default_managed_by: '', base_value: 0, productType: 'Handset', vat_rate: 0, ...product
  });

  // Cargar dinámicamente el catálogo maestro existente (sin guardar teclas parciales en tiempo real)
  useEffect(() => {
    products.forEach(p => {
      if (p.manufacturer) saveToCatalogHistory('bantos_catalog_manufacturers', p.manufacturer);
      if (p.model) saveToCatalogHistory('bantos_catalog_models', p.model);
      if (p.variant) saveToCatalogHistory('bantos_catalog_variants', p.variant);
    });
    inventory.forEach(i => {
      if (i.manufacturer) saveToCatalogHistory('bantos_catalog_manufacturers', i.manufacturer);
      if (i.model) saveToCatalogHistory('bantos_catalog_models', i.model);
      if (i.variant) saveToCatalogHistory('bantos_catalog_variants', i.variant);
      if (i.color) saveToCatalogHistory('bantos_catalog_variants', i.color);
    });
  }, [products, inventory]);

  // 1. Opciones de Fabricante (Marca) acumuladas y limpias
  const existingManufacturers = getCatalogHistory('bantos_catalog_manufacturers', [
    ...products.map(p => p.manufacturer),
    ...inventory.map(i => i.manufacturer),
    product?.manufacturer
  ]);

  // 2. Opciones de Modelo acumuladas y limpias
  const existingModels = getCatalogHistory('bantos_catalog_models', [
    ...products.map(p => p.model),
    ...products.map(p => p.name),
    ...inventory.map(i => i.model),
    product?.model
  ]);

  // 3. Opciones de Variante acumuladas y limpias
  const existingVariants = getCatalogHistory('bantos_catalog_variants', [
    ...products.map(p => p.variant),
    ...inventory.map(i => i.variant),
    ...inventory.map(i => i.color),
    product?.variant
  ]);

  useEffect(() => {
    setActiveTab('general');
    if (product) {
      if (product.manufacturer) saveToCatalogHistory('bantos_catalog_manufacturers', product.manufacturer);
      if (product.model) saveToCatalogHistory('bantos_catalog_models', product.model);
      if (product.variant) saveToCatalogHistory('bantos_catalog_variants', product.variant);
      setFormData({ ...product, is_serialized: product.is_serialized !== false, productReference: product.reference || product.productReference, model: product.model || '', variant: product.variant || '' });
    } else {
      setFormData({ name: '', model: '', variant: '', category: 'Smartphone', productReference: Math.floor(100000000 + Math.random() * 900000000).toString(), lockable: false, manufacturer: '', is_serialized: true, description: '', picture_url: '', tac: '', build: '', default_managed_by: '', base_value: 0, productType: 'Handset', vat_rate: 0 });
    }
  }, [product, isOpen]);

  const handleSave = () => {
    if (formData.manufacturer) saveToCatalogHistory('bantos_catalog_manufacturers', formData.manufacturer);
    if (formData.model) saveToCatalogHistory('bantos_catalog_models', formData.model);
    if (formData.variant) saveToCatalogHistory('bantos_catalog_variants', formData.variant);
    onSave(formData);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await axios.post(`${API}/backoffice/upload`, form, { headers: { 'Content-Type': 'multipart/form-data' }});
      if (res.data.url) setFormData({ ...formData, picture_url: res.data.url });
    } catch (err) {
      alert('Error uploading image');
    }
  };

  const handleNumericInput = (field, val) => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    setFormData({...formData, [field]: parts[0] + (parts.length > 1 ? '.' + parts[1] : '')});
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-5xl rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[90vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Package size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Gestión de Catálogo Maestro</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><LogOut size={20} /></button>
        </div>
        {product && (
          <div className="flex border-b border-slate-100 bg-white px-8">
            <button onClick={() => setActiveTab('general')} className={`py-4 px-6 font-bold text-sm tracking-wide border-b-2 transition-colors ${activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Configuración Comercial</button>
            <button onClick={() => setActiveTab('inventory')} className={`py-4 px-6 font-bold text-sm tracking-wide border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Stock (Dispositivos)</button>
          </div>
        )}
        <div className="p-8 overflow-y-auto flex-1 max-h-[60vh]">
          {activeTab === 'general' ? (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6">
              <div className="col-span-1 md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
                <div className="col-span-1 md:col-span-2"><p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">Información Técnica</p></div>
                <ProductInput label="Nombre del Producto (*)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <ProductInput label="Referencia" value={formData.productReference} readOnly />
                <SelectableOrCustomInput label="Fabricante / Marca" value={formData.manufacturer} options={existingManufacturers} onChange={e => setFormData({...formData, manufacturer: e.target.value})} />
                <SelectableOrCustomInput label="Modelo" value={formData.model} options={existingModels} onChange={e => setFormData({...formData, model: e.target.value})} />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="Smartphone">Smartphone</option>
                    <option value="Tablet">Tablet</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Estatus del Producto</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.is_serialized ? 'true' : 'false'} onChange={e => setFormData({...formData, is_serialized: e.target.value === 'true'})}>
                    <option value="true">Serializado</option>
                    <option value="false">No serializado</option>
                  </select>
                </div>
              </div>
              <div className="col-span-1 md:col-span-2 space-y-6">
                <div><p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Configuración & Comercial</p></div>
                <div className="bg-slate-50 p-6 rounded-[32px] space-y-5 border border-slate-100">
                  <ProductInput label="Precio Base ($)" value={formData.base_value} onChange={e => handleNumericInput('base_value', e.target.value)} />
                  <ProductInput label="Tasa IVA (%)" value={formData.vat_rate} onChange={e => handleNumericInput('vat_rate', e.target.value)} />
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Foto del dispositivo</label>
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 min-w-0 bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.picture_url || ''} onChange={e => setFormData({...formData, picture_url: e.target.value})} />
                      <label className="bg-blue-600 text-white rounded-xl px-5 flex items-center justify-center gap-2 cursor-pointer hover:bg-blue-700 transition-all font-bold text-sm whitespace-nowrap shrink-0">
                        <Upload size={18} />
                        Subir Foto
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                  {formData.picture_url && (
                    <div className="mt-4 flex justify-center">
                      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 inline-block">
                        <img src={formData.picture_url} alt="Vista previa" className="max-h-48 rounded-xl object-contain" />
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4 px-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div onClick={() => setFormData({...formData, lockable: !formData.lockable})} className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${formData.lockable ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200'}`}>{formData.lockable && <Zap size={12} />}</div>
                    <span className="text-sm font-black text-slate-600 uppercase tracking-wider">Lockable</span>
                  </label>
                </div>
              </div>
              <div className="col-span-3 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción Detallada</label>
                <textarea rows={3} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all resize-none text-base" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
          ) : (
            (() => {
              const matchedInventory = inventory.filter(i => matchesProduct(i.model, product.name));
              
              return (
                <div className="space-y-4">

                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h4 className="font-black text-slate-800 text-lg">Dispositivos en Inventario</h4>
                      <p className="text-slate-500 text-sm">{matchedInventory.length} unidades en stock</p>
                    </div>
                    <button onClick={() => { setEditingInventoryItem(null); setNewImei(''); setNewVariant(''); setImeiError(''); setIsAddImeiOpen(true); setIsAssignOpen(false); }} className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 shadow-md transition-all flex items-center gap-2">
                      <Plus size={16}/> Agregar IMEI
                    </button>
                  </div>
                  <Table cols={['IMEI', 'Modelo Real', 'Variante', 'Estado', 'Asignado a', 'Acciones']} rows={matchedInventory} 
                    render={a => (
                      <>
                        <td className="px-6 py-4 font-mono text-sm font-bold text-slate-800">{a.serial_number}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{a.model}</td>
                        <td className="px-6 py-4 text-xs text-slate-500">{a.variant || '—'}</td>
                        <td className="px-6 py-4"><Badge status={a.status} /></td>
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {a.assigned_to_user_id ? users.find(u => u.id === a.assigned_to_user_id)?.username || a.assigned_to_user_id : 'No Asignado'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => {
                              setEditingInventoryItem(a);
                              setNewImei(a.serial_number || '');
                              setNewVariant(a.variant || '');
                              setImeiError('');
                              setIsAddImeiOpen(true);
                              setIsAssignOpen(false);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs"
                            title="Editar IMEI"
                          >
                            <Edit size={14} /> Editar
                          </button>
                          <button
                            onClick={() => {
                              setEditingInventoryItem(a);
                              setAssignSellerId(a.assigned_to_user_id || '');
                              setIsAssignOpen(true);
                              setIsAddImeiOpen(false);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors flex items-center gap-1.5 font-bold text-xs ml-2"
                            title="Asignar a Vendedor"
                          >
                            <Users size={14} /> Asignar
                          </button>
                        </td>
                      </>
                    )}
                    renderMobile={a => (
                      <div className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="font-mono text-sm font-bold text-slate-800">{a.serial_number}</p>
                          <p className="text-slate-500 text-[10px]">{a.model}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge status={a.status} />
                          <button
                            onClick={() => {
                              setEditingInventoryItem(a);
                              setNewImei(a.serial_number || '');
                              setNewVariant(a.variant || '');
                              setImeiError('');
                              setIsAddImeiOpen(true);
                              setIsAssignOpen(false);
                            }}
                            className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-xl transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingInventoryItem(a);
                              setAssignSellerId(a.assigned_to_user_id || '');
                              setIsAssignOpen(true);
                              setIsAddImeiOpen(false);
                            }}
                            className="p-2 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 rounded-xl transition-colors"
                          >
                            <Users size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  />

                  {/* MODAL DIALOG PARA AGREGAR / EDITAR IMEI DE DISPOSITIVO */}
                  <AnimatePresence>
                    {isAddImeiOpen && (
                      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-5 border border-slate-100">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <Smartphone size={20} />
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 text-lg">
                                  {editingInventoryItem ? 'Editar IMEI' : 'Agregar IMEI'}
                                </h4>
                                <p className="text-xs text-slate-400 font-bold">{product?.name}</p>
                              </div>
                            </div>
                            <button onClick={() => { setIsAddImeiOpen(false); setEditingInventoryItem(null); setNewImei(''); setNewVariant(''); setImeiError(''); }} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"><X size={18} /></button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Número de IMEI (15 Dígitos)</label>
                            <input 
                              type="text"
                              maxLength={18}
                              placeholder="Ej. 358694091234567"
                              value={newImei}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                                setNewImei(val);
                                if (val && val.length < 14) setImeiError('El IMEI debe tener al menos 14 o 15 caracteres');
                                else setImeiError('');
                              }}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-5 font-mono font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-base tracking-wider"
                            />
                            {imeiError && (
                              <p className="text-xs text-red-500 font-bold ml-1 flex items-center gap-1">
                                <AlertCircle size={14} /> {imeiError}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Variante / Capacidad / Color</label>
                            <input 
                              type="text"
                              placeholder="Ej. 128GB Azul"
                              value={newVariant}
                              onChange={(e) => setNewVariant(e.target.value)}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl py-3.5 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-base"
                            />
                          </div>

                          <div className="pt-2 flex justify-end gap-3">
                            <button 
                              onClick={() => { setIsAddImeiOpen(false); setEditingInventoryItem(null); setNewImei(''); setNewVariant(''); setImeiError(''); }} 
                              className="px-5 py-3 rounded-xl font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-600 transition-all"
                            >
                              Cancelar
                            </button>
                            <button 
                              disabled={!newImei || newImei.trim().length < 5 || isSubmittingImei}
                              onClick={async () => {
                                const trimmed = newImei.trim();
                                if (trimmed.length < 5) {
                                  setImeiError('Ingresa un IMEI válido');
                                  return;
                                }
                                setIsSubmittingImei(true);
                                try {
                                  if (editingInventoryItem) {
                                    await onEditInventory(editingInventoryItem, trimmed, newVariant.trim());
                                  } else {
                                    await onAddInventory(product.name, trimmed, newVariant.trim());
                                  }
                                  setIsAddImeiOpen(false);
                                  setEditingInventoryItem(null);
                                  setNewImei('');
                                  setNewVariant('');
                                  setImeiError('');
                                } catch (err) {
                                  setImeiError(err.message || 'Error al guardar IMEI');
                                } finally {
                                  setIsSubmittingImei(false);
                                }
                              }}
                              className="px-7 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-all"
                            >
                              {isSubmittingImei ? 'Guardando...' : (editingInventoryItem ? 'Actualizar IMEI' : 'Guardar IMEI')}
                            </button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  {/* MODAL DIALOG PARA ASIGNAR IMEI A VENDEDOR */}
                  <AnimatePresence>
                    {isAssignOpen && editingInventoryItem && (
                      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAssignOpen(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
                          <h4 className="font-black text-slate-800">Asignar Inventario</h4>
                          <p className="text-xs text-slate-500 font-mono">{editingInventoryItem.serial_number}</p>
                          <div className="space-y-1.5 pt-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Vendedor / Agente</label>
                            <select 
                              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-800 focus:border-emerald-600 outline-none transition-all"
                              value={assignSellerId}
                              onChange={e => setAssignSellerId(e.target.value)}
                            >
                              <option value="">-- Quitar Asignación --</option>
                              {users.filter(u => u.store_id == session?.storeId && (u.role === 'agent' || u.role === 'agente' || u.role === 'seller')).map(u => (
                                <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                              ))}
                            </select>
                          </div>
                          <div className="pt-2 flex justify-end gap-3">
                            <button onClick={() => setIsAssignOpen(false)} className="px-5 py-3 rounded-xl font-bold uppercase text-[11px] text-slate-400">Cancelar</button>
                            <button 
                              onClick={async () => {
                                try {
                                  await axios.post(`${API}/backoffice/inventory/assign`, {
                                    tenantId: session.tenantId,
                                    storeId: session.storeId,
                                    sellerId: assignSellerId || null,
                                    inventoryIds: [editingInventoryItem.id]
                                  });
                                  setIsAssignOpen(false);
                                  setEditingInventoryItem(null);
                                  if (refreshData) refreshData();
                                } catch (e) {
                                  alert('Error asignando: ' + e.message);
                                }
                              }}
                              className="px-7 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-emerald-600/30 hover:bg-emerald-700"
                            >Guardar</button>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })()
          )}
        </div>
        <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] text-slate-400 hover:text-slate-600 transition-all">Cerrar</button>
          {activeTab === 'general' && (
            <><div className="flex-1" /><button onClick={handleSave} className="px-14 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">{product ? 'Guardar Cambios' : 'Crear Producto Maestro'}</button></>
          )}
        </div>
      </motion.div>
    </div>
  );
};

// --- MODAL DE TÉRMINOS ---
const TermModal = ({ isOpen, onClose, term, onSave, globalSettings }) => {
  const [formData, setFormData] = useState({
    type: 'Contado', name: '', status: 'Active', description: '', upfront_percentage: '', interest_percentage: '', frequency_days: 7, installments_count: 1, credit_period_months: 12, ...term
  });
  
  useEffect(() => {
    if (term) {
      let tType = term.type;
      if (tType === 'PAYG' || tType === 'Fijo') tType = 'Contado';
      if (tType === 'INSTALMENTS' || tType === 'Abono' || tType === 'CRÉDITO') tType = 'Crédito';
      setFormData({ ...term, type: tType });
    }
    else setFormData({ type: 'Contado', name: '', status: 'Active', description: '', upfront_percentage: '', interest_percentage: '', frequency_days: 7, installments_count: 1, credit_period_months: 12 });
  }, [term]);

  useEffect(() => {
    if (formData.type === 'Crédito' || formData.type === 'INSTALMENTS' || formData.type === 'Abono') {
      let iters = 1;
      const freq = parseInt(formData.frequency_days) || 7;
      const period = parseInt(formData.credit_period_months) || 12;
      if (freq === 7) iters = 52;
      else if (freq === 15) iters = 24;
      else if (freq === 30) iters = 12;
      
      iters = Math.round(iters * (period / 12));

      if (formData.installments_count !== iters) {
        setFormData(prev => ({ ...prev, installments_count: iters }));
      }
    }
  }, [formData.frequency_days, formData.type, formData.credit_period_months]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-2xl rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[90vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Tag size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{term ? 'Editar Término' : 'Nuevo Término'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Gestión de Planes</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
        </div>
        <div className="p-8 overflow-y-auto space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Plan</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                {['Contado', 'Crédito'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Plan (*)</label>
              <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            {formData.type === 'Crédito' && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Enganche ({globalSettings?.upfront_type === 'Porciento' ? '%' : '$'})</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.upfront_percentage} onChange={e => setFormData({...formData, upfront_percentage: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Interés ({globalSettings?.interest_type === 'Monto' ? '$' : '%'})</label>
                  <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.interest_percentage || ''} onChange={e => setFormData({...formData, interest_percentage: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Período (Meses)</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.credit_period_months || 12} onChange={e => setFormData({...formData, credit_period_months: parseInt(e.target.value)})}>
                    {[12, 18].map(t => <option key={t} value={t}>{t} meses</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Frecuencia (Días)</label>
                  <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.frequency_days || 7} onChange={e => setFormData({...formData, frequency_days: parseInt(e.target.value)})}>
                    {[7, 15, 30].map(t => <option key={t} value={t}>{t} días</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">No. de pagos a realizar (Auto)</label>
                  <input type="text" disabled className="w-full bg-slate-100 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-500 outline-none transition-all text-base cursor-not-allowed" value={formData.installments_count || 1} />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                {['Active', 'Inactive'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {formData.type === 'Crédito' && formData.installments_count > 0 && (
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 flex gap-4 text-sm text-blue-800">
              <AlertCircle size={24} className="shrink-0 text-blue-500" />
              <div>
                <p className="font-bold text-blue-900 mb-1">Funcionamiento del Plan a Crédito</p>
                <p className="font-medium text-blue-800/80">
                  Al vender un producto con este plan, la plataforma solicitará automáticamente un enganche inicial de <strong>${formData.upfront_percentage || 0}</strong>. 
                  El saldo restante será dividido en <strong>{formData.installments_count} pagos iguales</strong> que el cliente deberá cubrir cada <strong>{formData.frequency_days || 7} días</strong>.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Descripción</label>
            <textarea rows={3} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all resize-none text-base" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>
        </div>
        <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <div className="flex-1" /><button onClick={() => onSave(formData)} className="px-14 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">{term ? 'Guardar Cambios' : 'Crear Término'}</button>
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-4xl rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[90vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20"><ClipboardCheck size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{collection ? 'Editar Flujo' : 'Nuevo Flujo de Datos'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Configuración de Captura Dinámica</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><LogOut size={20} /></button>
        </div>
        
        <div className="p-5 md:p-8 overflow-y-auto space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre del Formulario</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Categoría / Tipo</label>
              <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="onboarding">Onboarding</option>
                <option value="standalone">Standalone</option>
                <option value="client-linked">Client-linked</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Estructura de Preguntas ({formData.questions.length})</p>
              <button onClick={addQuestion} className="flex items-center gap-2 text-blue-600 text-[12px] font-black uppercase tracking-widest hover:bg-blue-50 px-3 py-2 rounded-lg transition-all"><Plus size={14} /> Añadir Campo</button>
            </div>
            
            <div className="space-y-3">
              {formData.questions.map((q, i) => (
                <div key={q.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 items-center">
                  <div className="flex-1 space-y-1">
                    <input placeholder="Texto de la pregunta" className="w-full bg-transparent font-bold text-slate-800 outline-none text-base" value={q.text} onChange={e => updateQuestion(i, {...q, text: e.target.value})} />
                  </div>
                  <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-bold text-slate-600 outline-none" value={q.type} onChange={e => updateQuestion(i, {...q, type: e.target.value})}>
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

        <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <div className="flex-1" /><button onClick={() => onSave(formData)} className="px-14 bg-emerald-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all">{collection ? 'Guardar Cambios' : 'Crear Flujo de Datos'}</button>
        </div>
      </motion.div>
    </div>
  );
};

// --- VISTAS ---
const DashboardView = ({ summary, session, data, setView, onNewSale, onNewPayment }) => {
  const isManager = (session?.scope_role || '').toUpperCase() === 'MANAGER' || session?.role === 'manager';
  const isSeller = (session?.scope_role || '').toUpperCase() === 'STAFF' || session?.role === 'agent' || session?.role === 'seller' || session?.role === 'assistant';
  const isDirector = !isManager && !isSeller;

  // Cálculos rápidos
  const today = new Date().toISOString().split('T')[0];
  
  const myContractsToday = data?.contracts?.filter(c => c.created_at && c.created_at.startsWith(today)) || [];
  const pendingContracts = data?.contracts?.filter(c => (c.status || '').toLowerCase() === 'pending') || [];
  const signedContracts = data?.contracts?.filter(c => (c.status || '').toLowerCase() === 'signed') || [];
  
  const todaySales = myContractsToday.reduce((sum, c) => sum + Number(c.total_value || 0), 0);
  
  // Para Manager: Inventario bloqueado o bajo, etc.
  const inventoryAvailable = data?.inventory?.filter(i => (i.status || '').toLowerCase() === 'available').length || 0;
  
  if (isSeller) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Mi Dashboard</h2>
            <p className="text-slate-400 font-medium mt-1">Resumen de ventas y metas diarias</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-[32px] shadow-xl shadow-blue-600/20 flex flex-col gap-8 bg-gradient-to-br from-blue-600 to-indigo-800 text-white">
            <DollarSign size={28} className="text-white opacity-60" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-white opacity-70">Ventas de Hoy</p>
              <p className="text-3xl font-black tracking-tighter text-white">${todaySales.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 bg-white">
            <Clock size={28} className="text-amber-500 opacity-50" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-400">Pendientes de Firma</p>
              <p className="text-3xl font-black tracking-tighter text-slate-800">{pendingContracts.length}</p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 bg-white">
            <FileText size={28} className="text-emerald-500 opacity-50" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-400">Contratos Firmados</p>
              <p className="text-3xl font-black tracking-tighter text-slate-800">{signedContracts.length}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <button onClick={onNewSale} className="p-6 bg-blue-50 text-blue-700 rounded-3xl font-bold flex items-center justify-between border border-blue-100 hover:bg-blue-600 hover:text-white transition-all group">
            <span className="text-lg">Crear nueva Venta</span>
            <FileText size={24} className="group-hover:scale-110 transition-transform" />
          </button>
          
          <button onClick={onNewPayment} className="p-6 bg-emerald-50 text-emerald-700 rounded-3xl font-bold flex items-center justify-between border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all group">
            <span className="text-lg">Registrar un pago</span>
            <DollarSign size={24} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  if (isManager) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard Gerencial</h2>
            <p className="text-slate-400 font-medium mt-1">Supervisión de sucursal y equipo de ventas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-8 rounded-[32px] shadow-xl shadow-indigo-600/20 flex flex-col gap-8 bg-gradient-to-br from-indigo-600 to-purple-800 text-white">
            <TrendingUp size={28} className="text-white opacity-60" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-white opacity-70">Recaudación (Sucursal)</p>
              <p className="text-3xl font-black tracking-tighter text-white">${Number(summary.totalPaid || 0).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 bg-white">
            <Users size={28} className="text-blue-500 opacity-50" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-400">Clientes Totales</p>
              <p className="text-3xl font-black tracking-tighter text-slate-800">{data?.clients?.length || 0}</p>
            </div>
          </div>

          <div className="p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 bg-white">
            <FileText size={28} className="text-emerald-500 opacity-50" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-400">Contratos Activos</p>
              <p className="text-3xl font-black tracking-tighter text-slate-800">{data?.contracts?.length || 0}</p>
            </div>
          </div>
          
          <div className="p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 bg-white">
            <Tag size={28} className="text-amber-500 opacity-50" />
            <div>
              <p className="text-[12px] font-black uppercase tracking-widest mb-1 text-slate-400">Inventario Disponible</p>
              <p className="text-3xl font-black tracking-tighter text-slate-800">{inventoryAvailable}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100/50">
             <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><Calendar size={20} className="text-slate-400"/> Resumen de Vendedores</h3>
             <p className="text-slate-500 text-sm">Gestiona el rendimiento de tu equipo. Revisa la tabla de usuarios para detalles de ventas por agente.</p>
             <button onClick={() => setView('manage-users')} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Ver Equipo</button>
          </div>
          
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100/50">
             <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2"><AlertCircle size={20} className="text-slate-400"/> Alertas de Tienda</h3>
             <p className="text-slate-500 text-sm">Contratos pendientes o problemas de inventario aparecerán aquí.</p>
             <div className="mt-4 flex gap-2 flex-wrap">
                 {pendingContracts.length > 0 && <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full">{pendingContracts.length} Contratos pendientes</span>}
                 {inventoryAvailable < 5 && <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-bold rounded-full">Stock bajo ({inventoryAvailable})</span>}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback (Director / Admin global)
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Dashboard General</h2>
          <p className="text-slate-400 font-medium mt-1">Inteligencia operativa macro (Tenant)</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Recaudación Total', value: `$${Number(summary.totalPaid || 0).toLocaleString()}`, icon: DollarSign, bg: 'from-blue-600 to-indigo-800', white: true },
          { label: 'Clientes Activos', value: summary.totalClients || 0, icon: Users, bg: 'bg-white' },
          { label: 'Contratos', value: summary.totalContracts || 0, icon: FileText, bg: 'bg-white' },
          { label: 'Productos', value: summary.totalProducts || 0, icon: Tag, bg: 'bg-white' },
        ].map(({ label, value, icon: Icon, bg, white }) => (
          <div key={label} className={`p-8 rounded-[32px] shadow-sm border border-slate-100/50 flex flex-col gap-8 ${white ? `bg-gradient-to-br ${bg} text-white border-0 shadow-xl shadow-blue-600/20` : bg}`}>
            <Icon size={28} className={white ? 'text-white opacity-60' : 'text-blue-600 opacity-50'} />
            <div>
              <p className={`text-[12px] font-black uppercase tracking-widest mb-1 ${white ? 'text-white opacity-70' : 'text-slate-400'}`}>{label}</p>
              <p className={`text-3xl font-black tracking-tighter ${white ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClientsView = ({ clients = [], onEdit, onCreate }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    walletStatus: '',
    entity: ''
  });
  const [quickFilter, setQuickFilter] = useState('all');

  const safeClients = Array.isArray(clients) ? clients : [];

  const counts = {
    total: safeClients.length,
    signed: safeClients.filter(c => (c.status || '').toLowerCase() === 'signed').length,
    approved: safeClients.filter(c => (c.status || '').toLowerCase() === 'approved').length,
    pending: safeClients.filter(c => (c.status || '').toLowerCase() === 'pending').length,
    rejected: safeClients.filter(c => (c.status || '').toLowerCase() === 'rejected').length,
    withWallet: safeClients.filter(c => Boolean(c.clabe)).length,
  };

  const filtered = safeClients.filter(c => {
    if (!c) return false;

    // Quick filter tab
    if (['signed', 'approved', 'pending', 'rejected'].includes(quickFilter) && (c.status || '').toLowerCase() !== quickFilter) return false;
    if (quickFilter === 'withWallet' && !c.clabe) return false;

    // Advanced search filters
    const searchLow = filters.search.toLowerCase();
    const nameMatch = !filters.search || (
      (c.name || '').toLowerCase().includes(searchLow) ||
      (c.first_name || '').toLowerCase().includes(searchLow) ||
      (c.last_name || '').toLowerCase().includes(searchLow) ||
      (c.email || '').toLowerCase().includes(searchLow) ||
      (c.phone || '').toLowerCase().includes(searchLow) ||
      (c.upya_id || '').toLowerCase().includes(searchLow) ||
      (c.client_number || '').toLowerCase().includes(searchLow) ||
      (c.clabe || '').toLowerCase().includes(searchLow)
    );

    const statusMatch = !filters.status || (c.status || '').toLowerCase() === filters.status.toLowerCase();
    const walletMatch = !filters.walletStatus || (
      filters.walletStatus === 'withWallet' ? Boolean(c.clabe) :
      filters.walletStatus === 'withoutWallet' ? !c.clabe : true
    );
    const entityMatch = !filters.entity || (c.entity || '').toLowerCase().includes(filters.entity.toLowerCase());

    return nameMatch && statusMatch && walletMatch && entityMatch;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Clientes" 
        subtitle={`${filtered.length} identidades registradas`} 
        action={
          <button 
            onClick={onCreate}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo Cliente
          </button>
        }
      />

      {/* Quick Filter Tabs matching Upya */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setQuickFilter('all'); setFilters({ ...filters, status: '', walletStatus: '' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Todos los Clientes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('signed'); setFilters({ ...filters, status: 'signed' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'signed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Signed</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'signed' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>{counts.signed}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('approved'); setFilters({ ...filters, status: 'approved' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'approved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Approved</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>{counts.approved}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('pending'); setFilters({ ...filters, status: 'pending' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Pending</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>{counts.pending}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('rejected'); setFilters({ ...filters, status: 'rejected' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'rejected' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'}`}>{counts.rejected}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('withWallet'); setFilters({ ...filters, walletStatus: 'withWallet' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'withWallet' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Con Wallet STP</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'withWallet' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>{counts.withWallet}</span>
        </button>
      </div>

      {/* Advanced Filter Bar Grid */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda por Nombre / ID / Email / Teléfono / CLABE</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
              placeholder="Buscar cliente..." 
              value={filters.search} 
              onChange={e => setFilters({...filters, search: e.target.value})} 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Wallet</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.walletStatus} 
            onChange={e => setFilters({...filters, walletStatus: e.target.value})}
          >
            <option value="">Todos los Estados Wallet</option>
            <option value="withWallet">Con Wallet STP (CLABE)</option>
            <option value="withoutWallet">Sin Wallet</option>
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setQuickFilter('all'); setFilters({ search: '', status: '', walletStatus: '', entity: '' }); }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      <Table 
        cols={['Nº Cliente', 'Cliente / Nombre', 'Entidad', 'Agente', 'Contacto (Email/Tel)', 'CLABE STP', 'Estado', 'Acciones']} 
        rows={filtered} 
        render={c => (
          <>
            <td className="px-8 py-5 font-mono text-blue-600 font-bold text-sm">{c.client_number || c.upya_id}</td>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800">{c.name}</p>
              {c.external_id && <p className="text-[10px] font-mono text-slate-400 uppercase">Ext: {c.external_id}</p>}
            </td>
            <td className="px-8 py-5 text-slate-700 font-bold text-xs">{c.entity || '—'}</td>
            <td className="px-8 py-5 text-slate-500 font-medium text-xs">{c.agent || '—'}</td>
            <td className="px-8 py-5 text-slate-500 text-xs">
              <p className="font-semibold text-slate-700">{c.email || '—'}</p>
              {c.phone && <p className="font-mono text-slate-400 text-[11px]">{c.phone}</p>}
            </td>
            <td className="px-8 py-5">
              {c.clabe ? (
                <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">{c.clabe}</span>
              ) : (
                <span className="text-slate-300 italic text-xs">Sin wallet</span>
              )}
            </td>
            <td className="px-8 py-5"><Badge status={c.status || 'Active'} /></td>
            <td className="px-8 py-5 text-right">
              <button 
                onClick={() => onEdit(c)} 
                className="p-2 rounded-xl hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all flex items-center gap-1 font-bold text-xs"
                title="Editar cliente y Wallet"
              >
                <Settings2 size={18} />
              </button>
            </td>
          </>
        )} 
      />
    </div>
  );
};

const ClientModal = ({ isOpen, onClose, client, onSave, onGenerateWallet, orgStructure = [] }) => {
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'wallet'
  const [formData, setFormData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    reference_contact: '',
    reference_phone: '',
    client_number: '',
    external_id: '',
    entity: '',
    agent: '',
    status: 'Signed',
    signing_date: ''
  });
  const [saving, setSaving] = useState(false);

  // Filter nodes from Organization module (Shop / Tienda)
  const shopNodes = (orgStructure || []).filter(n => n.type === 'Manager');

  // Find subordinate agents for the selected shop
  const getSubordinateAgents = () => {
    if (!formData.entity) return [];

    const selectedShop = shopNodes.find(s => s.name === formData.entity);
    if (!selectedShop) return [];

    const getChildren = (parentId) => {
      const direct = (orgStructure || []).filter(n => String(n.parent_id) === String(parentId) || n.parent_id === parentId);
      let list = [...direct];
      direct.forEach(child => {
        list = list.concat(getChildren(child.id || child.upya_id));
      });
      return list;
    };

    const subNodes = getChildren(selectedShop.id || selectedShop.upya_id);
    const agentSet = new Set();

    if (selectedShop.administrator) agentSet.add(selectedShop.administrator);

    subNodes.forEach(n => {
      if (n.type === 'Agente' || n.administrator) {
        if (n.name && n.type === 'Agente') agentSet.add(n.name);
        if (n.administrator) agentSet.add(n.administrator);
      }
    });

    return Array.from(agentSet);
  };

  const agentOptions = getSubordinateAgents();

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name || '',
        first_name: client.first_name || '',
        last_name: client.last_name || '',
        email: client.email || '',
        phone: client.phone || '',
        reference_contact: client.reference_contact || '',
        reference_phone: client.reference_phone || '',
        client_number: client.client_number || client.upya_id || '',
        external_id: client.external_id || '',
        entity: client.entity || '',
        agent: client.agent || '',
        status: client.status || 'Signed',
        signing_date: client.signing_date ? new Date(client.signing_date).toISOString().substring(0, 10) : ''
      });
      setActiveTab('edit');
    } else {
      setFormData({
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        reference_contact: '',
        reference_phone: '',
        client_number: `C${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`,
        external_id: '',
        entity: '',
        agent: '',
        status: 'Signed',
        signing_date: new Date().toISOString().substring(0, 10)
      });
      setActiveTab('edit');
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullName = formData.name.trim() || `${formData.first_name.trim()} ${formData.last_name.trim()}`.trim();
    if (!fullName) return alert('El nombre del cliente es obligatorio');

    setSaving(true);
    try {
      await onSave({
        ...formData,
        name: fullName,
        upya_id: client ? client.upya_id : undefined,
        id: client ? client.id : undefined
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    if (!client) return;
    setGenerating(true);
    try {
      await onGenerateWallet(client.upya_id);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white"><Users size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900">{client ? (client.name || 'Editar Cliente') : 'Nuevo Cliente'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">
                {client ? `Nº Cliente: ${client.client_number || client.upya_id}` : 'Registrar nuevo cliente en Bantos Data Center'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
        </div>

        {/* Tab Selection if Editing */}
        {client && (
          <div className="flex border-b border-slate-100 bg-slate-50/30 px-8 shrink-0">
            <button 
              onClick={() => setActiveTab('edit')} 
              className={`py-3.5 px-5 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${activeTab === 'edit' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Editar Información
            </button>
            <button 
              onClick={() => setActiveTab('wallet')} 
              className={`py-3.5 px-5 font-black text-xs uppercase tracking-widest border-b-2 transition-all ${activeTab === 'wallet' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
            >
              Wallet STP & Contratos
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
          {(!client || activeTab === 'edit') ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Nombres *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Luz Maria" 
                    value={formData.first_name} 
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value, name: `${e.target.value} ${formData.last_name}`.trim() })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Apellidos *</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Bautista Santiago" 
                    value={formData.last_name} 
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value, name: `${formData.first_name} ${e.target.value}`.trim() })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Nombre Completo *</label>
                <input 
                  type="text" 
                  required 
                  placeholder="Ej. Luz Maria Bautista Santiago" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Correo Electrónico</label>
                  <input 
                    type="email" 
                    placeholder="ejemplo@correo.com" 
                    value={formData.email} 
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Teléfono Móvil (Cobranza)</label>
                  <input 
                    type="text" 
                    placeholder="Ej. 5631742835" 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  />
                </div>
              </div>

              {/* Referencia / Aval para crédito */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contacto de Referencia / Pariente (Cobranza Financiada)</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Nombre Referencia / Aval</label>
                    <input 
                      type="text" 
                      placeholder="Ej. María Santiago (Madre)" 
                      value={formData.reference_contact} 
                      onChange={(e) => setFormData({ ...formData, reference_contact: e.target.value })} 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-800 text-xs outline-none focus:border-blue-600" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Teléfono Referencia</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 5598765432" 
                      value={formData.reference_phone} 
                      onChange={(e) => setFormData({ ...formData, reference_phone: e.target.value })} 
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 font-bold text-slate-800 text-xs outline-none focus:border-blue-600" 
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Entidad / Distribuidor</label>
                  <select 
                    value={formData.entity} 
                    onChange={(e) => setFormData({ ...formData, entity: e.target.value, agent: '' })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  >
                    <option value="">-- Seleccionar Tienda --</option>
                    {formData.entity && !shopNodes.some(s => s.name === formData.entity) && (
                      <option value={formData.entity}>{formData.entity}</option>
                    )}
                    {shopNodes.map(s => (
                      <option key={s.id || s.upya_id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Agente Asignado</label>
                  <select 
                    value={formData.agent} 
                    onChange={(e) => setFormData({ ...formData, agent: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  >
                    <option value="">-- Seleccionar Agente --</option>
                    {formData.agent && !agentOptions.includes(formData.agent) && (
                      <option value={formData.agent}>{formData.agent}</option>
                    )}
                    {agentOptions.map((ag, idx) => (
                      <option key={idx} value={ag}>{ag}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-2">Nº Cliente</label>
                  <input 
                    type="text" 
                    placeholder="Ej. C431857491" 
                    value={formData.client_number} 
                    onChange={(e) => setFormData({ ...formData, client_number: e.target.value })} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3.5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all text-sm" 
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-6 py-3 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600">Cancelar</button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all"
                >
                  {saving ? 'Guardando...' : (client ? 'Guardar Cambios' : 'Crear Cliente')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 p-4 bg-slate-50 rounded-2xl">
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ID de Sistema</p>
                  <p className="font-mono text-blue-600 font-bold">{client.upya_id}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                  <p className="text-slate-700 font-bold">{client.email || '—'}</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-5 md:p-8 border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600"><CreditCard size={20} /></div>
                    <p className="font-black text-slate-800 tracking-tight">Wallet STP DynamiCore</p>
                  </div>
                  <Badge status={client.clabe ? 'Active' : 'Unassigned'} />
                </div>

                {client.clabe ? (
                  <div className="space-y-4">
                    <div className="bg-white border border-emerald-100 rounded-2xl p-5 text-center">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">CLABE Interbancaria</p>
                      <p className="text-2xl font-mono font-black text-emerald-700 tracking-[0.1em]">{client.clabe}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white/50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Wallet ID</p>
                        <p className="text-[11px] font-mono font-bold text-slate-600">{client.wallet_account_id}</p>
                      </div>
                      <div className="bg-white/50 border border-slate-100 rounded-xl p-3">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Client DC ID</p>
                        <p className="text-[11px] font-mono font-bold text-slate-600">{client.wallet_client_id}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-6 py-4">
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">Este cliente aún no tiene una cuenta wallet asignada. Al generarla, se le asignará una CLABE única para recibir pagos vía STP.</p>
                    <button 
                      onClick={handleGenerate}
                      disabled={generating}
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 ${generating ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {generating ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Generando Wallet...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Generar Wallet STP
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 md:p-8 bg-slate-50/50 border-t border-slate-100 flex justify-end shrink-0">
          <button onClick={onClose} className="px-8 py-3 font-black text-[12px] uppercase tracking-widest text-slate-400 hover:text-slate-600">Cerrar</button>
        </div>
      </motion.div>
    </div>
  );
};

const CONTRACT_STATUSES = {
  SIGNED: ['SIGNED', 'FIRMADO', 'ENABLED'],
  APPROVED: ['APPROVED', 'APROBADO', 'ENABLED'],
  PENDING: ['PENDING', 'PENDIENTE', 'LOCKED'],
  REJECTED: ['REJECTED', 'NO APROBADO', 'CANCELLED']
};

const ContractsView = ({ contracts = [], onNew, onEdit, onSign, onSettle, session }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    product: '',
    plan: ''
  });
  const [quickFilter, setQuickFilter] = useState('all');

  const safeContracts = Array.isArray(contracts) ? contracts : [];

  const uniqueProducts = [...new Set(safeContracts.map(c => c.product_name || c.device).filter(Boolean))].sort();

  const counts = {
    total: safeContracts.length,
    signed: safeContracts.filter(c => CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase())).length,
    approved: safeContracts.filter(c => CONTRACT_STATUSES.APPROVED.includes((c.status || '').toUpperCase())).length,
    pending: safeContracts.filter(c => CONTRACT_STATUSES.PENDING.includes((c.status || '').toUpperCase())).length,
    rejected: safeContracts.filter(c => CONTRACT_STATUSES.REJECTED.includes((c.status || '').toUpperCase())).length,
  };

  const filtered = safeContracts.filter(c => {
    if (!c) return false;
    const s = (c.status || '').toUpperCase();

    // Quick tab filter
    if (quickFilter === 'signed' && !CONTRACT_STATUSES.SIGNED.includes(s)) return false;
    if (quickFilter === 'approved' && !CONTRACT_STATUSES.APPROVED.includes(s)) return false;
    if (quickFilter === 'pending' && !CONTRACT_STATUSES.PENDING.includes(s)) return false;
    if (quickFilter === 'rejected' && !CONTRACT_STATUSES.REJECTED.includes(s)) return false;

    // Advanced search filters
    const searchLow = filters.search.toLowerCase();
    const searchMatch = !filters.search || (
      (c.contract_number || '').toLowerCase().includes(searchLow) ||
      (c.client_name || '').toLowerCase().includes(searchLow) ||
      (c.upya_id || '').toLowerCase().includes(searchLow)
    );

    const statusMatch = filters.status === 'all' || 
      (filters.status === 'signed' && CONTRACT_STATUSES.SIGNED.includes(s)) ||
      (filters.status === 'approved' && CONTRACT_STATUSES.APPROVED.includes(s)) ||
      (filters.status === 'pending' && CONTRACT_STATUSES.PENDING.includes(s)) ||
      (filters.status === 'rejected' && CONTRACT_STATUSES.REJECTED.includes(s));

    const productMatch = !filters.product || (c.product_name || c.device || '').toLowerCase() === filters.product.toLowerCase();

    return searchMatch && statusMatch && productMatch;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Contratos" 
        subtitle={`${filtered.length} deals registrados`} 
        action={
          <button 
            onClick={onNew}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo Contrato
          </button>
        }
      />

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setQuickFilter('all'); setFilters({ ...filters, status: 'all' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Todos los Contratos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('signed'); setFilters({ ...filters, status: 'signed' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'signed' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Firmados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'signed' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>{counts.signed}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('approved'); setFilters({ ...filters, status: 'approved' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'approved' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Aprobados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>{counts.approved}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('pending'); setFilters({ ...filters, status: 'pending' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'pending' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Pendientes</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>{counts.pending}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('rejected'); setFilters({ ...filters, status: 'rejected' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'rejected' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>No Aprobados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'}`}>{counts.rejected}</span>
        </button>
      </div>

      {/* Advanced Filter Bar Grid */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda por Contrato / Cliente</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
              placeholder="Buscar por contrato o cliente..." 
              value={filters.search} 
              onChange={e => setFilters({...filters, search: e.target.value})} 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Contrato</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.status} 
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Todos los estados</option>
            <option value="signed">Firmados</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">No Aprobados</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Producto</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.product} 
            onChange={e => setFilters({...filters, product: e.target.value})}
          >
            <option value="">Todos los productos</option>
            {uniqueProducts.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setQuickFilter('all'); setFilters({ search: '', status: 'all', product: '', plan: '' }); }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Limpiar Filtros
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
              <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Reference ID</p>
            </td>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800">{c.client_name || '—'}</p>
              <p className="text-[12px] text-blue-600 font-black uppercase tracking-widest mt-0.5">{c.client_number || 'S/N'}</p>
            </td>
            <td className="px-8 py-5">
              <p className="font-black text-slate-900 text-sm">{c.product_name || 'N/A'}</p>
            </td>
            <td className="px-8 py-5">
              <p className="text-[11px] text-slate-500 font-bold">{c.deal_name || 'Plan Estándar'}</p>
            </td>
            <td className="px-8 py-5 w-48">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[12px] font-black text-slate-400 uppercase tracking-widest">
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
              <button 
                onClick={() => onSettle && onSettle(c)}
                className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-bold text-[11px] hover:bg-amber-600 hover:text-white transition-all border border-amber-200"
                title="Finiquitar / Liquidar Crédito Anticipadamente"
              >
                Finiquitar
              </button>
              {(CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase()) || c.signature_image || c.signature_data) && (
                <a 
                  href={c.contract_number && (c.contract_number.endsWith('.docx') || c.contract_number.endsWith('.pdf')) ? `https://bantos.cloud/signed-contracts/${c.contract_number}` : `/datacenter-api/backoffice/contracts/${c.upya_id}/pdf?tenantId=${session?.tenantId}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-emerald-50 text-emerald-500 hover:text-emerald-700 transition-all"
                  title="Ver documento firmado"
                >
                  <FileText size={16} />
                </a>
              )}
              
              {!CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase()) && !c.signature_image && !c.signature_data && (
                <button 
                  onClick={() => onSign(c)}
                  className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                >
                  Firmar
                </button>
              )}
            </td>
          </>
        )}
        renderMobile={c => (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-slate-900 tracking-tight">{c.contract_number || c.upya_id}</p>
                <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">{c.client_name || '—'}</p>
              </div>
              <Badge status={c.status} />
            </div>
            <div className="pt-4 border-t border-slate-50 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Producto:</span>
                <span className="font-black text-slate-800">{c.product_name || 'N/A'}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  <span>Pago: ${Number(c.paid_value || 0).toLocaleString()}</span>
                  <span>{Math.round((Number(c.paid_value || 0) / Number(c.total_value || 1)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(Number(c.paid_value || 0) / Number(c.total_value || 1)) * 100}%` }} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => onEdit(c)} className="p-2.5 rounded-lg bg-slate-50 text-slate-400 hover:text-slate-600"><Settings2 size={16} /></button>
                {(CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase()) || c.signature_image || c.signature_data) && (
                  <a href={c.contract_number && (c.contract_number.endsWith('.docx') || c.contract_number.endsWith('.pdf')) ? `https://bantos.cloud/signed-contracts/${c.contract_number}` : `/datacenter-api/backoffice/contracts/${c.upya_id}/pdf?tenantId=${session?.tenantId}`} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-lg bg-emerald-50 text-emerald-500 hover:bg-emerald-100 transition-all" title="Ver documento firmado"><FileText size={16} /></a>
                )}
                {!CONTRACT_STATUSES.SIGNED.includes((c.status || '').toUpperCase()) && !c.signature_image && !c.signature_data && (
                  <button onClick={() => onSign(c)} className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-black text-[11px] uppercase tracking-widest border border-blue-100">Firmar</button>
                )}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

const ContractModal = ({ isOpen, onClose, onSave, contract, clients = [], products = [], inventory = [], paymentPlans = [], tenantId, onOpenPayment }) => {
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
      setFormData({ status: 'Pending', product_name: '', total_value: 0, paid_value: 0, client_id: '', deal_name: '' });
      setSelectedFile(null);
      setSignature(null);
      setActiveMode('form');
    }
  }, [contract, isOpen, clients]);

  useEffect(() => {
    let timer;
    if (isOpen) {
      timer = setTimeout(() => {
        const initPad = (canvas, refName) => {
          try {
            if (!canvas) return;
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
              penColor: 'rgb(30, 64, 175)',
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

      onSave(uploadData, true);
    } else {
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-100">
        <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{contract ? `Editar Contrato` : 'Nuevo Contrato'}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Gestión de Deal / Suscripción</p>
            </div>
            
            {!contract && (
              <div className="flex bg-white p-1 rounded-2xl border border-slate-100 ml-4 shadow-sm">
                <button 
                  onClick={() => setActiveMode('form')}
                  className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeMode === 'form' ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Formulario
                </button>
                <button 
                  onClick={() => setActiveMode('import')}
                  className={`px-4 py-2 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all ${activeMode === 'import' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Importar & Firmar
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {contract && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.open(`/datacenter-api/backoffice/contracts/${contract.upya_id}/pdf?tenantId=${tenantId}`, '_blank')}
                  className="p-3 bg-white rounded-2xl text-blue-600 hover:text-blue-800 hover:shadow-md transition-all border border-blue-100 flex items-center gap-2 font-black text-[12px] uppercase tracking-widest"
                >
                  <Printer size={20} /> Imprimir
                </button>
                
                <button 
                  onClick={() => onOpenPayment({ ...contract, ...formData })}
                  className="p-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 hover:shadow-lg transition-all border border-emerald-500 flex items-center gap-2 font-black text-[12px] uppercase tracking-widest"
                >
                  <CreditCard size={20} /> Pagar
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-600 hover:shadow-md transition-all border border-slate-100"><X size={20} /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <AnimatePresence mode="wait">
            {activeMode === 'form' ? (
              <motion.div key="form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Users size={14} /> Información del Cliente</h3>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">CLIENTE</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.client_id || ''} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                        <option value="">Seleccionar cliente...</option>
                        {(clients || []).map(c => <option key={c.upya_id || c.id} value={c.upya_id}>{c.name} ({c.client_number || c.upya_id})</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado del Contrato</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})}>
                        {[
                          { val: 'Signed', lab: 'Signed' },
                          { val: 'Approved', lab: 'Approved' },
                          { val: 'Pending', lab: 'Pending' },
                          { val: 'Rejected', lab: 'Rejected' },
                          { val: 'Locked', lab: 'Pendiente (Locked)' },
                          { val: 'Enabled', lab: 'Enabled' },
                          { val: 'Paidoff', lab: 'Paidoff' }
                        ].map(s => <option key={s.val} value={s.val}>{s.lab}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] flex items-center gap-2"><CreditCard size={14} /> Detalles del Plan & Producto</h3>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">PRODUCTO</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-base" value={formData.product_name || ''} onChange={e => setFormData({...formData, product_name: e.target.value})}>
                        <option value="">Seleccionar producto...</option>
                        {(products || []).map(p => (
                          <option key={p.id || p.upya_id} value={p.name}>{p.name} ({p.category || 'General'})</option>
                        ))}
                        {formData.product_name && !(products || []).some(p => p.name === formData.product_name) && (
                          <option value={formData.product_name}>{formData.product_name}</option>
                        )}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">PLAN</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-base" value={formData.deal_name || ''} onChange={e => setFormData({...formData, deal_name: e.target.value})}>
                        <option value="">Seleccionar plan...</option>
                        {(paymentPlans || []).map(p => (
                          <option key={p.upya_id || p.id} value={p.name}>{p.name} ({p.type})</option>
                        ))}
                        {formData.deal_name && !(paymentPlans || []).some(p => p.name === formData.deal_name) && (
                          <option value={formData.deal_name}>{formData.deal_name}</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 md:p-8">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Valor Total del Contrato</label>
                    <input type="number" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.total_value || 0} onChange={e => setFormData({...formData, total_value: e.target.value})} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Monto Pagado a la Fecha</label>
                    <input type="number" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.paid_value || 0} onChange={e => setFormData({...formData, paid_value: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><PenTool size={14} /> Firma Digital del Contrato</h3>
                  
                  {contract && contract.signature_image ? (
                    <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-10 flex flex-col items-center gap-6 relative overflow-hidden">
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Verificada</div>
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                        <ShieldCheck size={40} className="text-emerald-500" />
                      </div>
                      <div className="text-center space-y-2">
                        <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Firma Protegida e Inmutable</p>
                        <p className="text-[12px] font-bold text-emerald-600/60 uppercase tracking-widest">Registrada digitalmente el {new Date(contract.created_at || Date.now()).toLocaleDateString()}</p>
                      </div>
                      <img src={contract.signature_image} alt="Firma guardada" className="max-h-32 opacity-90 mix-blend-multiply transition-all hover:scale-105" />
                      <div className="pt-4 border-t border-emerald-100 w-full text-center">
                        <p className="text-[11px] text-emerald-700/50 font-bold uppercase tracking-widest italic">Esta firma es parte integral del documento y no puede ser modificada</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-[32px] p-2 relative group overflow-hidden">
                        <canvas 
                          ref={canvasManualRef} 
                          className="w-full h-48 cursor-crosshair bg-white rounded-[24px] relative z-[100] border border-blue-200" 
                          style={{ touchAction: 'none', pointerEvents: 'auto' }}
                        />
                        <div className="absolute bottom-6 right-6 flex gap-2 z-[110]">
                          <button 
                            type="button"
                            onClick={handleClearSignature}
                            className="p-3 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95"
                            title="Limpiar firma"
                          >
                            <RefreshCw size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[12px] font-bold text-slate-400 text-center uppercase tracking-widest">
                        {contract ? 'Añade la firma para actualizar el contrato firmado' : 'Al firmar aquí, se generará un documento .docx basado en el formulario'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key="import" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><Upload size={14} /> Importación de Documento</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Cliente Asociado</label>
                      <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.client_id || ''} onChange={e => setFormData({...formData, client_id: e.target.value})}>
                        <option value="">Seleccionar cliente...</option>
                        {(clients || []).map(c => <option key={c.upya_id} value={c.upya_id}>{c.name} ({c.client_number})</option>)}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Documento (.docx o .pdf)</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full aspect-video border-2 border-dashed rounded-[32px] flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${selectedFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-blue-300'}`}
                      >
                        <input type="file" ref={fileInputRef} className="hidden" accept=".docx,.pdf" onChange={handleFileChange} />
                        {selectedFile ? (
                          <>
                            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl shadow-sm"><FileText size={32} /></div>
                            <div className="text-center px-6">
                              <p className="text-base font-black text-slate-800 line-clamp-1">{selectedFile.name}</p>
                              <p className="text-[12px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Archivo Listo</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-4 bg-white text-slate-300 rounded-2xl shadow-sm border border-slate-100"><Upload size={32} /></div>
                            <div className="text-center">
                              <p className="text-base font-black text-slate-800">Seleccionar Documento</p>
                              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mt-1">O arrastra el archivo aquí</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h3 className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2"><PenTool size={14} /> Firma del Cliente</h3>
                      
                      {contract && contract.signature_image ? (
                        <div className="bg-emerald-50 border-2 border-emerald-100 rounded-[32px] p-10 flex flex-col items-center gap-6 relative overflow-hidden">
                          <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Verificada</div>
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-emerald-100">
                            <ShieldCheck size={40} className="text-emerald-500" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">Firma Protegida e Inmutable</p>
                            <p className="text-[12px] font-bold text-emerald-600/60 uppercase tracking-widest">Vinculada al documento importado</p>
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
                            <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">Área de firma digital</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-3 justify-center text-[12px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 py-3 rounded-2xl border border-slate-100">
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

        <div className="p-5 md:p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button 
            onClick={handleLocalSave} 
            className={`px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${activeMode === 'import' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20' : 'bg-slate-900 text-white hover:bg-black shadow-slate-900/20'}`}
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden">
        <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Firmar Contrato</h2>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">Ref: {contract?.contract_number || contract?.upya_id}</p>
          </div>
          <button onClick={onClose} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-slate-600 transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-8 text-center">
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-800 uppercase tracking-widest">Dibuja tu firma en el recuadro</h3>
            <p className="text-sm text-slate-400 font-bold max-w-sm mx-auto">Al firmar este documento, aceptas los términos y condiciones del contrato de crédito de Bantos.</p>
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

          <div className="flex items-center gap-3 justify-center text-[12px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Firma digital segura y encriptada</span>
          </div>
        </div>

        <div className="p-5 md:p-8 border-t border-slate-50 bg-slate-50/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button onClick={handleSign} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-blue-600/20">Confirmar Firma</button>
        </div>
      </motion.div>
    </div>
  );
};



const ACCEPTED_STATUSES = ['PAID', 'VALIDATED', 'ACCEPTED', 'ACEPTADO', 'PAGADO', 'VALIDADO'];
const FAILED_STATUSES = ['FAILED', 'FALLADO', 'REJECTED', 'CANCELED', 'RECHAZADO', 'CANCELADO', 'REVERSED'];
const UNASSIGNED_STATUSES = ['UNASSIGNED', 'NO ASIGNADO', 'PENDING_ASSIGNMENT', 'PENDIENTE', 'UNASSIGNED_PAYMENT'];
const FINAL_STATUSES = [...ACCEPTED_STATUSES]; // Solo los aceptados son finales/bloqueados ahora

const normalizeMethod = (method) => {
  if (!method) return 'Transferencia';
  const upper = method.toUpperCase();
  if (upper.includes('TARJETA') || upper.includes('CREDIT') || upper.includes('DEBIT')) return 'Tarjeta Crédito';
  if (upper === 'CASH') return 'Efectivo';
  if (upper === 'TRANSFER') return 'Transferencia';
  if (upper === 'CHEQUE') return 'Cheque';
  if (['Transferencia', 'Tarjeta Crédito', 'Tarjeta Débito', 'Efectivo', 'Cheque', 'CLABE'].includes(method)) return method;
  return 'Transferencia';
};

const PaymentsView = ({ payments = [], onEdit, onCreate, session }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    method: ''
  });
  const [quickFilter, setQuickFilter] = useState('all');

  const safePayments = Array.isArray(payments) ? payments : [];

  const uniqueMethods = [...new Set(safePayments.map(p => normalizeMethod(p.payment_method || p.method)))].sort();

  const counts = {
    total: safePayments.length,
    accepted: safePayments.filter(p => ACCEPTED_STATUSES.includes((p.status || '').toUpperCase())).length,
    unassigned: safePayments.filter(p => UNASSIGNED_STATUSES.includes((p.status || '').toUpperCase())).length,
    failed: safePayments.filter(p => FAILED_STATUSES.includes((p.status || '').toUpperCase())).length,
  };

  const filtered = safePayments.filter(p => {
    if (!p) return false;
    const s = (p.status || '').toUpperCase();

    // Quick tab filter
    if (quickFilter === 'accepted' && !ACCEPTED_STATUSES.includes(s)) return false;
    if (quickFilter === 'unassigned' && !UNASSIGNED_STATUSES.includes(s)) return false;
    if (quickFilter === 'failed' && !FAILED_STATUSES.includes(s)) return false;

    // Advanced search filters
    const searchLow = filters.search.toLowerCase();
    const searchMatch = !filters.search || (
      (p.client_name || '').toLowerCase().includes(searchLow) ||
      (p.contract_id || '').toLowerCase().includes(searchLow) ||
      (p.id || '').toString().toLowerCase().includes(searchLow) ||
      (p.reference || '').toLowerCase().includes(searchLow)
    );

    const statusMatch = filters.status === 'all' || 
      (filters.status === 'accepted' && ACCEPTED_STATUSES.includes(s)) ||
      (filters.status === 'unassigned' && UNASSIGNED_STATUSES.includes(s)) ||
      (filters.status === 'failed' && FAILED_STATUSES.includes(s));

    const methodMatch = !filters.method || normalizeMethod(p.payment_method || p.method).toLowerCase() === filters.method.toLowerCase();

    return searchMatch && statusMatch && methodMatch;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Pagos" 
        subtitle={`${filtered.length} transacciones registradas`} 
        action={
          <button 
            onClick={onCreate} 
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
          >
            <Plus size={16} /> Nuevo Pago
          </button>
        }
      />

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setQuickFilter('all'); setFilters({ ...filters, status: 'all' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Todos los Pagos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('accepted'); setFilters({ ...filters, status: 'accepted' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'accepted' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Aceptados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'accepted' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>{counts.accepted}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('unassigned'); setFilters({ ...filters, status: 'unassigned' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'unassigned' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>No Asignados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'unassigned' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>{counts.unassigned}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('failed'); setFilters({ ...filters, status: 'failed' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'failed' ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Fallados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'failed' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700'}`}>{counts.failed}</span>
        </button>
      </div>

      {/* Advanced Filter Bar Grid */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda por Cliente / Contrato / ID</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
              placeholder="Buscar pago..." 
              value={filters.search} 
              onChange={e => setFilters({...filters, search: e.target.value})} 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado de Pago</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.status} 
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Todos los estados</option>
            <option value="accepted">Aceptados</option>
            <option value="unassigned">No Asignados</option>
            <option value="failed">Fallados</option>
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setQuickFilter('all'); setFilters({ search: '', status: 'all', method: '' }); }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      <Table 
        cols={['Fecha', 'Contrato', 'Cliente', 'Monto', 'Método', 'Estado', 'Acciones']} 
        rows={filtered} 
        render={p => (
          <>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
              <p className="text-[12px] text-slate-400 font-medium">{p.payment_date ? new Date(p.payment_date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}</p>
            </td>
            <td className="px-8 py-5">
              <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-lg font-black tracking-wider uppercase border border-slate-200">{p.contract_id || '—'}</span>
            </td>
            <td className="px-8 py-5">
              <p className="font-black text-slate-900 leading-tight">{p.client_name || '—'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-black tracking-widest uppercase">{p.client_number || 'S/N'}</span>
                {p.product_name && <span className="text-[12px] text-slate-400 font-bold">{p.product_name}</span>}
              </div>
            </td>
            <td className="px-8 py-5 font-black text-slate-900">${Number(p.amount || 0).toLocaleString()}</td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg">
                <CreditCard size={14} className="text-slate-400" />
                <span className="text-slate-600 text-xs font-bold">{normalizeMethod(p.payment_method || p.method)}</span>
              </div>
            </td>
            <td className="px-8 py-5"><Badge status={p.status} /></td>
            <td className="px-8 py-5 flex items-center gap-2">
              <button 
                onClick={() => window.open(`/datacenter-api/backoffice/payments/${p.id}/pdf?tenantId=${session?.tenantId}`, '_blank')}
                className="p-3 bg-slate-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                title="Imprimir Voucher"
              >
                <Printer size={16} />
              </button>
              
              
              <button 
                onClick={() => onEdit(p)} 
                className={`p-3 rounded-xl transition-all ${FINAL_STATUSES.includes((p.status || '').toUpperCase()) ? 'bg-slate-50 text-slate-400 hover:bg-slate-200 shadow-sm active:scale-95' : 'bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white shadow-sm active:scale-95'}`}
                title={FINAL_STATUSES.includes((p.status || '').toUpperCase()) ? 'Ver detalle de pago' : 'Editar pago'}
              >
                <Settings2 size={16} />
              </button>
            </td>
          </>
        )}
        renderMobile={p => (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-slate-900 text-lg">${Number(p.amount || 0).toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{p.payment_date ? new Date(p.payment_date).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
              </div>
              <Badge status={p.status} />
            </div>
            <div className="pt-4 border-t border-slate-50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Cliente:</span>
                <span className="font-black text-slate-800 text-right">{p.client_name || '—'}<br/><span className="text-blue-600 text-[10px] uppercase">{p.client_number || 'S/N'}</span></span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400 font-bold">Método:</span>
                <div className="flex items-center gap-1.5 text-slate-600 font-medium"><CreditCard size={14} /> {p.method || '—'}</div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => window.open(`/datacenter-api/backoffice/payments/${p.id}/pdf?tenantId=${session?.tenantId}`, '_blank')} className="p-2.5 bg-slate-50 text-blue-600 rounded-xl"><Printer size={16} /></button>
                <button onClick={() => onEdit(p)} className={`p-2.5 rounded-xl ${FINAL_STATUSES.includes((p.status || '').toUpperCase()) ? 'bg-slate-50 text-slate-200' : 'bg-slate-50 text-slate-400'}`}><Settings2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
};

const SettlementModal = ({ isOpen, onClose, contract, session, onSettled }) => {
  const [quote, setQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [method, setMethod] = useState('Transferencia SPEI');
  const [notes, setNotes] = useState('');
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(null);
  const [dynamicoreSuccess, setDynamicoreSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && contract) {
      fetchQuote();
    } else {
      setQuote(null);
      setDiscountAmount(0);
      setNotes('');
    }
  }, [isOpen, contract]);

  const fetchQuote = async () => {
    setLoadingQuote(true);
    try {
      const res = await axios.get(`${API}/backoffice/contracts/${contract.upya_id || contract.contract_number}/settlement-quote?tenantId=${session?.tenantId}`);
      setQuote(res.data);
    } catch (e) {
      alert('Error al cotizar el finiquito: ' + (e.response?.data?.error || e.message));
      onClose();
    } finally {
      setLoadingQuote(false);
    }
  };

  if (!isOpen || !contract) return null;

  const remaining = quote ? quote.remaining_balance : 0;
  const finalAmount = Math.max(0, remaining - parseFloat(discountAmount || 0));

  const handleSettle = async (e, token = null) => {
    if (e) e.preventDefault();
    if (finalAmount <= 0 && remaining > 0 && !confirm('El monto a pagar es $0. ¿Seguro que deseas condonar/finiquitar el 100% restante?')) {
      return;
    }
    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/backoffice/contracts/${contract.upya_id || contract.contract_number}/settle`, {
        tenantId: session?.tenantId,
        userId: session?.id,
        orgId: session?.scope?.orgId,
        amount: finalAmount,
        discount_amount: parseFloat(discountAmount || 0),
        method,
        notes: token ? `Pago procesado con tarjeta (Token: ${token.substring(0,6)}...) \n${notes}` : notes
      });
      alert(res.data.message || 'Finiquito procesado exitosamente.');
      if (onSettled) onSettled();
      onClose();
    } catch (err) {
      alert('Error al finiquitar el crédito: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">Finiquitar Crédito Anticipadamente</h3>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Contrato: {contract.contract_number || contract.upya_id}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
        </div>

        {loadingQuote ? (
          <div className="py-12 text-center text-slate-500 font-bold">Calculando desglose del finiquito...</div>
        ) : quote ? (
          <form onSubmit={handleSettle} className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Cliente:</span>
                <span className="font-bold text-slate-800">{quote.client_name || 'N/A'} ({quote.client_number || '—'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Monto Total Financiado:</span>
                <span className="font-bold text-slate-800">${Number(quote.total_value).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Abonado hasta el momento:</span>
                <span className="font-bold text-emerald-600">${Number(quote.paid_amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-black">
                <span className="text-slate-700">Saldo Restante Insoluto:</span>
                <span className="text-amber-600 text-base">${Number(quote.remaining_balance).toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Descuento por Pronto Pago / Ajuste ($)</label>
              <input 
                type="number" 
                step="0.01"
                min="0"
                max={quote.remaining_balance}
                value={discountAmount} 
                onChange={e => setDiscountAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-amber-500"
                placeholder="0.00"
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-xs font-black text-amber-800 uppercase tracking-widest block mb-1">Monto Neto a Pagar para Finiquitar</span>
              <span className="text-2xl font-black text-amber-900">${finalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Método de Pago</label>
              <select 
                value={method} 
                onChange={e => setMethod(e.target.value)} 
                className="w-full px-3 py-2 border rounded-xl font-bold text-slate-800"
              >
                <option value="Transferencia SPEI">Transferencia SPEI</option>
                <option value="Efectivo / Ventanilla">Efectivo / Ventanilla</option>
                <option value="Tarjeta de Débito/Crédito">Tarjeta de Débito/Crédito</option>
                <option value="Condonación Total">Condonación Total</option>
              </select>
            </div>

            {method === 'Tarjeta de Débito/Crédito' && (
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 flex flex-col space-y-4 relative">
                {iframeError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{iframeError}</span>
                  </div>
                )}
                {dynamicoreSuccess ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600"><CheckSquare size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800">¡Pago Validado!</h3>
                    <p className="text-slate-500 mt-2">La tarjeta fue procesada con éxito y el finiquito se ha registrado.</p>
                  </div>
                ) : (
                  <>
                    <DynamicoreIframeContainer 
                      iframeId="dynamicore-action-iframe"
                      amount={finalAmount} 
                      clientId={quote.client_id || contract.client_id} 
                      isRecurring={false}
                      recurringDates={[]} 
                      onSuccess={(token) => {
                        setDynamicoreSuccess(true);
                        handleSettle(null, token);
                      }} 
                      onError={setIframeError} 
                      onLoading={setIframeLoading} 
                    />
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm z-10 rounded-xl">
                        <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-black uppercase text-slate-500 tracking-wider mb-1">Notas / Justificación del Finiquito</label>
              <textarea 
                rows="2" 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                className="w-full px-3 py-2 border rounded-xl text-xs text-slate-800" 
                placeholder="Ej. Cliente liquida por pronto pago con bonificación acordada..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 text-xs uppercase tracking-wider">Cancelar</button>
              
              {method === 'Tarjeta de Débito/Crédito' && !dynamicoreSuccess ? (
                <button 
                  type="button"
                  disabled={iframeLoading || finalAmount <= 0}
                  onClick={() => {
                    setIframeError(null);
                    setIframeLoading(true);
                    const iframe = document.getElementById('dynamicore-action-iframe');
                    if (window.DynamicoreHelper && typeof window.DynamicoreHelper.submit === 'function') {
                      window.DynamicoreHelper.submit();
                    } else if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.postMessage({ type: 'SUBMIT_FORM', action: 'tokenize' }, '*');
                    } else {
                      setTimeout(() => { setIframeError('No se pudo conectar con el formulario de pagos.'); setIframeLoading(false); }, 1000);
                    }
                  }} 
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 flex items-center gap-2"
                >
                  {iframeLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                  Procesar Tarjeta Segura
                </button>
              ) : method === 'Tarjeta de Débito/Crédito' && !dynamicoreSuccess ? (
                <button 
                  type="button"
                  disabled={finalAmount <= 0}
                  onClick={() => handleSettle(null, 'test_tok_bypass_' + Math.random().toString(36).substring(7))} 
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <Lock size={14} />
                  Procesar Tarjeta
                </button>
              ) : (
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-600/30">
                  {submitting ? 'Procesando...' : 'Confirmar Finiquito'}
                </button>
              )}
            </div>
          </form>
        ) : null}
      </div>
    </div>
  );
};

const DynamicoreIframeContainer = ({ amount, clientId, isRecurring, recurringDates, onSuccess, onError, onLoading, iframeId = 'dynamicore-iframe' }) => {
  const dynamicorePublicKey = import.meta.env.VITE_DYNAMICORE_PUBLIC_KEY || 'REEMPLAZAR_PUBLIC_KEY';
  const dynamicoreKeyId = import.meta.env.VITE_DYNAMICORE_KEY_ID || 'REEMPLAZAR_KEY_ID';

  useEffect(() => {
    const handleMessage = async (event) => {
      if (!event.data) return;
      let tokenId = null;
      if (typeof event.data === 'object' && event.data.type === 'DYNAMICORE_TOKEN') {
        tokenId = event.data.token_id || event.data.token;
      } else if (typeof event.data === 'string' && event.data.includes('TOKEN:')) {
        const match = event.data.match(/TOKEN:\s*([a-zA-Z0-9-]+)/);
        if (match) tokenId = match[1];
      }
      if (tokenId) processPayment(tokenId);
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [amount, clientId, isRecurring, recurringDates, onSuccess, onError, onLoading]);

  const processPayment = async (tokenId) => {
    onLoading(true);
    try {
      const baseURL = API.replace('/api', '');

      // Paso 3: Asignar tarjeta al cliente → obtener payment_method_id real (message.id)
      const res1 = await axios.post(`${baseURL}/card-payments/assign-card`, {
        customer_id: clientId,
        token_id: tokenId
      });
      const paymentMethodId = res1.data.payment_method_id || tokenId;

      // Paso 4: Ejecutar cargo directo con el payment_method correcto
      const res2 = await axios.post(`${baseURL}/card-payments/transactions`, {
        customer_id: clientId,
        payment_method: paymentMethodId,
        amount: parseFloat(amount)
      });

      // Domiciliación: crear suscripción si aplica
      if (isRecurring) {
        const parsedDates = Array.isArray(recurringDates)
          ? recurringDates
          : (recurringDates||'').split(',').map(s => parseInt(s?.trim())).filter(d => !isNaN(d) && d > 0 && d <= 31);
        await axios.post(`${baseURL}/card-payments/subscriptions`, {
          customer_id: clientId,
          payment_method: paymentMethodId,
          recurring_dates: parsedDates.length > 0 ? parsedDates : [new Date().getDate()]
        });
      }

      // 3-D Secure: redirigir al challenge del banco emisor si existe redirection_url
      if (res2.data.redirection_url) {
        window.location.href = res2.data.redirection_url;
        return;
      }

      onSuccess(paymentMethodId);
    } catch (err) {
      console.error('Error procesando pago:', err);
      onError('Hubo un error al procesar tu pago. Verifica los fondos o intenta con otra tarjeta.');
    } finally {
      onLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-2xl bg-white shadow-sm relative w-full" style={{ overflow: 'hidden', height: '430px' }}>
      <iframe 
        id={iframeId} 
        src={`${import.meta.env.BASE_URL}dynamicore-v2.html?keyId=${encodeURIComponent(dynamicoreKeyId)}&publicKey=${encodeURIComponent(dynamicorePublicKey)}`}
        title="Pago Seguro Dynamicore"
        style={{ width: '800px', height: '500px', border: 'none', position: 'absolute', left: '50%', top: '-70px', transform: 'translateX(-50%)' }}
      ></iframe>
      <div className="flex justify-center items-center space-x-2 text-xs text-slate-400 mt-2">
        <Lock size={12} />
        <span>Tus datos están encriptados y protegidos por Dynamicore</span>
      </div>
    </div>
  );
};

export const PaymentFormContent = ({
  formData, setFormData, isReadOnly, contracts, clients, selectedDeal, deals,
  onOpenClientModal, iframeError, setIframeError, dynamicoreSuccess, setDynamicoreSuccess,
  iframeLoading, setIframeLoading, showSchedule, setShowSchedule, iframeId = 'dynamicore-iframe',
  isWizardMode = false
}) => {
  return (
    <>
    <div className="space-y-6 md:col-span-5">
      <p className="text-[12px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Información del Pago / Venta</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
              {!isWizardMode && (
                <>
                  <div className="col-span-2 space-y-1.5">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">ID Contrato / Upya</label>
                    <select disabled={isReadOnly} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.contract_id || ''} onChange={e => {
                      const c = contracts?.find(x => x.contract_number === e.target.value || x.upya_id === e.target.value);
                      let matchedClientId = c?.client_id;
                      if (c && clients) {
                        const matchedClient = clients.find(cl => 
                          (c.client_id && cl.upya_id === c.client_id) || 
                          (c.client_number && cl.client_number === c.client_number) || 
                          (c.client_name && (cl.name === c.client_name || `${cl.name} ${cl.last_name || ''}`.trim() === c.client_name))
                        );
                        if (matchedClient) matchedClientId = matchedClient.upya_id || matchedClient.id;
                      }
                      setFormData({...formData, contract_id: e.target.value, client_id: matchedClientId || formData.client_id});
                    }}>
                      <option value="">-- Seleccionar Contrato --</option>
                      {contracts?.map(c => <option key={c.upya_id || c.contract_number} value={c.contract_number || c.upya_id}>{c.contract_number || c.upya_id} - {c.client_name}</option>)}
                    </select>
                  </div>

                  <div className="col-span-2 space-y-1.5">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Cliente Asociado</label>
                      {!isReadOnly && (
                        <button type="button" onClick={onOpenClientModal} className="text-[11px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800">+ Crear Nuevo Cliente</button>
                      )}
                    </div>
                    <select 
                      disabled={isReadOnly || !!formData.contract_id} 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none disabled:opacity-70" 
                      value={formData.client_id || ''} 
                      onChange={e => setFormData({...formData, client_id: e.target.value})}
                    >
                      <option value="">Seleccionar cliente...</option>
                      {(clients || []).map(c => (
                        <option key={c.upya_id || c.id} value={c.upya_id || c.id}>{c.name} {c.last_name} ({c.client_number || c.id})</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Monto ($)</label>
                <div className="relative">
                  <input disabled={isReadOnly} type="number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                  {!formData.contract_id && selectedDeal && !isReadOnly && !isWizardMode && (
                    <button type="button" onClick={() => {
                      const deal = deals?.find(d => String(d.name) === String(selectedDeal));
                      if (deal) setFormData({...formData, amount: deal.total_cost || 0});
                    }} className="absolute right-3 top-3 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-md font-bold">Autocompletar Total</button>
                  )}
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Método</label>
                <select disabled={isReadOnly} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.method} onChange={e => {
                  const newMethod = e.target.value;
                  const isCard = newMethod === 'Tarjeta Crédito' || newMethod === 'Tarjeta Débito';
                  setFormData({...formData, method: newMethod, is_recurring: isCard ? formData.is_recurring : false});
                }}>
                  {['Transferencia', 'Tarjeta Crédito', 'Tarjeta Débito', 'Efectivo', 'Cheque', 'CLABE'].map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
                <select disabled={isReadOnly} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base appearance-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  {['Pending', 'Paid', 'Failed', 'Unassigned'].map(s => <option key={s} value={s}>{s === 'Pending' ? 'Pendiente' : s === 'Paid' ? 'Pagado/Aceptado' : s === 'Failed' ? 'Fallido' : 'No Asignado'}</option>)}
                </select>
              </div>
 
              <div className="col-span-2 space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Fecha de Pago</label>
                {isWizardMode ? (
                  <div className="w-full bg-slate-100/50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-500 text-base">
                    {new Date(formData.payment_date || new Date()).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </div>
                ) : (
                  <input disabled={isReadOnly} type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.payment_date} onChange={e => setFormData({...formData, payment_date: e.target.value})} />
                )}
              </div>
            </div>
 
            <div className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 space-y-4">
              <label className={`flex items-center gap-3 group ${(formData.method !== 'Tarjeta Crédito' && formData.method !== 'Tarjeta Débito') || isReadOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                <div onClick={() => {
                  if (isReadOnly || (formData.method !== 'Tarjeta Crédito' && formData.method !== 'Tarjeta Débito')) return;
                  setFormData({...formData, is_recurring: !formData.is_recurring});
                }} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_recurring ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 bg-white'}`}>{!!formData.is_recurring && <CheckSquare size={14} />}</div>
                <span className="text-sm font-black text-slate-600 uppercase tracking-wider">Habilitar Pago Recurrente</span>
              </label>
 
              {!!formData.is_recurring && (
                <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                  {formData.repayment_frequency ? (
                    <div>
                      <label className="text-[11px] font-black uppercase tracking-widest text-blue-400 ml-1">Frecuencia de Pago Automática</label>
                      <div className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 px-5 font-bold text-slate-800 text-base flex justify-between items-center">
                        <span>Cada {formData.repayment_frequency} días</span>
                        {formData.repayment_amount && <span className="text-blue-600 bg-blue-50 px-2 py-1 rounded-md text-sm">Cuota: {formData.repayment_amount}</span>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <label className="text-[11px] font-black uppercase tracking-widest text-blue-400 ml-1">Días de Recurrencia (Ej. 01, 15)</label>
                      <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-blue-100 rounded-xl py-3 px-5 font-bold text-slate-800 text-base" placeholder="Separados por coma" value={formData.recurring_dates.join(', ')} onChange={e => setFormData({...formData, recurring_dates: e.target.value.split(',').map(s => s.trim())})} />
                    </>
                  )}
                  
                  {(formData.repayment_frequency || formData.recurring_dates.filter(d => parseInt(d) > 0 && parseInt(d) <= 31).length > 0) && (
                    <div className="mt-4">
                      <button type="button" onClick={() => setShowSchedule(!showSchedule)} className="text-[12px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> {showSchedule ? 'Ocultar cronograma' : 'Ver cronograma de pagos'}
                      </button>
                      
                      {showSchedule && (
                        <div className="mt-3 bg-white rounded-xl border border-blue-100 p-4 max-h-[200px] overflow-y-auto relative">
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Próximos 12 pagos proyectados</p>
                            <button type="button" onClick={() => {
                              const printContent = document.getElementById('payment-schedule-content').innerHTML;
                              const printWindow = window.open('', '', 'height=600,width=800');
                              printWindow.document.write('<html><head><title>Cronograma de Pagos</title><style>body{font-family:sans-serif;padding:20px;} .item{display:flex;justify-content:space-between;border-bottom:1px solid #ccc;padding:10px 0;} .title{font-size:18px;font-weight:bold;margin-bottom:20px;}</style></head><body>');
                              printWindow.document.write('<div class="title">Cronograma de Pagos Proyectados</div>');
                              printWindow.document.write(printContent);
                              printWindow.document.write('</body></html>');
                              printWindow.document.close();
                              setTimeout(() => { printWindow.print(); }, 500);
                            }} className="text-slate-400 hover:text-slate-700 transition-colors" title="Imprimir Cronograma">
                              <Printer size={14} />
                            </button>
                          </div>
                          <div className="space-y-2" id="payment-schedule-content">
                            {(() => {
                              const [pyear, pmonth, pday] = (formData.payment_date || '').split('-').map(Number);
                              const now = formData.payment_date && pyear
                                ? new Date(pyear, pmonth - 1, pday, 12, 0, 0)
                                : new Date();
                              const dates = [];

                              if (formData.repayment_frequency) {
                                let nextDate = new Date(now.getTime());
                                for (let i = 0; i < 12; i++) {
                                  dates.push(new Date(nextDate.getTime()));
                                  nextDate.setDate(nextDate.getDate() + formData.repayment_frequency);
                                }
                              } else {
                                const days = formData.recurring_dates.map(d => parseInt(d)).filter(d => !isNaN(d) && d > 0 && d <= 31).sort((a,b) => a - b);
                                if (!days.length) return null;
                                let currentMonth = now.getMonth();
                                let currentYear = now.getFullYear();
                                for (let i = 0; i < 12; i++) {
                                  for (const day of days) {
                                    if (i === 0 && day <= now.getDate()) continue;
                                    const date = new Date(currentYear, currentMonth, day, 12, 0, 0);
                                    if (date.getMonth() !== currentMonth % 12) { date.setDate(0); }
                                    dates.push(date);
                                  }
                                  currentMonth++;
                                  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
                                }
                              }

                              return dates.slice(0, 12).map((d, i) => (
                                <div key={i} className="item flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                  <span className="text-sm font-bold text-slate-700">Pago #{i + 1}</span>
                                  <span className="text-sm font-medium text-slate-500">
                                    {d.toLocaleDateString('es-MX', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 md:col-span-7">
            <p className="text-[12px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Datos de Cuenta / Tarjeta</p>
            
            <div className="bg-slate-50 p-5 md:p-8 rounded-[40px] border border-slate-100 relative overflow-hidden">
              <div className={(formData.method === 'Tarjeta Crédito' || formData.method === 'Tarjeta Débito') ? 'block relative' : 'absolute opacity-0 -left-[9999px] pointer-events-none'}>
                {iframeError && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl flex items-start text-sm border border-red-100 mb-4">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{iframeError}</span>
                  </div>
                )}
                {dynamicoreSuccess ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 text-emerald-600"><CheckSquare size={32} /></div>
                    <h3 className="text-xl font-bold text-slate-800">¡Pago Validado!</h3>
                    <p className="text-slate-500 mt-2">La tarjeta fue procesada con éxito y se registrará al guardar.</p>
                  </div>
                ) : (
                  <>
                    <DynamicoreIframeContainer 
                      iframeId={iframeId}
                      amount={formData.amount} 
                      clientId={formData.client_id} 
                      isRecurring={formData.is_recurring} 
                      recurringDates={formData.recurring_dates} 
                      onSuccess={(token) => {
                        setDynamicoreSuccess(true);
                        setFormData({...formData, account_number: 'TOKEN:'+token.substring(0,6)+'...', status: 'Paid'});
                      }} 
                      onError={setIframeError} 
                      onLoading={setIframeLoading} 
                    />
                    {iframeLoading && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-sm z-10 rounded-[40px]">
                        <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className={(formData.method !== 'Tarjeta Crédito' && formData.method !== 'Tarjeta Débito') ? 'block space-y-6' : 'hidden'}>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Titular de la Cuenta</label>
                  <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-base" value={formData.card_holder || ''} onChange={e => setFormData({...formData, card_holder: e.target.value})} placeholder="Nombre como aparece en cuenta" />
                </div>
  
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Número de Cuenta / Referencia / CLABE</label>
                  <div className="relative">
                    <input disabled={isReadOnly} type="text" className="w-full bg-white border-2 border-slate-100 rounded-xl py-3.5 px-5 font-bold text-slate-800 focus:border-emerald-500 outline-none transition-all text-base pr-12" value={formData.account_number || ''} onChange={e => setFormData({...formData, account_number: e.target.value})} placeholder="Referencia de pago..." />
                  </div>
                </div>
              </div>
            </div>

            {isReadOnly && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-4">
                <div className="p-2 bg-amber-100 rounded-lg text-red-600"><ShieldCheck size={18} /></div>
                <p className="text-[11px] font-bold text-blue-800 leading-relaxed">
                  Este registro está <span className="font-black uppercase">Protegido</span>. 
                  Al estar en estado aceptado o pagado, no se permiten modificaciones para asegurar la integridad financiera.
                </p>
              </div>
            )}
          </div>
        </>
  );
};

const PaymentModal = ({ isOpen, onClose, payment, onSave, clients, contracts, session, products, inventory, deals, onOpenClientModal, onSaveContract, globalSettings }) => {
  const [formData, setFormData] = useState({
    amount: 0, method: 'Transferencia', status: 'Pending', contract_id: '', client_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    account_number: '', card_holder: '', is_recurring: false, recurring_dates: [],
    repayment_frequency: null, repayment_amount: null
  });
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(null);
  const [dynamicoreSuccess, setDynamicoreSuccess] = useState(false);

  useEffect(() => {
    setShowSchedule(false);
    if (payment) {
      const mappedMethod = normalizeMethod(payment.method || payment.payment_method);

      setFormData({
        ...payment,
        method: mappedMethod,
        is_recurring: !!payment.is_recurring,
        payment_date: payment.payment_date ? new Date(payment.payment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        recurring_dates: payment.recurring_dates ? (typeof payment.recurring_dates === 'string' ? JSON.parse(payment.recurring_dates) : payment.recurring_dates) : [],
        repayment_frequency: payment.repayment_frequency ?? null,
        repayment_amount: payment.repayment_amount ?? null
      });
    } else {
      setFormData({
        amount: 0, method: 'Transferencia', status: 'Pending', contract_id: '', client_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        account_number: '', card_holder: '', is_recurring: false, recurring_dates: [],
        repayment_frequency: null, repayment_amount: null
      });
    }
  }, [payment]);

  useEffect(() => {
    if (formData.contract_id && contracts && !payment) {
      const contract = contracts.find(c => c.contract_number === formData.contract_id || c.upya_id === formData.contract_id);
      if (contract && contract.repayment_frequency) {
        setFormData(prev => ({
          ...prev,
          is_recurring: true,
          repayment_frequency: contract.repayment_frequency,
          repayment_amount: contract.repayment_amount || prev.amount
        }));
      }
    }
  }, [formData.contract_id, contracts, payment]);

  if (!isOpen) return null;

  const originalStatusUpper = (payment?.status || '').toUpperCase();
  const isReadOnly = payment ? FINAL_STATUSES.includes(originalStatusUpper) : false;
  const statusUpper = (formData.status || '').toUpperCase();
  const isAccepted = ACCEPTED_STATUSES.includes(statusUpper);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-[1100px] rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[95vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><CreditCard size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{payment ? (isReadOnly ? 'Detalle de Pago' : 'Editar Pago') : 'Nuevo Registro de Pago'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Gestión de Cobranza & Conciliación</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {payment?.id && (
              <button 
                onClick={() => window.open(`/datacenter-api/backoffice/payments/${payment.id}/pdf?tenantId=${session?.tenantId}`, '_blank')}
                className="p-3 bg-white rounded-2xl text-blue-600 hover:text-blue-800 hover:shadow-md transition-all border border-blue-100 flex items-center gap-2 font-black text-[12px] uppercase tracking-widest"
              >
                <Printer size={20} /> Voucher
              </button>
            )}
            <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
          </div>
        </div>

        <div className="p-5 md:p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-10">
          <PaymentFormContent
            formData={formData} setFormData={setFormData} isReadOnly={isReadOnly} contracts={contracts}
            clients={clients} selectedDeal={selectedDeal} deals={deals} onOpenClientModal={onOpenClientModal}
            iframeError={iframeError} setIframeError={setIframeError} dynamicoreSuccess={dynamicoreSuccess}
            setDynamicoreSuccess={setDynamicoreSuccess} iframeLoading={iframeLoading} setIframeLoading={setIframeLoading}
            showSchedule={showSchedule} setShowSchedule={setShowSchedule} iframeId="dynamicore-modal-iframe"
          />
        </div>

        <div className="p-5 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button onClick={onClose} className="px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] text-slate-400 hover:text-slate-600 transition-all">Cerrar</button>
          <div className="flex-1" />
          {!isReadOnly && (
            (formData.method === 'Tarjeta Crédito' || formData.method === 'Tarjeta Débito') && !dynamicoreSuccess ? (
              <button 
                disabled={iframeLoading || !formData.client_id || !formData.amount}
                onClick={() => {
                  setIframeError(null);
                  setIframeLoading(true);
                  const iframe = document.getElementById('dynamicore-modal-iframe');
                  if (window.DynamicoreHelper && typeof window.DynamicoreHelper.submit === 'function') {
                    window.DynamicoreHelper.submit();
                  } else if (iframe && iframe.contentWindow) {
                    iframe.contentWindow.postMessage({ type: 'SUBMIT_FORM', action: 'tokenize' }, '*');
                  } else {
                    setTimeout(() => { setIframeError('No se pudo conectar con el formulario de pagos.'); setIframeLoading(false); }, 1000);
                  }
                }} 
                className="px-14 bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
              >
                {iframeLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                Procesar Tarjeta Segura
              </button>
            ) : (
              <button onClick={() => onSave({...formData, selectedProductId, serialNumber, selectedDeal})} className="px-14 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-95 transition-all">
                {payment ? 'Actualizar Pago' : 'Registrar Solicitud'}
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
};

const SmartExcelImportModal = ({ isOpen, onClose, onImportSuccess, tenantId, user }) => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [rawRows, setRawRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [loading, setLoading] = useState(false);
  const [resultStats, setResultStats] = useState(null);
  const [error, setError] = useState(null);

  const targetFields = [
    { key: 'name', label: 'Nombre del Producto / Modelo', required: true, keywords: ['nombre', 'producto', 'modelo', 'device', 'description', 'descripción', 'item'] },
    { key: 'model', label: 'Modelo (agrupador)', required: false, keywords: ['model', 'modelo base', 'familia', 'linea', 'device model'] },
    { key: 'variant', label: 'Variante (RAM/Color/Almac.)', required: false, keywords: ['variante', 'variant', 'version', 'versión', 'color', 'ram', 'storage', 'almacenamiento', 'capacidad'] },
    { key: 'reference', label: 'Referencia / Código SKU', required: false, keywords: ['referencia', 'sku', 'código', 'codigo', 'ref', 'part', 'id'] },
    { key: 'category', label: 'Categoría', required: false, keywords: ['categoría', 'categoria', 'tipo', 'grupo', 'category'] },
    { key: 'manufacturer', label: 'Marca / Fabricante', required: false, keywords: ['marca', 'fabricante', 'vendor', 'brand', 'make'] },
    { key: 'base_value', label: 'Precio / Costo Base', required: false, keywords: ['precio', 'costo', 'valor', 'monto', 'price', 'cost'] },
    { key: 'serial_number', label: 'Número de Serie (S/N)', required: false, keywords: ['serie', 'sn', 'serial', 'numero de serie', 's/n', 'nro serie'] },
    { key: 'imei1', label: 'IMEI 1 (Dispositivo)', required: false, keywords: ['imei', 'imei1', 'imei 1', 'celular imei'] },
    { key: 'imei2', label: 'IMEI 2 (Opcional Dual SIM)', required: false, keywords: ['imei2', 'imei 2', 'segundo imei'] },
  ];

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setError(null);
    setLoading(true);

    try {
      const XLSX = await loadXLSXLib();
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { defval: '' });

          if (data.length === 0) {
            setError('El archivo Excel está vacío o no tiene un formato válido.');
            setLoading(false);
            return;
          }

          const detectedHeaders = Object.keys(data[0]);
          setHeaders(detectedHeaders);
          setRawRows(data);

          // Auto-Matching Algorithm
          const initialMapping = {};
          targetFields.forEach(field => {
            const match = detectedHeaders.find(h => {
              const normalized = h.toLowerCase().trim();
              return field.keywords.some(kw => normalized.includes(kw));
            });
            initialMapping[field.key] = match || '';
          });

          setMapping(initialMapping);
          setStep(2);
        } catch (err) {
          console.error(err);
          setError('Error procesando el archivo Excel: ' + err.message);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(uploadedFile);
    } catch (libErr) {
      console.error(libErr);
      setError('Error al cargar el motor de lectura Excel: ' + libErr.message);
      setLoading(false);
    }
  };

  const getMappedItems = () => {
    return rawRows.map(row => {
      const item = {};
      Object.keys(mapping).forEach(targetKey => {
        const excelCol = mapping[targetKey];
        if (excelCol && row[excelCol] !== undefined && row[excelCol] !== '') {
          item[targetKey] = row[excelCol];
        }
      });
      return item;
    }).filter(item => item.name || item.reference || item.imei1 || item.serial_number);
  };

  const handleConfirmImport = async () => {
    const mappedItems = getMappedItems();
    if (mappedItems.length === 0) {
      setError('No hay elementos válidos para importar. Asigna al menos la columna Nombre o IMEI/Serie.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API}/backoffice/products/import-batch`, {
        username: user?.username,
        tenantId,
        items: mappedItems
      });

      if (res.data.success) {
        setResultStats(res.data.stats);
        setStep(4);
      } else {
        setError(res.data.message || 'Error durante la importación masiva.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setFile(null);
    setHeaders([]);
    setRawRows([]);
    setMapping({});
    setResultStats(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center pb-5 border-b border-slate-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Importador Inteligente de Excel</h3>
              <p className="text-xs font-semibold text-slate-400">Tenant Activo: <span className="text-emerald-600 uppercase font-black">{tenantId}</span></p>
            </div>
          </div>
          <button onClick={() => { resetState(); onClose(); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"><X size={20} /></button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body based on Step */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* STEP 1: Upload File */}
          {step === 1 && (
            <div className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 hover:bg-emerald-50/20 hover:border-emerald-300 transition-all text-center group cursor-pointer relative">
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-all">
                <Upload size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">Arrastra tu archivo Excel (.xlsx) aquí</h4>
              <p className="text-xs font-medium text-slate-400 max-w-sm mb-4">Soporta formatos .xlsx, .xls y .csv con catálogo e identificadores IMEI / Número de Serie.</p>
              <span className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-emerald-600/20">Seleccionar Archivo</span>
            </div>
          )}

          {/* STEP 2: Column Matcher */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 text-xs font-semibold text-emerald-900 flex justify-between items-center">
                <span>Leídas <strong>{rawRows.length} filas</strong> y <strong>{headers.length} columnas</strong> en <em>{file?.name}</em></span>
                <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">Auto-Match Activado</span>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Mapeo de Columnas (Bantos ↔ Excel)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {targetFields.map(field => (
                    <div key={field.key} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>{field.label} {field.required && <span className="text-red-500">*</span>}</span>
                        {mapping[field.key] && <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><Check size={12} /> Detectado</span>}
                      </label>
                      <select
                        value={mapping[field.key] || ''}
                        onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 transition-all"
                      >
                        <option value="">-- Ignorar este campo --</option>
                        {headers.map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-400">Vista Previa ({getMappedItems().length} registros válidos)</h4>
                <span className="text-xs font-bold text-slate-500">Mapeadas {Object.values(mapping).filter(Boolean).length} columnas</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto max-h-60">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider sticky top-0">
                    <tr>
                      <th className="p-3">Nombre</th>
                      <th className="p-3">Referencia</th>
                      <th className="p-3">Marca</th>
                      <th className="p-3">Precio</th>
                      <th className="p-3">IMEI 1 / Serie</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {getMappedItems().slice(0, 5).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{item.name || '-'}</td>
                        <td className="p-3 font-mono text-blue-600">{item.reference || '-'}</td>
                        <td className="p-3">{item.manufacturer || '-'}</td>
                        <td className="p-3">${item.base_value || 0}</td>
                        <td className="p-3 font-mono text-emerald-600">{item.imei1 || item.serial_number || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {getMappedItems().length > 5 && (
                <p className="text-[11px] font-semibold text-slate-400 text-center">...y {getMappedItems().length - 5} registros más listos para ser procesados.</p>
              )}
            </div>
          )}

          {/* STEP 4: Success Result */}
          {step === 4 && resultStats && (
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-in zoom-in duration-300">
                <Check size={32} />
              </div>
              <h4 className="text-xl font-black text-slate-900">¡Importación Exitosa!</h4>
              <p className="text-xs font-semibold text-slate-500 max-w-md">Los registros se guardaron exclusivamente para el tenant <span className="text-emerald-600 font-black uppercase">{tenantId}</span>.</p>
              
              <div className="grid grid-cols-3 gap-4 w-full pt-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-2xl font-black text-slate-900">{resultStats.productsCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Productos</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-2xl font-black text-emerald-600">{resultStats.devicesCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">IMEIs</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-2xl font-black text-blue-600">{resultStats.inventoryCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Series</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-5 border-t border-slate-100 mt-6 flex justify-between items-center">
          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Atrás</button>
              <button onClick={() => setStep(3)} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:bg-emerald-700 transition-all">Ver Vista Previa</button>
            </>
          )}

          {step === 3 && (
            <>
              <button onClick={() => setStep(2)} className="px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-slate-200 transition-all">Atrás</button>
              <button onClick={handleConfirmImport} disabled={loading} className="px-8 py-3.5 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center gap-2">
                {loading ? <RefreshCw size={16} className="animate-spin" /> : <Check size={16} />} Confirmar e Importar ({getMappedItems().length})
              </button>
            </>
          )}

          {step === 4 && (
            <button onClick={() => { resetState(); onClose(); onImportSuccess(); }} className="w-full py-3.5 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all">
              Finalizar y Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ProductsView = ({ products = [], onEdit, onCreate, onDelete, onImportSuccess, tenantId, user }) => {
  const [filters, setFilters] = useState({
    search: '',
    manufacturer: '',
    model: '',
    variant: '',
    category: '',
    type: ''
  });
  const [quickFilter, setQuickFilter] = useState('all');
  const [importModalOpen, setImportModalOpen] = useState(false);

  const safeProducts = Array.isArray(products) ? products : [];

  // Unique collections for dropdown filters
  const uniqueManufacturers = [...new Set(safeProducts.map(p => p.manufacturer || p.brand).filter(Boolean))].sort();
  const uniqueModels = [...new Set(safeProducts.map(p => p.model).filter(Boolean))].sort();
  const uniqueVariants = [...new Set(safeProducts.map(p => p.variant).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(safeProducts.map(p => p.category).filter(Boolean))].sort();

  // Quick filter count metrics
  const counts = {
    total: safeProducts.length,
    serialized: safeProducts.filter(p => p.is_serialized).length,
    nonSerialized: safeProducts.filter(p => !p.is_serialized).length,
    withVariant: safeProducts.filter(p => p.variant && p.variant.trim() !== '').length,
  };

  const canEdit = user?.role === 'admin' || user?.role === 'manager' || user?.scopeRole === 'MANAGER' || user?.scope?.role === 'MANAGER';

  const filtered = safeProducts.filter(p => {
    if (!p) return false;

    // Quick tab filter
    if (quickFilter === 'serialized' && !p.is_serialized) return false;
    if (quickFilter === 'non-serialized' && p.is_serialized) return false;
    if (quickFilter === 'with-variant' && (!p.variant || p.variant.trim() === '')) return false;

    // Advanced search filters
    const searchLow = filters.search.toLowerCase();
    const nameMatch = !filters.search || (
      (p.name || '').toLowerCase().includes(searchLow) ||
      (p.reference || p.productReference || '').toLowerCase().includes(searchLow) ||
      (p.model || '').toLowerCase().includes(searchLow) ||
      (p.manufacturer || p.brand || '').toLowerCase().includes(searchLow)
    );

    const mfgMatch = !filters.manufacturer || (p.manufacturer || p.brand || '').toLowerCase() === filters.manufacturer.toLowerCase();
    const modelMatch = !filters.model || (p.model || '').toLowerCase() === filters.model.toLowerCase();
    const variantMatch = !filters.variant || (p.variant || '').toLowerCase() === filters.variant.toLowerCase();
    const categoryMatch = !filters.category || (p.category || '').toLowerCase() === filters.category.toLowerCase();
    const typeMatch = !filters.type || (
      filters.type === 'serialized' ? p.is_serialized :
      filters.type === 'non-serialized' ? !p.is_serialized : true
    );

    return nameMatch && mfgMatch && modelMatch && variantMatch && categoryMatch && typeMatch;
  });

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Catálogo de Productos" 
        subtitle={`${filtered.length} modelos registrados`} 
        action={
          canEdit && (
            <div className="flex gap-3">
              <button 
                onClick={() => setImportModalOpen(true)} 
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
              >
                <FileSpreadsheet size={16} /> Importar Excel
              </button>
              <button 
                onClick={onCreate} 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95"
              >
                <Plus size={16} /> Nuevo Producto
              </button>
            </div>
          )
        } 
      />

      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setQuickFilter('all'); setFilters({ ...filters, type: '' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Todos los Productos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('serialized'); setFilters({ ...filters, type: 'serialized' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'serialized' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Serializados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'serialized' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>{counts.serialized}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('non-serialized'); setFilters({ ...filters, type: 'non-serialized' }); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'non-serialized' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>No Serializados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'non-serialized' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>{counts.nonSerialized}</span>
        </button>

        <button
          onClick={() => { setQuickFilter('with-variant'); }}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            quickFilter === 'with-variant' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Con Variante</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'with-variant' ? 'bg-white/20 text-white' : 'bg-purple-50 text-purple-700'}`}>{counts.withVariant}</span>
        </button>
      </div>

      {/* Advanced Filter Bar Grid */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        <div className="flex flex-col gap-1.5 md:col-span-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda / SKU / Referencia</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
              placeholder="Buscar por nombre, SKU o ref..." 
              value={filters.search} 
              onChange={e => setFilters({...filters, search: e.target.value})} 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca / Fabricante</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.manufacturer} 
            onChange={e => setFilters({...filters, manufacturer: e.target.value})}
          >
            <option value="">Todas las marcas</option>
            {uniqueManufacturers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Modelo</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.model} 
            onChange={e => setFilters({...filters, model: e.target.value})}
          >
            <option value="">Todos los modelos</option>
            {uniqueModels.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Variante</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.variant} 
            onChange={e => setFilters({...filters, variant: e.target.value})}
          >
            <option value="">Todas las variantes</option>
            {uniqueVariants.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <button 
            onClick={() => { setQuickFilter('all'); setFilters({ search: '', manufacturer: '', model: '', variant: '', category: '', type: '' }); }}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      <Table 
        cols={canEdit ? ['Nombre / Marca', 'Modelo', 'Variante', 'Referencia / SKU', 'Disponibles', 'Categoría', 'Tipo', 'Acciones'] : ['Nombre / Marca', 'Modelo', 'Variante', 'Referencia / SKU', 'Disponibles', 'Categoría', 'Tipo']} 
        rows={filtered} 
        render={p => (
          <>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-800 text-sm">{p.name}</p>
              <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{p.manufacturer || p.brand || '—'}</p>
            </td>
            <td className="px-8 py-5 text-slate-700 font-bold text-sm">{p.model || <span className="text-slate-300">—</span>}</td>
            <td className="px-8 py-5 text-slate-600 text-sm font-semibold">{p.variant || <span className="text-slate-300">—</span>}</td>
            <td className="px-8 py-5 font-mono text-blue-600 font-bold text-sm">{p.reference || p.productReference || '—'}</td>
            <td className="px-8 py-5">
              <span className={`px-3 py-1 rounded-full text-[12px] font-black ${p.stock_available > 0 ? 'text-emerald-600 bg-emerald-50 border border-emerald-100' : 'text-slate-400 bg-slate-100'}`}>
                {p.stock_available || 0}
              </span>
            </td>
            <td className="px-8 py-5 text-slate-500 font-bold text-xs uppercase tracking-wider">{p.category || 'General'}</td>
            <td className="px-8 py-5">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.is_serialized ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                {p.is_serialized ? 'Serializado' : 'No Ser.'}
              </span>
            </td>
            {canEdit && (
              <td className="px-8 py-5">
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(p)} className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all" title="Editar Producto"><Settings2 size={16} /></button>
                  <button onClick={() => onDelete(p)} className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all" title="Eliminar Producto"><Trash2 size={16} /></button>
                </div>
              </td>
            )}
          </>
        )} 
      />

      <SmartExcelImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportSuccess={onImportSuccess || (() => {})}
        tenantId={tenantId}
        user={user}
      />
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
            <button key={f} onClick={() => setFilter(f)} className={`px-6 py-2.5 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
        </div>
      </div>
      <div className="flex justify-end mb-4"><button onClick={onCreate} className="flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all"><Plus size={16} /> Nuevo Formulario</button></div>
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
    <Table cols={['Fecha', 'Usuario', 'Tipo', 'ID Recurso', 'Estado']} rows={audit} render={r => (<><td className="px-8 py-5 text-slate-400 text-sm">{r.fecha_registro ? new Date(r.fecha_registro).toLocaleString('es-MX') : '—'}</td><td className="px-8 py-5 font-bold">{r.cliente || 'Sistema'}</td><td className="px-8 py-5 font-black text-[12px] uppercase tracking-wider text-blue-600">{r.tipo || 'SYNC'}</td><td className="px-8 py-5 font-mono text-slate-400 text-sm">{r.ref_contrato}</td><td className="px-8 py-5"><Badge status={r.estado} /></td></>)} />
  </div>
);

const TrustonicDeviceModal = ({ isOpen, onClose, device, onSave }) => {
  const [formData, setFormData] = useState({ imei1: '', imei2: '', service: 'Prepago', status: 'Inactivo', brand: '', model: '', expiration_date: '' });
  
  useEffect(() => {
    if (device) {
      setFormData({ 
        ...device, 
        expiration_date: device.expiration_date ? new Date(device.expiration_date).toISOString().split('T')[0] : '' 
      });
    } else {
      setFormData({ imei1: '', imei2: '', service: 'Prepago', status: 'Inactivo', brand: '', model: '', expiration_date: '' });
    }
  }, [device]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full h-full md:h-auto md:max-w-4xl rounded-none md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] md:max-h-[95vh]">
        <div className="p-5 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20"><Smartphone size={24} /></div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">{device ? 'Editar Dispositivo' : 'Nuevo Dispositivo'}</h3>
              <p className="text-slate-400 text-[12px] font-bold uppercase tracking-widest mt-0.5">Portal de Gestión Trustonic</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400"><X size={20} /></button>
        </div>
        
        <div className="p-10 overflow-y-auto flex-1 grid grid-cols-3 gap-10">
          <div className="col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">IMEI 1 (*)</label>
                <input type="text" disabled={!!device} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all disabled:opacity-50 text-base" value={formData.imei1} onChange={e => setFormData({...formData, imei1: e.target.value})} placeholder="3524..." />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">IMEI 2</label>
                <input type="text" disabled={!!device} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all disabled:opacity-50 text-base" value={formData.imei2} onChange={e => setFormData({...formData, imei2: e.target.value})} placeholder="Opcional" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">Servicio</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})}>
                  <option>Prepago</option><option>Pospago</option><option>Inventario</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado</label>
                <select className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option>Inactivo</option><option>Listo para su uso</option><option>Activo</option><option>Bloqueado</option><option>Liberado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">Marca</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Samsung" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">Modelo</label>
                <input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="A14" />
              </div>
              <div className="space-y-2">
                <label className="text-[12px] font-black uppercase tracking-widest text-slate-400 ml-1">Expiración</label>
                <input type="date" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 focus:border-blue-600 outline-none transition-all text-base" value={formData.expiration_date} onChange={e => setFormData({...formData, expiration_date: e.target.value})} />
              </div>
            </div>
          </div>

          {/* Información de Control Interno */}
          <div className="bg-slate-50 rounded-[32px] p-5 md:p-8 space-y-6 border border-slate-100">
            <div>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Control Interno</p>
              <div className="space-y-5">
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">ID del Dispositivo</label>
                  <p className="font-mono text-base font-bold text-slate-600">{device?.id || 'Nuevo'}</p>
                </div>
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Visto por primera vez</label>
                  <p className="text-base font-bold text-slate-600">{device?.created_at ? new Date(device.created_at).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Último cambio</label>
                  <p className="text-base font-bold text-slate-600">{device?.last_change ? new Date(device.last_change).toLocaleString() : '—'}</p>
                </div>
                <div>
                  <label className="block text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">Última conexión</label>
                  <p className="text-base font-bold text-slate-600">{device?.last_connection ? new Date(device.last_connection).toLocaleString() : '—'}</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={14} />
                <p className="text-[11px] font-bold uppercase tracking-widest">Datos Automáticos</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8 bg-white border-t border-slate-100 flex justify-end gap-4">
          <button onClick={onClose} className="px-8 py-4 font-black uppercase tracking-widest text-[11px] text-slate-400 hover:text-slate-600 transition-all">Cancelar</button>
          <button onClick={() => onSave(formData)} className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-blue-600/20 transition-all active:scale-95">Guardar Cambios</button>
        </div>
      </motion.div>
    </div>
  );
};

const TrustonicActionModal = ({ isOpen, onClose, device, actionType, onConfirm, loading }) => {
  const [comment, setComment] = useState('');
  const [lockMessage, setLockMessage] = useState('Dispositivo bloqueado por falta de pago');
  const [title, setTitle] = useState('Aviso Bantos');
  const [message, setMessage] = useState('Estimado cliente, por favor póngase al día con su cuota.');
  const [reason, setReason] = useState('End of Tenure');
  const [targetTenantId, setTargetTenantId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setComment('');
      setTargetTenantId('');
      if (actionType === 'lock') setLockMessage('Dispositivo bloqueado por falta de pago');
      if (actionType === 'lock_message') setLockMessage('Favor de comunicarse para regularizar su cuenta.');
      if (actionType === 'notificar') {
        setTitle('Aviso Bantos');
        setMessage('Estimado cliente, recuerde realizar su pago a tiempo.');
      }
      if (actionType === 'liberar') setReason('End of Tenure');
    }
  }, [isOpen, actionType]);

  if (!isOpen || !device) return null;

  const getActionMeta = () => {
    switch (actionType) {
      case 'lock': return { name: 'Lock (Bloquear)', icon: Lock, color: 'text-rose-600', bg: 'bg-rose-50' };
      case 'unlock': return { name: 'UnLock (Desbloquear)', icon: Unlock, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'inhabilitar': return { name: 'Inhabilitar Dispositivo', icon: Ban, color: 'text-amber-600', bg: 'bg-amber-50' };
      case 'liberar': return { name: 'Liberar Dispositivo', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' };
      case 'notificar': return { name: 'Enviar Notificación', icon: Bell, color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'pin_unlock': return { name: 'PIN Unlock', icon: KeyRound, color: 'text-cyan-600', bg: 'bg-cyan-50' };
      case 'lock_message': return { name: 'Mensaje de Bloqueo', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' };
      case 'report_stolen': return { name: 'Reportar Robo (Theft)', icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' };
      case 'transfer_tenant': return { name: 'Transferir a otro Tenant', icon: RefreshCw, color: 'text-violet-600', bg: 'bg-violet-50' };
      case 'activate': return { name: 'Activate (Activar Servicio)', icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' };
      case 'deactivate': return { name: 'Deactivate (Desactivar Servicio)', icon: Ban, color: 'text-amber-600', bg: 'bg-amber-50' };
      default: return { name: 'Ejecutar Acción', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' };
    }
  };

  const meta = getActionMeta();
  const IconComponent = meta.icon;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      action: actionType,
      imei: device.imei1,
      comment,
      lockMessage,
      title,
      message,
      reason,
      targetTenantId
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl ${meta.bg} flex items-center justify-center ${meta.color}`}>
              <IconComponent size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">{meta.name}</h3>
              <p className="text-xs font-mono font-bold text-slate-400">IMEI: {device.imei1}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-50"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(actionType === 'lock' || actionType === 'lock_message') && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Mensaje en Pantalla del Teléfono</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={lockMessage}
                onChange={e => setLockMessage(e.target.value)}
              />
            </div>
          )}

          {actionType === 'notificar' && (
            <>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Título Notificación</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Mensaje Notificación</label>
                <textarea 
                  required
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
            </>
          )}

          {actionType === 'liberar' && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">Motivo de Liberación</label>
              <input 
                type="text" 
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          )}

          {actionType === 'transfer_tenant' && (
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">ID del Tenant Destino</label>
              <input 
                type="text" 
                required
                placeholder="Ejemplo: sotelo, tests, c-romel..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
                value={targetTenantId}
                onChange={e => setTargetTenantId(e.target.value)}
              />
            </div>
          )}

          {/* CAMPO DE COMENTARIO OBLIGATORIO PARA TODAS LAS ACCIONES */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 ml-1">
              Comentario / Justificación de la Acción <span className="text-red-500">*</span>
            </label>
            <textarea 
              required
              rows={3}
              placeholder="Escriba un comentario u observación sobre esta operación..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Ejecutando...' : 'Confirmar y Ejecutar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TrustonicDevicesView = ({ data, onSync, syncing, onEdit, onCreate, session, onRefresh }) => {
  const { devices = [], summary = [] } = data;
  const [filters, setFilters] = useState({ imei: '', service: '', status: '', brand: '', model: '' });
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [openMenuImei, setOpenMenuImei] = useState(null);
  const [actionModalState, setActionModalState] = useState({ open: false, device: null, actionType: null });
  const [executingAction, setExecutingAction] = useState(false);

  // Cerrar menú emergente al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuImei(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleOpenActionModal = (actionType, device) => {
    setOpenMenuImei(null);
    setActionModalState({ open: true, device, actionType });
  };

  const handleConfirmActionModal = async (actionData) => {
    setExecutingAction(true);
    try {
      const payload = { ...actionData, tenantId: session?.tenantId };
      const res = await axios.post(`${API}/backoffice/trustonic-actions`, payload);
      if (res.data.success) {
        alert(`✅ Acción "${actionData.action.toUpperCase()}" ejecutada exitosamente para IMEI ${actionData.imei}`);
        setActionModalState({ open: false, device: null, actionType: null });
        if (onRefresh) await onRefresh();
      } else {
        alert(`⚠️ Ocurrió un inconveniente: ${res.data.error || 'No se pudo completar'}`);
      }
    } catch (err) {
      alert(`Error al ejecutar acción Trustonic: ` + (err.response?.data?.error || err.message));
    } finally {
      setExecutingAction(false);
    }
  };

  // Normalizar y filtrar filas de Total o datos inválidos capturados por el scraper
  const normalizedDevices = devices
    .map(d => {
      const serviceKeywords = ['prepago', 'pospago', 'postpago'];
      if (d.imei1 && serviceKeywords.some(k => d.imei1.toLowerCase().includes(k))) {
        return {
          ...d,
          imei1: d.imei2,
          imei2: '—',
          service: d.imei1,
        };
      }
      return d;
    })
    .filter(d => {
      const hasImei = d.imei1 && d.imei1 !== '—' && d.imei1.length > 5;
      const isNotTotal = !d.imei1?.toLowerCase().includes('total');
      return hasImei && isNotTotal;
    });

  // Servicios únicos disponibles
  const availableServices = Array.from(new Set([
    'Prepago', 'Pospago', 'Liberado', 'Inventario', 'Listo para su uso',
    ...normalizedDevices.map(d => d.service).filter(Boolean)
  ])).sort();

  // Marcas únicas disponibles
  const availableBrands = Array.from(new Set(normalizedDevices.map(d => d.brand?.toUpperCase()).filter(Boolean))).sort();

  // Conteos para tabs de navegación rápida
  const counts = {
    total: normalizedDevices.length,
    prepago: normalizedDevices.filter(d => {
      const s = (d.service || '').toLowerCase();
      return s.includes('prepago') || s.includes('prepaid');
    }).length,
    pospago: normalizedDevices.filter(d => {
      const s = (d.service || '').toLowerCase();
      return s.includes('pospago') || s.includes('postpago') || s.includes('postpaid');
    }).length,
    liberado: normalizedDevices.filter(d => {
      const st = (d.status || '').toLowerCase();
      return st.includes('liber') || st.includes('releas');
    }).length,
    inventario: normalizedDevices.filter(d => {
      const s = (d.service || '').toLowerCase();
      const st = (d.status || '').toLowerCase();
      return s.includes('inventario') || st.includes('inactivo') || st.includes('inactive') || st.includes('idle');
    }).length,
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('es-MX', { month: 'short', day: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const filteredDevices = normalizedDevices.filter(d => {
    const searchService = filters.service.toLowerCase();
    const deviceService = (d.service || '').toLowerCase();
    const deviceStatus = (d.status || '').toLowerCase();
    const deviceImei1 = (d.imei1 || '').toLowerCase();
    const deviceImei2 = (d.imei2 || '').toLowerCase();
    
    const isPostpagoMatch = searchService === 'pospago' && (deviceService.includes('pospago') || deviceService.includes('postpago') || deviceService.includes('postpaid'));
    const isPrepagoMatch = searchService === 'prepago' && (deviceService.includes('prepago') || deviceService.includes('prepaid'));
    const isLiberadoServiceMatch = searchService === 'liberado' && (deviceStatus.includes('liber') || deviceStatus.includes('releas'));
    const isInventarioMatch = searchService === 'inventario' && (deviceService.includes('inventario') || deviceStatus.includes('inactivo') || deviceStatus.includes('inactive') || deviceStatus.includes('idle'));
    
    const serviceMatch = !filters.service || isPostpagoMatch || isPrepagoMatch || isLiberadoServiceMatch || isInventarioMatch || deviceService.includes(searchService);
    const imeiMatch = !filters.imei || deviceImei1.includes(filters.imei.toLowerCase()) || deviceImei2.includes(filters.imei.toLowerCase());

    const statusMatch = !filters.status || (
      filters.status === 'Liberado' ? (deviceStatus.includes('liber') || deviceStatus.includes('releas')) :
      filters.status === 'Bloqueado' ? (deviceStatus.includes('bloq') || deviceStatus.includes('lock')) :
      filters.status === 'Activo' ? (deviceStatus.includes('activ') || deviceStatus.includes('active') || deviceStatus.includes('finan')) :
      filters.status === 'Inactivo' ? (deviceStatus.includes('inact') || deviceStatus.includes('idle')) :
      filters.status === 'Listo para su uso' ? (deviceStatus.includes('listo') || deviceStatus.includes('ready')) :
      deviceStatus.includes(filters.status.toLowerCase())
    );

    const brandMatch = !filters.brand || (d.brand || '').toLowerCase().includes(filters.brand.toLowerCase());
    const modelMatch = !filters.model || (d.model || '').toLowerCase().includes(filters.model.toLowerCase());

    return serviceMatch && imeiMatch && statusMatch && brandMatch && modelMatch;
  }).sort((a, b) => {
    const tA = a.last_change ? new Date(a.last_change).getTime() : 0;
    const tB = b.last_change ? new Date(b.last_change).getTime() : 0;
    return tB - tA;
  });

  const renderStatusBadge = (statusStr) => {
    const st = (statusStr || '').toLowerCase();
    let label = statusStr || 'Desconocido';
    let colorClass = 'bg-amber-100 text-amber-700';

    if (st.includes('liber') || st.includes('releas')) {
      label = 'Liberado';
      colorClass = 'bg-slate-100 text-slate-700';
    } else if (st.includes('bloq') || st.includes('lock')) {
      label = 'Bloqueado';
      colorClass = 'bg-rose-100 text-rose-700';
    } else if (st.includes('activ') || st.includes('active') || st.includes('finan')) {
      label = 'Activo';
      colorClass = 'bg-emerald-100 text-emerald-700';
    } else if (st.includes('listo') || st.includes('ready')) {
      label = 'Listo para su uso';
      colorClass = 'bg-blue-100 text-blue-700';
    } else if (st.includes('inact') || st.includes('idle') || st.includes('inven')) {
      label = 'Inactivo';
      colorClass = 'bg-amber-100 text-amber-700';
    }

    return (
      <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dispositivos Trustonic (Smartphones)" 
        subtitle="Inventario e inspección de seguridad en tiempo real" 
        action={
          <div className="flex gap-3">
            <button 
              onClick={onSync} 
              disabled={syncing || executingAction} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw size={16} className={syncing || executingAction ? 'animate-spin' : ''} /> 
              {syncing ? 'Sincronizando...' : executingAction ? 'Procesando...' : 'Sincronizar Trustonic'}
            </button>
          </div>
        } 
      />

      {/* Tabs de Filtro Rápido */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setFilters({ ...filters, service: '' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            filters.service === '' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Todos los Dispositivos</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${filters.service === '' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, service: 'Prepago' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            filters.service === 'Prepago' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Prepago</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${filters.service === 'Prepago' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'}`}>{counts.prepago}</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, service: 'Pospago' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            filters.service === 'Pospago' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Pospago</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${filters.service === 'Pospago' ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-700'}`}>{counts.pospago}</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, service: 'Liberado' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            filters.service === 'Liberado' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Liberados</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${filters.service === 'Liberado' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'}`}>{counts.liberado}</span>
        </button>

        <button
          onClick={() => setFilters({ ...filters, service: 'Inventario' })}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
            filters.service === 'Inventario' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
          }`}
        >
          <span>Inventario / Inactivo</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${filters.service === 'Inventario' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>{counts.inventario}</span>
        </button>
      </div>

      {/* Barra de Filtros Avanzada tipo Portal Trustonic */}
      <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IMEI</label>
          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
              placeholder="000000000000000" 
              value={filters.imei} 
              onChange={e => setFilters({...filters, imei: e.target.value})} 
            />
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Servicio</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.service} 
            onChange={e => setFilters({...filters, service: e.target.value})}
          >
            <option value="">Todos los servicios</option>
            {availableServices.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Marca</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.brand} 
            onChange={e => setFilters({...filters, brand: e.target.value})}
          >
            <option value="">Todas las marcas</option>
            {availableBrands.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado Actual</label>
          <select 
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all"
            value={filters.status} 
            onChange={e => setFilters({...filters, status: e.target.value})}
          >
            <option value="">Todos los estados</option>
            <option value="Activo">Activo</option>
            <option value="Bloqueado">Bloqueado</option>
            <option value="Liberado">Liberado</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Listo para su uso">Listo para su uso</option>
          </select>
        </div>

        <div>
          <button 
            onClick={() => setFilters({ imei: '', service: '', status: '', brand: '', model: '' })}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} /> Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Tabla de Dispositivos tipo Trustonic Portal */}
      <Table 
        cols={['IMEI 1', 'IMEI 2', 'Servicio', 'Estado actual', 'Marca', 'Modelo', 'Último cambio', 'Última conexión', 'Acciones']} 
        rows={filteredDevices} 
        render={d => (
          <>
            <td className="px-8 py-5 font-mono text-sm font-bold text-blue-600">{d.imei1}</td>
            <td className="px-8 py-5 font-mono text-sm text-slate-400">{d.imei2 || '—'}</td>
            <td className="px-8 py-5 text-xs font-black uppercase tracking-wider text-slate-700">
              <span className={`px-3 py-1 rounded-lg ${
                (d.service || '').toLowerCase().includes('pospago') ? 'bg-indigo-50 text-indigo-700' :
                (d.service || '').toLowerCase().includes('prepago') ? 'bg-blue-50 text-blue-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {d.service || 'Desconocido'}
              </span>
            </td>
            <td className="px-8 py-5">
              {renderStatusBadge(d.status)}
            </td>
            <td className="px-8 py-5 font-black text-sm uppercase text-slate-800">{d.brand || '—'}</td>
            <td className="px-8 py-5 text-slate-600 font-bold text-sm">{d.model || '—'}</td>
            <td className="px-8 py-5 text-xs text-slate-500 font-bold">{formatDate(d.last_change)}</td>
            <td className="px-8 py-5 text-xs text-slate-500 font-bold">{formatDate(d.last_connection)}</td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setSelectedDevice(d)} 
                  className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100"
                  title="Ver Detalle"
                >
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => onEdit(d)} 
                  className="p-2 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all border border-slate-100"
                  title="Editar Dispositivo"
                >
                  <Edit size={16} />
                </button>

                {/* Menú Tres Puntos (...) Acciones API Trustonic */}
                <div className="relative inline-block text-left">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuImei(openMenuImei === d.imei1 ? null : d.imei1);
                    }} 
                    className={`p-2 rounded-xl transition-all border ${
                      openMenuImei === d.imei1 ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border-slate-100'
                    }`}
                    title="Opciones Trustonic"
                  >
                    <MoreVertical size={16} />
                  </button>

                  {openMenuImei === d.imei1 && (
                    <div 
                      className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 py-2 divide-y divide-slate-100 text-left font-bold text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="px-3 py-1.5 text-[9px] font-black uppercase text-slate-400 tracking-wider">Acciones Trustonic</div>
                      <div className="py-1">
                        <button 
                          onClick={() => handleOpenActionModal('lock', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors"
                        >
                          <Lock size={14} className="text-rose-500" /> Lock (Bloquear)
                        </button>
                        <button 
                          onClick={() => handleOpenActionModal('unlock', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 transition-colors"
                        >
                          <Unlock size={14} className="text-emerald-500" /> UnLock (Desbloquear)
                        </button>
                        {/* <button 
                          onClick={() => handleOpenActionModal('inhabilitar', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-amber-50 text-slate-700 hover:text-amber-600 transition-colors"
                        >
                          <Ban size={14} className="text-amber-500" /> Inhabilitar
                        </button> */}
                        <button 
                          onClick={() => handleOpenActionModal('liberar', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 transition-colors"
                        >
                          <CheckCircle2 size={14} className="text-indigo-500" /> Liberar
                        </button>
                      </div>
                      <div className="py-1">
                        <button 
                          onClick={() => handleOpenActionModal('notificar', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors"
                        >
                          <Bell size={14} className="text-blue-500" /> Notificar
                        </button>
                        <button 
                          onClick={() => handleOpenActionModal('pin_unlock', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-cyan-50 text-slate-700 hover:text-cyan-600 transition-colors"
                        >
                          <KeyRound size={14} className="text-cyan-500" /> PIN Unlock
                        </button>
                        <button 
                          onClick={() => handleOpenActionModal('lock_message', d)} 
                          className="w-full px-3.5 py-2 flex items-center gap-2.5 hover:bg-purple-50 text-slate-700 hover:text-purple-600 transition-colors"
                        >
                          <MessageSquare size={14} className="text-purple-500" /> Lock Message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </td>
          </>
        )} 
      />

      {/* Modal de Confirmación y Comentarios para Acciones API Trustonic */}
      <TrustonicActionModal 
        isOpen={actionModalState.open}
        onClose={() => setActionModalState({ open: false, device: null, actionType: null })}
        device={actionModalState.device}
        actionType={actionModalState.actionType}
        onConfirm={handleConfirmActionModal}
        loading={executingAction}
      />

      {/* Modal Detalle de Dispositivo */}
      {selectedDevice && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">Detalle de Dispositivo</h3>
                <p className="text-xs text-slate-400 font-bold font-mono mt-0.5">{selectedDevice.imei1}</p>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-slate-50"><X size={18} /></button>
            </div>
            <div className="space-y-4 text-sm font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">IMEI 1</p>
                  <p className="font-mono text-blue-600">{selectedDevice.imei1}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">IMEI 2</p>
                  <p className="font-mono text-slate-500">{selectedDevice.imei2 || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Servicio</p>
                  <p>{selectedDevice.service || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Estado Actual</p>
                  <p className="text-emerald-600">{selectedDevice.status || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Marca</p>
                  <p>{selectedDevice.brand || '—'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Modelo</p>
                  <p>{selectedDevice.model || '—'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Último Cambio</p>
                  <p>{formatDate(selectedDevice.last_change)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black uppercase text-slate-400">Última Conexión</p>
                  <p>{formatDate(selectedDevice.last_connection)}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedDevice(null)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TermsView = ({ deals, onEdit, onCreate, onDelete }) => (
  <div className="space-y-8">
    <PageHeader 
      title="Términos & Condiciones (Deals)" 
      subtitle="Gobernanza de planes financieros y términos de venta de Upya" 
    />
    
    <div className="grid grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-5 md:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShieldCheck size={28} /></div>
        <div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Planes de Contado</p>
          <p className="text-2xl font-black text-slate-800">{deals.filter(d => d.type === 'Contado' || d.type === 'Fijo' || d.type === 'PAYG').length}</p>
        </div>
      </div>
      <div className="bg-white p-5 md:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><CreditCard size={28} /></div>
        <div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Planes a Crédito</p>
          <p className="text-2xl font-black text-slate-800">{deals.filter(d => d.type === 'Crédito' || d.type === 'Abono' || d.type === 'INSTALMENTS').length}</p>
        </div>
      </div>
      <div className="bg-white p-5 md:p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6">
        <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-600"><Tag size={28} /></div>
        <div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Total Planes</p>
          <p className="text-2xl font-black text-slate-800">{deals.length}</p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 md:p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Listado de Términos (Homologado con Upya)</p>
        <button onClick={onCreate} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-blue-600/20 hover:scale-105 transition-all"><Plus size={14} /> Nuevo Término</button>
      </div>
      <Table 
        cols={['Tipo', 'Nombre del Plan', 'Estado', 'Acciones']} 
        rows={deals} 
        render={d => (
          <>
            <td className="px-8 py-5">
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${(d.type === 'PAYG' || d.type === 'Fijo' || d.type === 'Contado') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{d.type}</span>
            </td>
            <td className="px-8 py-5 font-bold text-slate-800">{d.name}</td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-2 font-black text-[12px] uppercase tracking-wider text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {d.status || 'Active'}
              </div>
            </td>
            <td className="px-8 py-5">
              <div className="flex items-center gap-2">
                <button onClick={() => onEdit(d)} className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition-all"><Settings2 size={16} /></button>
                <button onClick={() => onDelete(d)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>
            </td>
          </>
        )} 
        renderMobile={d => (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="font-bold text-slate-800">{d.name}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${(d.type === 'PAYG' || d.type === 'Fijo' || d.type === 'Contado') ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>{d.type}</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
              <div className="flex items-center gap-2 font-black text-[11px] uppercase tracking-wider text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                {d.status || 'Active'}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(d)} className="p-2 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded-lg transition-all"><Settings2 size={16} /></button>
                <button onClick={() => onDelete(d)} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-lg transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  </div>
);

// --- TRUSTONIC LOGS VIEW ---
const TrustonicLogsView = ({ data, onSync, syncing }) => {
  const [filters, setFilters] = useState({ brand: '', model: '', imei1: '' });

  const columns = [
    { key: 'brand', label: 'Marca' },
    { key: 'model', label: 'Modelo' },
    { key: 'imei1', label: 'IMEI1' },
    { key: 'registration_date', label: 'Fecha Registro', type: 'date' },
    { key: 'status', label: 'Status' },
    { key: 'last_active', label: 'Última Fecha Activo', type: 'date' },
    { key: 'operation_type', label: 'Última Operación' },
    { key: 'comment', label: 'Causa | Comentario | Mensaje' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredData = data.filter(item => {
    return (
      (item.brand || '').toLowerCase().includes(filters.brand.toLowerCase()) &&
      (item.model || '').toLowerCase().includes(filters.model.toLowerCase()) &&
      (item.imei1 || '').toLowerCase().includes(filters.imei1.toLowerCase())
    );
  });

  return (
    <div className="flex flex-col gap-3 md:gap-5 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader 
        title="Auditoría de Dispositivos" 
        subtitle="Movimientos y operaciones registradas en Trustonic" 
        action={
          <button 
            onClick={onSync} 
            disabled={syncing} 
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[20px] font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Sincronizando...' : 'Sincronizar Movimientos'}
          </button>
        } 
      />

      {/* Barra de Filtros */}
      <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 flex flex-wrap gap-6 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Buscar por Marca</label>
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ej: Samsung..." 
              value={filters.brand}
              onChange={e => setFilters({...filters, brand: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Buscar por Modelo</label>
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ej: Galaxy A54..." 
              value={filters.model}
              onChange={e => setFilters({...filters, model: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Buscar por IMEI1</label>
          <div className="relative">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Ingrese IMEI..." 
              value={filters.imei1}
              onChange={e => setFilters({...filters, imei1: e.target.value})}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
        <button 
          onClick={() => setFilters({ brand: '', model: '', imei1: '' })}
          className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors"
        >
          Limpiar
        </button>
      </div>

      <div className="bg-white rounded-[32px] border-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                {columns.map(col => (
                  <th key={col.key} className="px-6 py-5 text-[11px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-100">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-50">
              {filteredData.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-5">
                    <span className="font-bold text-slate-900">{row.brand || '---'}</span>
                  </td>
                  <td className="px-6 py-5 text-slate-600 font-medium">{row.model || '---'}</td>
                  <td className="px-6 py-5 font-mono text-[13px] text-blue-600 font-bold">{row.imei1}</td>
                  <td className="px-6 py-5 text-slate-500 text-sm">{formatDate(row.registration_date)}</td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                      row.status === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 
                      row.status === 'Bloqueado' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-slate-500 text-sm">{formatDate(row.last_active)}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-900 font-bold text-sm">{row.operation_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-slate-500 italic text-sm">{row.comment}</td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-400 font-medium italic">
                    {data.length === 0 ? 'No se han registrado movimientos todavía.' : 'No se encontraron resultados para los filtros aplicados.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UsersView = ({ users, structure, session, refreshData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    payload.tenantId = session.tenantId;

    try {
      if (editingUser?.id) {
        await axios.put(`${API}/backoffice/users/${editingUser.id}`, payload);
      } else {
        await axios.post(`${API}/backoffice/users`, payload);
      }
      setModalOpen(false);
      refreshData();
    } catch (err) {
      alert('Error guardando usuario: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id, name) => {
    if(!confirm(`¿Seguro que deseas eliminar al usuario ${name}?`)) return;
    try {
      await axios.delete(`${API}/backoffice/users/${id}?tenantId=${session.tenantId}`);
      refreshData();
    } catch (err) {
      alert('Error eliminando usuario: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <PageHeader 
        title="Gestión de Usuarios" 
        subtitle="Administra los accesos y asigna usuarios a la estructura organizacional"
        action={
          <button onClick={() => { setEditingUser(null); setModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={16} /> Nuevo Usuario
          </button>
        }
      />

      <Table
        cols={['Contacto', 'Usuario', 'Nodo Asignado', 'Rol de Nodo', 'Acciones']}
        rows={users}
        render={u => (
          <>
            <td className="px-8 py-5">
              <p className="font-bold text-slate-700 text-sm">{u.contact_name || u.username || 'Sin Nombre'}</p>
              <p className="text-xs text-slate-400 font-medium">{u.email || 'Sin correo registrado'}</p>
            </td>
            <td className="px-8 py-5">
              <p className="font-mono text-blue-600 font-bold text-xs">{u.username || 'N/A'}</p>
            </td>
            <td className="px-8 py-5">
              {u.org_name ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs">
                  <Store size={14} /> {u.org_name}
                </div>
              ) : <span className="text-slate-300 font-bold text-xs italic">Sin Asignar</span>}
            </td>
            <td className="px-8 py-5">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${u.scope_role === 'MANAGER' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {u.scope_role || u.global_role || 'N/A'}
              </span>
            </td>
            <td className="px-8 py-5 text-right">
              <div className="flex items-center justify-end gap-1">
                <button onClick={() => { setEditingUser(u); setModalOpen(true); }} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-slate-400 transition-all" title="Editar"><Edit size={16}/></button>
                <button onClick={() => handleDelete(u.id, u.contact_name || u.username)} className="p-2 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-slate-400 transition-all" title="Eliminar"><Trash2 size={16}/></button>
              </div>
            </td>
          </>
        )}
        renderMobile={u => (
          <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-700 text-base">{u.contact_name || u.username || 'Sin Nombre'}</p>
                <p className="font-mono text-blue-600 font-bold text-xs mt-0.5">{u.username || 'N/A'}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${u.scope_role === 'MANAGER' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'}`}>
                {u.scope_role || u.global_role || 'N/A'}
              </span>
            </div>
            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400 font-medium">{u.email || 'Sin correo'}</span>
                {u.org_name ? (
                  <div className="inline-flex items-center gap-1.5 text-slate-500 font-bold text-xs">
                    <Store size={12} /> {u.org_name}
                  </div>
                ) : <span className="text-slate-300 font-bold text-xs italic">Sin Asignar</span>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingUser(u); setModalOpen(true); }} className="p-2.5 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-slate-400 transition-all"><Edit size={16}/></button>
                <button onClick={() => handleDelete(u.id, u.contact_name || u.username)} className="p-2.5 bg-slate-50 hover:bg-rose-50 hover:text-rose-600 rounded-xl text-slate-400 transition-all"><Trash2 size={16}/></button>
              </div>
            </div>
          </div>
        )}
      />

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">Asignar Rol de Usuario</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Configura el acceso de {editingUser?.contact_name || 'este usuario'}</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={20} /></button>
              </div>
              <form key={editingUser?.id || 'new'} onSubmit={handleSave} className="p-5 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre Completo</label>
                      <input name="contact_name" required defaultValue={editingUser?.contact_name || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                      <input name="email" type="email" defaultValue={editingUser?.email || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Usuario</label>
                      <input name="username" required defaultValue={editingUser?.username || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                        Contraseña {editingUser?.id ? '(Dejar en blanco para no cambiar)' : ''}
                      </label>
                      <input name="password" type="password" placeholder={editingUser?.id ? "••••••••" : "Ingresa contraseña..."} required={!editingUser?.id} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all" />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Asignación de Rol Organizacional</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nodo Asignado (Tienda/Sucursal)</label>
                        <select name="org_id" defaultValue={editingUser?.org_id || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all">
                          <option value="">-- Sin Asignar --</option>
                          {structure.map(s => (
                            <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nivel de Acceso (Rol)</label>
                        <select name="scope_role" defaultValue={editingUser?.scope_role || 'STAFF'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all">
                          <option value="STAFF">Vendedor / Staff</option>
                          <option value="MANAGER">Gerente / Manager</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all shrink-0">
                  Guardar Usuario
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrgTreeNode = ({ node, items, level = 0, onEdit, onDelete, users = [] }) => {
  const children = items.filter(item => item.parent_id === node.id);
  const [isExpanded, setIsExpanded] = useState(level < 1);
  const hasChildren = children.length > 0;

  const icons = { 'Administración': Globe, 'Manager': Building2, 'Agente': Users };
  const Icon = icons[node.type] || Building2;
  
  const colors = {
    'Administración': 'text-blue-600',
    'Manager': 'text-amber-600',
    'Agente': 'text-emerald-600',
  };
  const color = colors[node.type] || 'text-slate-400';

  const childLabels = {
    COUNTRY: 'Regiones',
    REGION: 'Sucursales',
    BRANCH: 'Tiendas',
    'Manager': 'Agentes',
    'Agente': 'Hijos'
  };
  const childLabel = childLabels[node.type] || 'Hijos';

  const assignedUser = users.find(u => u.id === node.user_id);
  const responsibleName = assignedUser ? (assignedUser.contact_name || assignedUser.username) : (node.administrator || 'Sin Responsable');

  return (
    <div className="space-y-2">
      <div 
        className={`flex items-center gap-4 p-4 rounded-[28px] border transition-all ${isExpanded ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-100'}`}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-lg transition-all ${hasChildren ? 'hover:bg-slate-100' : 'opacity-0 cursor-default'}`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100 ${color}`}>
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <h4 className="font-black text-slate-800 text-sm tracking-tight leading-none truncate">{node.name}</h4>
            <span className={`text-[8px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 shrink-0`}>
              {node.type}
            </span>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1 truncate">
            {responsibleName} • {node.upya_id}
          </p>
        </div>

        <div className="flex items-center gap-4 pr-2">
          <div className="text-right shrink-0">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-300">{childLabel}</p>
            <p className="text-[11px] font-black text-slate-700 leading-none mt-0.5">{children.length}</p>
          </div>
          <button onClick={() => onEdit(node)} className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-slate-400 transition-all"><Edit size={14} /></button>
          <button onClick={() => { if(confirm(`¿Eliminar el nodo ${node.name}? Los nodos hijos quedarán sin padre.`)) onDelete(node.id); }} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-xl text-slate-400 transition-all"><Trash2 size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {children.map(child => (
              <OrgTreeNode key={child.id} node={child} items={items} level={level + 1} users={users} onEdit={onEdit} onDelete={onDelete} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const OrganizationView = ({ structure, session, refreshData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const [users, setUsers] = useState([]);
  const [nodeType, setNodeType] = useState('Manager');
  
  const rootNodes = (structure || []).filter(item => !item.parent_id);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(`${API}/backoffice/users?tenantId=${session.tenantId}`);
        setUsers(data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };
    fetchUsers();
  }, [session.tenantId]);

  const handleSave = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    
    if (!payload.name || payload.name.trim() === '') {
      alert('El nombre del nodo no puede estar en blanco.');
      return;
    }
    payload.name = payload.name.trim();
    payload.tenantId = session.tenantId;

    try {
      if (editingNode?.id) {
        await axios.put(`${API}/backoffice/org-structure/${editingNode.id}`, payload);
      } else {
        await axios.post(`${API}/backoffice/org-structure`, payload);
      }
      setModalOpen(false);
      refreshData();
    } catch (err) {
      alert('Error guardando el nodo: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/backoffice/org-structure/${id}?tenantId=${session.tenantId}`);
      refreshData();
    } catch (err) {
      alert('Error eliminando el nodo: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHeader 
        title="Jerarquía Organizacional" 
        subtitle="Visualización y gestión del árbol operativo"
        action={
          <button onClick={() => { setEditingNode(null); setNodeType('Manager'); setModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2">
            <Plus size={16} /> Nueva Unidad
          </button>
        }
      />

      <div className="bg-slate-100/50 rounded-[48px] p-5 md:p-8 border border-slate-200/30 space-y-3">
        {rootNodes.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto text-slate-200">
              <Building2 size={32} />
            </div>
            <div>
              <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-xs">Sin Estructura Detectada</p>
              <p className="text-slate-300 font-bold text-[10px] mt-1">Crea un nodo o ejecuta la sincronización</p>
            </div>
          </div>
        ) : (
          rootNodes.map(node => (
            <OrgTreeNode key={node.id} node={node} items={structure} users={users} onEdit={(n) => { setEditingNode(n); setNodeType(n.type || 'Manager'); setModalOpen(true); }} onDelete={handleDelete} />
          ))
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="p-5 md:p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-900">{editingNode ? 'Editar Unidad' : 'Nueva Unidad'}</h3>
                  <p className="text-slate-400 font-bold text-xs mt-1">Configuración de jerarquía y propiedades</p>
                </div>
                <button onClick={() => setModalOpen(false)} className="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-slate-100 hover:text-slate-700 transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSave} className="p-5 md:p-8 space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nombre del Nodo</label>
                    <input name="name" defaultValue={editingNode?.name || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Tipo</label>
                      <select name="type" required value={nodeType} onChange={(e) => setNodeType(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all">
                        <option value="Administración">Administración</option>
                        <option value="Manager">Manager (Tienda)</option>
                        <option value="Agente">Agente</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Nodo Padre</label>
                      <select name="parent_id" defaultValue={editingNode?.parent_id || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all">
                        <option value="">-- Ninguno (Raíz) --</option>
                        {structure.filter(s => s.id !== editingNode?.id).map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Usuario Asignado</label>
                    <select name="user_id" defaultValue={editingNode?.user_id || ''} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 transition-all">
                      <option value="">-- Sin usuario asignado --</option>
                      {users.filter(u => {
                        if (nodeType === 'Administración') return u.global_role === 'admin' || u.global_role === 'superadmin';
                        if (nodeType === 'Manager') return u.global_role === 'manager';
                        if (nodeType === 'Agente') return u.global_role === 'agent';
                        return true;
                      }).map(u => (
                        <option key={u.id} value={u.id}>{u.contact_name || u.username} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  {/* Keep administrator as hidden field just in case backend still expects it, or just omit it */}
                  <input type="hidden" name="administrator" value={users.find(u => u.id === editingNode?.user_id)?.contact_name || editingNode?.administrator || ''} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-black text-sm uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-all shrink-0">
                  Guardar Nodo
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionsView = ({ onNavigate, incompleteActions = [] }) => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all'
  });
  const [quickFilter, setQuickFilter] = useState('all');

  const safeActions = Array.isArray(incompleteActions) ? incompleteActions : [];

  const counts = {
    total: safeActions.length,
    pending: safeActions.filter(a => (a.status || '').toLowerCase().includes('incomplet') || (a.status || '').toLowerCase().includes('proceso') || (a.status || '').toLowerCase().includes('pendiente')).length,
    completed: safeActions.filter(a => (a.status || '').toLowerCase().includes('complet') || (a.status || '').toLowerCase().includes('aprob')).length
  };

  const filteredActions = safeActions.filter(item => {
    if (!item) return false;
    const s = (item.status || '').toLowerCase();

    if (quickFilter === 'pending' && (!s.includes('incomplet') && !s.includes('proceso') && !s.includes('pendiente'))) return false;
    if (quickFilter === 'completed' && (!s.includes('complet') && !s.includes('aprob'))) return false;

    const searchLow = filters.search.toLowerCase();
    const searchMatch = !filters.search || (
      (item.clientName || '').toLowerCase().includes(searchLow) ||
      (item.device || '').toLowerCase().includes(searchLow) ||
      (item.date || '').toLowerCase().includes(searchLow)
    );

    return searchMatch;
  });

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* New action Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Opciones de Registro</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <button onClick={() => onNavigate('Nuevo Cliente')} className="bg-white hover:bg-slate-50 hover:border-blue-200 hover:shadow-md transition-all p-6 rounded-[24px] flex items-center gap-3 md:gap-5 text-slate-800 text-left border border-slate-100 shadow-sm group">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <span className="font-bold text-lg">Nuevo Registro de Venta</span>
          </button>
        </div>
      </div>

      {/* Incomplete actions Section */}
      <div className="space-y-6">
        <PageHeader title="Registros de Ventas" subtitle={`${filteredActions.length} registros en historial`} />

        {/* Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setQuickFilter('all'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              quickFilter === 'all' ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span>Todas las Ventas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>{counts.total}</span>
          </button>

          <button
            onClick={() => { setQuickFilter('pending'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              quickFilter === 'pending' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span>En Proceso / Incompletas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700'}`}>{counts.pending}</span>
          </button>

          <button
            onClick={() => { setQuickFilter('completed'); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
              quickFilter === 'completed' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            <span>Completadas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${quickFilter === 'completed' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'}`}>{counts.completed}</span>
          </button>
        </div>

        {/* Advanced Filter Bar Grid */}
        <div className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Búsqueda por Cliente / Dispositivo</label>
            <div className="relative">
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all" 
                placeholder="Buscar cliente o equipo..." 
                value={filters.search} 
                onChange={e => setFilters({...filters, search: e.target.value})} 
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <button 
              onClick={() => { setQuickFilter('all'); setFilters({ search: '', status: 'all' }); }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Limpiar Filtros
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Nombre de Cliente</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Dispositivo</th>
                <th className="px-8 py-5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Estatus</th>
                <th className="px-8 py-5 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredActions.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 text-base font-medium text-slate-500">{item.date}</td>
                  <td className="px-8 py-5 text-base font-bold text-slate-800">{item.clientName}</td>
                  <td className="px-8 py-5 text-base font-medium text-slate-600">{item.device}</td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-mono text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 font-bold">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => onNavigate('Nuevo Cliente', item)} className="flex items-center gap-2 bg-slate-100 hover:bg-blue-600 hover:text-white hover:shadow-md text-blue-600 font-bold px-5 py-2.5 rounded-xl transition-all text-sm">
                        <ClipboardCheck size={16} /> Completar ahora
                      </button>
                      <button className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-slate-400 font-bold">No se encontraron registros para la búsqueda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const compressImageFile = (file, maxWidth = 1280, maxHeight = 1280, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('El archivo no es una imagen válida'));
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const MobileSignaturePad = ({ onSave, uploading }) => {
  const canvasRef = useRef(null);
  const padRef = useRef(null);
  
  useEffect(() => {
    if (canvasRef.current && !padRef.current) {
      padRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: 'rgb(15, 23, 42)'
      });
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full h-40 bg-white relative touch-none">
        <canvas ref={canvasRef} width={400} height={160} className="w-full h-full cursor-crosshair" />
        <button 
          type="button"
          onClick={() => padRef.current?.clear()}
          className="absolute top-2 right-2 text-[10px] font-black bg-slate-100 hover:bg-slate-200 text-slate-500 px-3 py-1.5 rounded-lg"
        >
          Limpiar
        </button>
      </div>
      <button 
        type="button"
        disabled={uploading}
        onClick={() => {
          if (padRef.current && !padRef.current.isEmpty()) {
            onSave(padRef.current.toDataURL('image/png'));
          } else {
            alert('Por favor dibuja tu firma antes de enviar.');
          }
        }}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 active:scale-95 text-white font-black text-xs uppercase tracking-widest py-4 rounded-b-2xl text-center cursor-pointer transition-all flex items-center justify-center gap-2"
      >
        {uploading ? <RefreshCw className="animate-spin" size={16} /> : <Check size={16} />}
        <span>Enviar Firma</span>
      </button>
    </div>
  );
};

const MobileDocScannerView = ({ sessionId }) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingField, setUploadingField] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSession = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/backoffice/scan-session/${sessionId}`);
      if (res.data.success) {
        setSessionData(res.data.session);
        setError(null);
      }
    } catch (err) {
      setError('La sesión de escaneo es inválida o ha expirado.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const handleFileUpload = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(field);
    setSuccessMsg('');

    try {
      const compressedBase64 = await compressImageFile(file, 1280, 1280, 0.75);

      await axios.post(`${API}/backoffice/scan-session/${sessionId}/upload`, {
        field,
        image: compressedBase64
      });

      if (navigator.vibrate) navigator.vibrate(200);

      setSuccessMsg(`✅ ${field === 'idFront' ? 'Identificación' : 'Comprobante'} guardado y sincronizado`);
      await fetchSession();
    } catch (err) {
      console.error('Upload Error:', err);
      alert('Error al procesar o subir la imagen. Intenta nuevamente.');
    } finally {
      setUploadingField(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <RefreshCw className="animate-spin mb-4 text-blue-500" size={40} />
        <p className="font-black text-lg">Iniciando Escáner Móvil Bantos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white text-center">
        <div className="bg-slate-900 p-8 rounded-3xl max-w-sm border border-slate-800 space-y-4">
          <AlertCircle className="text-rose-500 mx-auto" size={48} />
          <h2 className="text-xl font-black">Sesión No Válida</h2>
          <p className="text-sm text-slate-400 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 max-w-lg mx-auto flex flex-col justify-between">
      <div className="space-y-6">
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-600/30">
            <Smartphone size={24} />
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">Escáner Móvil de Documentos</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Cliente: <span className="text-blue-400 font-black">{sessionData?.clientName || 'Sin Nombre'}</span>
          </p>
        </div>

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 p-4 rounded-2xl text-xs font-bold flex items-center gap-3">
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Box size={16} className="text-blue-400" /> Identificación (Frente)
            </h3>
            {sessionData?.idFront && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                ✓ Recibido
              </span>
            )}
          </div>

          {sessionData?.idFront ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
              <img src={sessionData.idFront} alt="Identificación" className="w-full h-44 object-cover" />
            </div>
          ) : (
            <div className="w-full h-36 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Camera size={32} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400">Toma una foto clara del frente de la ID</span>
            </div>
          )}

          <label className="block w-full">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={(e) => handleFileUpload('idFront', e)}
              className="hidden" 
            />
            <div className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl text-center cursor-pointer transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
              {uploadingField === 'idFront' ? <RefreshCw className="animate-spin" size={16} /> : <Camera size={16} />}
              <span>{sessionData?.idFront ? 'Volver a Tomar Foto' : 'Tomar Foto / Seleccionar'}</span>
            </div>
          </label>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" /> Comprobante Domicilio
            </h3>
            {sessionData?.proofAddress && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                ✓ Recibido
              </span>
            )}
          </div>

          {sessionData?.proofAddress ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
              <img src={sessionData.proofAddress} alt="Comprobante" className="w-full h-44 object-cover" />
            </div>
          ) : (
            <div className="w-full h-36 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/50 flex flex-col items-center justify-center text-slate-500 gap-2">
              <Camera size={32} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-400">Toma una foto del comprobante de domicilio</span>
            </div>
          )}

          <label className="block w-full">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={(e) => handleFileUpload('proofAddress', e)}
              className="hidden" 
            />
            <div className="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl text-center cursor-pointer transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2">
              {uploadingField === 'proofAddress' ? <RefreshCw className="animate-spin" size={16} /> : <Camera size={16} />}
              <span>{sessionData?.proofAddress ? 'Volver a Tomar Foto' : 'Tomar Foto / Seleccionar'}</span>
            </div>
          </label>
        </div>

        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Edit size={16} className="text-indigo-400" /> Firma del Cliente
            </h3>
            {sessionData?.signature && (
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-emerald-500/30">
                ✓ Recibido
              </span>
            )}
          </div>

          {sessionData?.signature ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-white p-4">
              <img src={sessionData.signature} alt="Firma" className="w-full h-32 object-contain" />
            </div>
          ) : (
            <div className="relative w-full border-2 border-dashed border-slate-700 rounded-2xl bg-white overflow-hidden">
               {/* We create a small interactive canvas inside the mobile view */}
               <MobileSignaturePad 
                  onSave={async (base64) => {
                    setUploadingField('signature');
                    setSuccessMsg('');
                    try {
                      await axios.post(`${API}/backoffice/scan-session/${sessionId}/upload`, {
                        field: 'signature',
                        image: base64
                      });
                      if (navigator.vibrate) navigator.vibrate(200);
                      setSuccessMsg(`✅ Firma guardada y sincronizada`);
                      await fetchSession();
                    } catch (err) {
                      alert('Error al subir la firma.');
                    } finally {
                      setUploadingField(null);
                    }
                  }} 
                  uploading={uploadingField === 'signature'}
               />
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center border-t border-slate-800 pt-4">
        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-500" /> Sincronizado en Tiempo Real con Bantos Data Center
        </p>
      </div>
    </div>
  );
};

const ActionFormView = ({ actionType, prefillData, onBack, onSaveDraft, deals, products, inventory, clients, onOpenClientModal, onSaveContract, onSavePayment, session, globalSettings }) => {
  const [selectedDeal, setSelectedDeal] = useState(prefillData?.dealId || '');
  const [selectedProductId, setSelectedProductId] = useState(() => {
    if (prefillData?.selectedProductId) return prefillData.selectedProductId;
    if (prefillData?.device && products) {
      const match = products.find(p => matchesProduct(prefillData.device, p.name));
      return match ? match.upya_id : '';
    }
    return '';
  });
  const [productSearch, setProductSearch] = useState('');
  const initialStep = prefillData?.status ? (parseInt(prefillData.status.match(/\d+/)?.[0]) || 1) : 1;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [firstName, setFirstName] = useState(prefillData?.clientName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(prefillData?.clientName?.split(' ').slice(1).join(' ') || '');
  
  const [formData, setFormData] = useState({
    serialNumber: prefillData?.serialNumber || '',
    birthDate: prefillData?.birthDate || '',
    gender: prefillData?.gender || 'Femenino',
    phoneMain: prefillData?.phoneMain || '',
    referenceName: prefillData?.referenceName || '',
    phoneEmergency: prefillData?.phoneEmergency || '',
    address: prefillData?.address || '',
    idType: prefillData?.idType || 'INE / IFE',
    idNumber: prefillData?.idNumber || '',
    signatureName: prefillData?.signatureName || '',
    idFront: prefillData?.idFront || '',
    proofAddress: prefillData?.proofAddress || '',
    signature: prefillData?.signature || ''
  });

  const [paymentFormData, setPaymentFormData] = useState({
    amount: 0, method: 'Transferencia', status: 'Pending', contract_id: '', client_id: '',
    payment_date: new Date().toISOString().split('T')[0],
    account_number: '', card_holder: '', is_recurring: false, recurring_dates: [],
    repayment_frequency: null, repayment_amount: null
  });
  
  const [iframeLoading, setIframeLoading] = useState(false);
  const [iframeError, setIframeError] = useState(null);
  const [dynamicoreSuccess, setDynamicoreSuccess] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [savedData, setSavedData] = useState(null);

  const fileFrontRef = useRef(null);
  const fileProofRef = useRef(null);
  const salesSignaturePadRef = useRef(null);
  const salesCanvasRef = useRef(null);
  const [scanSessionId, setScanSessionId] = useState(null);
  const [scanDeepLink, setScanDeepLink] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);

  const handleStartScanSession = async () => {
    try {
      const clientName = `${firstName} ${lastName}`.trim() || 'Cliente';
      const res = await axios.post(`${API}/backoffice/scan-session/create`, { clientName });
      if (res.data.success) {
        const sid = res.data.sessionId;
        setScanSessionId(sid);
        const link = `${window.location.origin}${window.location.pathname}?scanSession=${sid}`;
        setScanDeepLink(link);
        setShowScanModal(true);
      }
    } catch (err) {
      alert('Error al generar la sesión de escaneo móvil');
    }
  };

  useEffect(() => {
    let interval;
    if (showScanModal && scanSessionId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`${API}/backoffice/scan-session/${scanSessionId}`);
          if (res.data.success && res.data.session) {
            const sess = res.data.session;
            setFormData(prev => ({
              ...prev,
              ...(sess.idFront ? { idFront: sess.idFront } : {}),
              ...(sess.proofAddress ? { proofAddress: sess.proofAddress } : {}),
              ...(sess.signature ? { signature: sess.signature } : {})
            }));
            if (sess.signature && salesSignaturePadRef.current && salesSignaturePadRef.current.isEmpty()) {
              salesSignaturePadRef.current.fromDataURL(sess.signature);
            }
          }
        } catch (err) {
          // ignore polling errors
        }
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showScanModal, scanSessionId, formData.idFront, formData.proofAddress]);

  useEffect(() => {
    if (currentStep === 6 && salesCanvasRef.current) {
      if (salesSignaturePadRef.current) {
        salesSignaturePadRef.current.off();
      }
      salesSignaturePadRef.current = new SignaturePad(salesCanvasRef.current, {
        backgroundColor: 'rgba(255, 255, 255, 1)',
        penColor: 'rgb(15, 23, 42)'
      });
      if (formData.signature) {
        salesSignaturePadRef.current.fromDataURL(formData.signature);
      }
      salesSignaturePadRef.current.onEnd = () => {
        setFormData(prev => ({ ...prev, signature: salesSignaturePadRef.current.toDataURL('image/png') }));
      };
    }
  }, [currentStep]);

  useEffect(() => {
    if (selectedProductId && products) {
      const product = products.find(p => p.upya_id == selectedProductId);
      if (product) {
        const totalCost = parseFloat(product.base_value) || parseFloat(product.precio) || 0;
        let upfront = totalCost;
        console.log("🚀 ~ DEBUG ~ useEffect:", { selectedDeal, deals });
        
        if (selectedDeal && deals) {
          const deal = deals.find(d => String(d.name) === String(selectedDeal));
          console.log("🚀 ~ DEBUG ~ deal encontrado:", deal);
          const dealType = deal?.type?.trim().toUpperCase() || '';
          if (deal) {
            const rawUpfront = deal.upfront_percentage;
            const parsedUpfront = rawUpfront !== null && rawUpfront !== '' ? parseFloat(rawUpfront) : NaN;
            if (!isNaN(parsedUpfront)) {
              upfront = parsedUpfront;
            } else {
              upfront = ['INSTALMENTS', 'ABONO', 'CRÉDITO', 'CREDITO'].includes(dealType) ? 0 : totalCost;
            }

            // Auto-seleccionar Tarjeta de Débito y Recurrencia para planes a plazos
            const isFinancing = ['INSTALMENTS', 'ABONO', 'CRÉDITO', 'CREDITO'].includes(dealType);
            if (isFinancing) {
              const nextDay = new Date();
              nextDay.setDate(nextDay.getDate() + 1);
              setPaymentFormData(prev => ({
                ...prev,
                amount: upfront,
                method: 'Tarjeta Débito',
                is_recurring: true,
                recurring_dates: [String(nextDay.getDate()).padStart(2, '0')]
              }));
              return; // Salimos temprano si configuramos pagos recurrentes
            }
          }
        }
        setPaymentFormData(prev => ({ ...prev, amount: upfront }));
      }
    }
  }, [selectedDeal, selectedProductId, products, deals]);

  const handleFileChange = async (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressedBase64 = await compressImageFile(file, 1280, 1280, 0.75);
      setFormData(prev => ({ ...prev, [field]: compressedBase64 }));
    } catch (err) {
      console.error('Compress error:', err);
    }
  };
  
  const selectedProduct = products?.find(p => p.upya_id == selectedProductId);
  
  const steps = actionType === 'Detalles del plan' 
    ? ['Selección de Plan', 'Resumen Financiero'] 
    : ['Dispositivos', 'Información personal', 'Contactos', 'Documentos', 'Contrato', 'Firma', 'Pago', 'Impresión'];
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 hover:shadow-md transition-all text-slate-500">
            <ChevronDown size={20} className="rotate-90" />
          </button>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Registro de Ventas</h2>
            <p className="text-base font-medium text-slate-500 mt-1">
              {prefillData ? `Cliente: ${prefillData.clientName || 'Sin Nombre'}` : 'Iniciando nueva recolección'}
            </p>
          </div>
        </div>
        {prefillData && (
          <div className="px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl font-bold text-base flex items-center gap-2">
            <Clock size={16} /> En progreso (Borrador)
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-5 md:p-8">
        {/* Sidebar: Progress Stepper */}
        <div className="w-full md:w-64 flex-shrink-0 bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 self-start sticky top-5 md:p-8">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Progreso del Formulario</h3>
          <div className="flex flex-col">
            {steps.map((step, idx) => (
              <div key={step} className="flex gap-4">
                <div className="relative flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-base transition-colors ${currentStep > idx + 1 ? 'bg-emerald-500 text-white' : currentStep === idx + 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                    {currentStep > idx + 1 ? <CheckSquare size={14} /> : idx + 1}
                  </div>
                  {idx < steps.length - 1 && <div className={`w-0.5 h-8 my-1 ${currentStep > idx + 1 ? 'bg-emerald-500' : 'bg-slate-100'}`}></div>}
                </div>
                <div className="mt-1 pb-4">
                  <p className={`text-base leading-none mt-1 font-bold ${currentStep === idx + 1 ? 'text-blue-600' : currentStep > idx + 1 ? 'text-slate-800' : 'text-slate-400'}`}>{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Form Inputs */}
        <div className="flex-1 min-w-0 bg-white rounded-[40px] border border-slate-100 shadow-sm p-6 md:p-10 flex flex-col min-h-[600px]">
          <div className="flex-1 space-y-8">
            <h3 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4">{steps[currentStep - 1]}</h3>
            
            {actionType === 'Detalles del plan' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 md:p-8">
                {currentStep === 1 && (
                  <div className="col-span-2">
                    <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Términos y Condiciones (Deal)</label>
                    <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold text-slate-800" value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)}>
                      {deals && deals.length > 0 ? deals.map(d => <option key={d.id || d.name} value={d.name}>{d.name} ({d.type})</option>) : <option>Sin planes disponibles</option>}
                    </select>
                  </div>
                )}
                
                {currentStep === 2 && deals && selectedDeal && (
                  <div className="col-span-2 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 grid grid-cols-3 gap-6">
                    {(() => {
                      const deal = deals.find(d => String(d.name) === String(selectedDeal));
                      if (!deal) return null;
                      return (
                        <>
                          <div>
                            <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-1">Costo Total</p>
                            <p className="text-2xl font-black text-indigo-900">${deal.total_cost || '0'}</p>
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-1">Duración (Meses)</p>
                            <p className="text-2xl font-black text-indigo-900">{deal.duration_months || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[12px] font-black text-indigo-400 uppercase tracking-widest mb-1">Requiere Depósito</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 md:p-8">
                {currentStep === 1 && ( /* Dispositivos */
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Buscar Dispositivo (Marca / Modelo)</label>
                      <input type="text" className="w-full px-5 py-4 mb-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Filtrar por nombre o marca..." value={productSearch} onChange={e => setProductSearch(e.target.value)} />
                      
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)}>
                        <option value="">-- Selecciona un dispositivo --</option>
                        {products && products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.manufacturer?.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                          <option key={p.upya_id} value={p.upya_id}>{p.manufacturer ? `${p.manufacturer} ` : ''}{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {selectedProduct && (
                      <div className="col-span-2 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                        <div>
                          <p className="text-[12px] font-black text-emerald-500 uppercase tracking-widest mb-1">Costo Total del Dispositivo</p>
                          <p className="text-3xl font-black text-emerald-900">${parseFloat(selectedProduct.base_value || 0).toFixed(2)}</p>
                        </div>
                        <Tag size={40} className="text-emerald-200" />
                      </div>
                    )}
                    
                    {selectedProduct?.is_serialized ? (() => {
                      const availableInventory = inventory ? inventory.filter(i => matchesProduct(i.model, selectedProduct.name) && i.status === 'UNASSIGNED') : [];
                      return (
                        <div className="col-span-2 md:col-span-1">
                          <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                            Número de Serie en Stock
                            {availableInventory.length === 0 && <span className="text-red-500 text-xs">Sin stock disponible</span>}
                          </label>
                          <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})}>
                            <option value="">-- Selecciona un serial ({availableInventory.length} disponibles) --</option>
                            {availableInventory.map(i => <option key={i.serial_number} value={i.serial_number}>{i.serial_number}</option>)}
                          </select>
                        </div>
                      );
                    })() : (
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Número de Serie o Token PayG</label>
                        <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Ej. A1B2C3D4E5" value={formData.serialNumber} onChange={e => setFormData({...formData, serialNumber: e.target.value})} />
                      </div>
                    )}
                    
                    <div className="col-span-2">
                      <div className="px-6 py-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-blue-800">
                        <Smartphone size={24} />
                        <span className="font-bold text-base">Escanea el código de barras en el empaque para autocompletar la serie.</span>
                      </div>
                    </div>
                  </>
                )}
                {currentStep === 2 && ( /* Información personal */
                  <>
                    <div className="col-span-2 space-y-6">
                      <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                            <Users size={24} />
                          </div>
                          <div>
                            <h4 className="font-black text-slate-800 text-lg">Selección de Cliente</h4>
                            <p className="text-sm font-medium text-slate-500">Asocia un cliente existente o registra uno nuevo.</p>
                          </div>
                        </div>
                        <button 
                          onClick={(e) => { e.preventDefault(); onOpenClientModal(); }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                        >
                          <Plus size={18} /> Crear Nuevo Cliente
                        </button>
                      </div>

                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Cliente Existente</label>
                        <select 
                          className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" 
                          value={formData.clientId || ''} 
                          onChange={e => {
                            const clientId = e.target.value;
                            const client = clients?.find(c => c.id == clientId || c.upya_id == clientId);
                            
                            setFormData(prev => ({
                              ...prev, 
                              clientId: clientId, 
                              clientDetails: client,
                              phoneMain: client?.phone || '',
                              referenceName: client?.reference_contact || '',
                              phoneEmergency: client?.reference_phone || ''
                            }));
                            
                            if (client) {
                              setFirstName(client.first_name || client.name?.split(' ')[0] || '');
                              setLastName(client.last_name || client.name?.split(' ').slice(1).join(' ') || '');
                            }
                          }}
                        >
                          <option value="">-- Seleccionar cliente --</option>
                          {clients && clients.map(c => (
                            <option key={c.id || c.upya_id} value={c.id || c.upya_id}>
                              {c.first_name ? `${c.first_name} ${c.last_name || ''}` : c.name} - {c.client_number || c.upya_id || 'Sin ID'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Nombre(s) del Titular</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ej. Juan" />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Apellidos del Titular</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Ej. Lora" />
                    </div>
                  </>
                )}
                {currentStep === 3 && ( /* Contactos */
                  <>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Teléfono Principal (Móvil)</label>
                      <input type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="+52 ..." value={formData.phoneMain} onChange={e => setFormData({...formData, phoneMain: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1"></div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Nombre Referencia/Aval</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Nombre completo" value={formData.referenceName} onChange={e => setFormData({...formData, referenceName: e.target.value})} />
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Teléfono Referencia</label>
                      <input type="tel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="+52 ..." value={formData.phoneEmergency} onChange={e => setFormData({...formData, phoneEmergency: e.target.value})} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Dirección de Residencia</label>
                      <textarea className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800 min-h-[100px]" placeholder="Calle, Número, Colonia, Ciudad, Estado, C.P." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                    </div>
                  </>
                )}
                {currentStep === 4 && ( /* Documentos */
                  <>
                    <input type="file" ref={fileFrontRef} accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange('idFront', e)} />
                    <input type="file" ref={fileProofRef} accept="image/*" capture="environment" className="hidden" onChange={e => handleFileChange('proofAddress', e)} />

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Tipo de Identificación</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={formData.idType} onChange={e => setFormData({...formData, idType: e.target.value})}>
                        <option>INE / IFE</option><option>Pasaporte</option><option>Cédula Profesional</option>
                      </select>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Número de Documento</label>
                      <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" placeholder="Ej. 0000111122223" value={formData.idNumber} onChange={e => setFormData({...formData, idNumber: e.target.value})} />
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span>Captura Identificación (Frente)</span>
                        {formData.idFront && <span className="text-emerald-600 font-black text-xs">✓ Capturado</span>}
                      </label>
                      {formData.idFront ? (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black group">
                          <img src={formData.idFront} alt="Identificación frente" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button type="button" onClick={() => fileFrontRef.current?.click()} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs">Cambiar</button>
                            <button type="button" onClick={() => setFormData({ ...formData, idFront: '' })} className="p-2 bg-rose-600 text-white rounded-xl font-bold text-xs"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileFrontRef.current?.click()} 
                          className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors cursor-pointer"
                        >
                          <div className="text-center">
                            <Camera size={24} className="mx-auto mb-2 text-blue-600" />
                            <span className="text-base font-bold">Tomar Foto / Subir ID</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 md:col-span-1">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                        <span>Captura Comprobante Domicilio</span>
                        {formData.proofAddress && <span className="text-emerald-600 font-black text-xs">✓ Capturado</span>}
                      </label>
                      {formData.proofAddress ? (
                        <div className="relative w-full h-36 rounded-2xl overflow-hidden border-2 border-emerald-500 bg-black group">
                          <img src={formData.proofAddress} alt="Comprobante domicilio" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                            <button type="button" onClick={() => fileProofRef.current?.click()} className="px-3 py-1.5 bg-blue-600 text-white rounded-xl font-bold text-xs">Cambiar</button>
                            <button type="button" onClick={() => setFormData({ ...formData, proofAddress: '' })} className="p-2 bg-rose-600 text-white rounded-xl font-bold text-xs"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileProofRef.current?.click()} 
                          className="w-full h-36 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition-colors cursor-pointer"
                        >
                          <div className="text-center">
                            <FileText size={24} className="mx-auto mb-2 text-emerald-600" />
                            <span className="text-base font-bold">Tomar Foto / Subir Comprobante</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="col-span-2 bg-gradient-to-r from-indigo-50 via-blue-50 to-slate-50 p-6 rounded-3xl border border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-950 text-base">Escanear desde Teléfono Celular (DeepLink)</h4>
                          <p className="text-xs font-bold text-indigo-700/80">Genera un enlace o código QR para tomar las fotos directamente con la cámara de tu celular y sincronizarlas en vivo.</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleStartScanSession}
                        className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all active:scale-95 flex items-center gap-2"
                      >
                        <QrCode size={18} /> Generar QR
                      </button>
                    </div>
                  </>
                )}
                {currentStep === 5 && ( /* Contrato */
                  <>
                    <div className="col-span-2">
                      <label className="block text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Términos de Pago Asociados</label>
                      <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800" value={selectedDeal} onChange={(e) => setSelectedDeal(e.target.value)}>
                        <option value="">-- Selecciona un plan --</option>
                        {deals && deals.length > 0 ? deals.map(d => <option key={d.id || d.name} value={d.name}>{d.name} ({d.type})</option>) : <option>Sin planes</option>}
                      </select>
                    </div>

                    {selectedDeal && selectedProduct && (() => {
                      const deal = deals.find(d => String(d.name) === String(selectedDeal));
                      if (!deal) return null;
                      const totalCost = parseFloat(selectedProduct.base_value) || parseFloat(selectedProduct.precio) || 0;
                      
                      const dealType = deal.type?.trim().toUpperCase() || '';
                      
                      let upfront = totalCost;
                      const rawUpfront = deal.upfront_percentage;
                      const parsedUpfront = rawUpfront !== null && rawUpfront !== '' ? parseFloat(rawUpfront) : NaN;
                      if (!isNaN(parsedUpfront)) {
                        if (globalSettings?.upfront_type === 'Porciento') {
                          upfront = totalCost * (parsedUpfront / 100);
                        } else {
                          upfront = parsedUpfront;
                        }
                      } else {
                        upfront = ['INSTALMENTS', 'ABONO', 'CRÉDITO', 'CREDITO'].includes(dealType) ? 0 : totalCost;
                      }

                      if (['INSTALMENTS', 'ABONO', 'CRÉDITO', 'CREDITO'].includes(dealType)) {
                        const baseBalance = totalCost - upfront;
                        const interestPercentage = parseFloat(deal.interest_percentage) || 0;
                        
                        let interestAmount = 0;
                        if (globalSettings?.interest_type === 'Monto') {
                          interestAmount = interestPercentage;
                        } else {
                          interestAmount = baseBalance * (interestPercentage / 100);
                        }
                        
                        const balance = baseBalance + interestAmount;
                        
                        const installments = parseInt(deal.installments_count) || 1;
                        const perPayment = balance / installments;
                        
                        return (
                          <div className="col-span-2 bg-blue-50 p-6 rounded-2xl border border-blue-100 space-y-4">
                            <h4 className="font-black text-blue-900 text-lg flex items-center gap-2"><CreditCard size={20} /> Resumen Financiero</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-1">Enganche</p>
                                <p className="text-2xl font-black text-blue-700">${upfront.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-1">Saldo a Financiar</p>
                                <p className="text-2xl font-black text-blue-700">${balance.toFixed(2)}</p>
                                {interestPercentage > 0 && (
                                  <p className="text-xs font-bold text-blue-500 mt-1">
                                    (Incl. {globalSettings?.interest_type === 'Monto' ? `$${interestPercentage}` : `${interestPercentage}%`} de interés)
                                  </p>
                                )}
                              </div>
                              <div>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-400 mb-1">Pago cada {deal.frequency_days || 7} días</p>
                                <p className="text-2xl font-black text-blue-700">${perPayment.toFixed(2)}</p>
                                <p className="text-xs font-bold text-blue-500 mt-1">({installments} pagos)</p>
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="col-span-2 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-black uppercase tracking-widest text-emerald-500 mb-1">Venta de Contado</p>
                              <p className="text-3xl font-black text-emerald-800">${totalCost.toFixed(2)}</p>
                            </div>
                            <CheckSquare size={40} className="text-emerald-200" />
                          </div>
                        );
                      }
                    })()}

                    <div className="col-span-2 p-6 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-4">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-slate-300" defaultChecked />
                      <div>
                        <p className="font-bold text-slate-800">Aceptación de Contrato</p>
                        <p className="text-base text-slate-500">Confirmo que he explicado al cliente los términos de pago, penalizaciones por mora y condiciones de uso del servicio. El cliente acepta continuar.</p>
                      </div>
                    </div>
                  </>
                )}
                {currentStep === 6 && ( /* Firma */
                  <div className="col-span-2 space-y-6 text-center">
                    <p className="text-base font-bold text-slate-600 uppercase tracking-widest">Firma Digital del Cliente</p>
                    <div className="w-full relative bg-white border-2 border-slate-300 rounded-3xl overflow-hidden shadow-sm">
                      <canvas 
                        ref={salesCanvasRef} 
                        width={600} 
                        height={250} 
                        className="w-full h-[250px] cursor-crosshair touch-none"
                      />
                      {!formData.signature && (
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300">
                          <Edit size={32} className="mb-2 opacity-50" />
                          <span className="font-bold">El cliente debe firmar aquí</span>
                        </div>
                      )}
                      <button 
                        type="button"
                        onClick={() => {
                          salesSignaturePadRef.current?.clear();
                          setFormData(prev => ({ ...prev, signature: '' }));
                        }}
                        className="absolute bottom-4 right-4 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-500 px-4 py-2 rounded-xl"
                      >
                        Limpiar Firma
                      </button>
                    </div>
                    <div>
                      <input type="text" className="w-64 mx-auto px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/20 font-bold text-slate-800 text-center" placeholder="Aclaración de firma" value={formData.signatureName || `${firstName} ${lastName}`.trim()} onChange={e => setFormData({...formData, signatureName: e.target.value})} />
                    </div>

                    {/* DeepLink for Signature Scanner */}
                    <div className="mt-8 bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100/50 flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
                          <Smartphone size={24} />
                        </div>
                        <div>
                          <h4 className="font-black text-indigo-950 text-base">Escanear desde Teléfono Celular (DeepLink)</h4>
                          <p className="text-xs font-bold text-indigo-700/80">Genera un enlace o código QR para recabar la firma del cliente desde su propio celular.</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={handleStartScanSession}
                        className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2"
                      >
                        <QrCode size={18} /> Generar QR
                      </button>
                    </div>

                    <div className="mt-6 flex justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          const totalCost = parseFloat(selectedProduct?.base_value) || parseFloat(selectedProduct?.precio) || 0;
                          const html = generateContractHTML({
                            fullName: `${firstName} ${lastName}`.trim(),
                            address: formData.address,
                            phoneNumber: formData.phoneMain,
                            personId: formData.idNumber,
                            brand: selectedProduct?.manufacturer || selectedProduct?.marca || selectedProduct?.brand || '',
                            model: selectedProduct?.name,
                            imei: formData.serialNumber || selectedProduct?.imei || '',
                            serialNumber: selectedProduct?.serialNumber,
                            upfrontpayment: paymentFormData.amount,
                            totalcost: totalCost,
                            terms: paymentFormData.method,
                            repayment: '...', 
                            signature: formData.signature || (salesSignaturePadRef.current && !salesSignaturePadRef.current.isEmpty() ? salesSignaturePadRef.current.toDataURL('image/png') : null),
                            date: new Date().toISOString()
                          });
                          const win = window.open('', '_blank');
                          if(win) {
                            win.document.write(html);
                            win.document.close();
                            setTimeout(() => win.print(), 1000);
                          }
                        }}
                        type="button"
                        className="bg-slate-100 hover:bg-slate-200 border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <Printer size={18} /> Imprimir Vista Previa del Contrato
                      </button>
                    </div>
                  </div>
                )}
                {currentStep === 7 && ( /* Pago */
                  <div className="col-span-2 -mt-4">
                    <PaymentFormContent
                      formData={paymentFormData} setFormData={setPaymentFormData} isReadOnly={false} contracts={[]}
                      clients={clients} selectedDeal={selectedDeal} deals={deals} onOpenClientModal={onOpenClientModal}
                      iframeError={iframeError} setIframeError={setIframeError} dynamicoreSuccess={dynamicoreSuccess}
                      setDynamicoreSuccess={setDynamicoreSuccess} iframeLoading={iframeLoading} setIframeLoading={setIframeLoading}
                      showSchedule={showSchedule} setShowSchedule={setShowSchedule} iframeId="dynamicore-inline-iframe"
                      isWizardMode={true}
                    />
                    
                    {/* Botones de Vista Previa */}
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap gap-4 justify-center">
                      <button 
                        type="button"
                        onClick={() => {
                          const totalCost = parseFloat(selectedProduct?.base_value) || parseFloat(selectedProduct?.precio) || 0;
                          const html = generateContractHTML({
                            fullName: `${firstName} ${lastName}`.trim(),
                            address: formData.address,
                            phoneNumber: formData.phoneMain,
                            personId: formData.idNumber,
                            brand: selectedProduct?.manufacturer || selectedProduct?.marca || selectedProduct?.brand || '',
                            model: selectedProduct?.name,
                            imei: formData.serialNumber || selectedProduct?.imei || '',
                            serialNumber: selectedProduct?.serialNumber,
                            upfrontpayment: paymentFormData.amount,
                            totalcost: totalCost,
                            terms: paymentFormData.method,
                            repayment: '...', 
                            signature: formData.signature || (salesSignaturePadRef.current && !salesSignaturePadRef.current.isEmpty() ? salesSignaturePadRef.current.toDataURL('image/png') : null),
                            date: new Date().toISOString()
                          });
                          const win = window.open('', '_blank');
                          if(win) {
                            win.document.write(html);
                            win.document.close();
                            setTimeout(() => win.print(), 1000);
                          }
                        }}
                        className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <Printer size={16} /> Vista Previa Contrato
                      </button>

                      <button 
                        type="button"
                        onClick={() => {
                          const html = generateVoucherHTML({
                            clientName: `${firstName} ${lastName}`.trim(),
                            clientNumber: formData.idNumber || 'S/N',
                            amount: paymentFormData.amount || 0,
                            method: paymentFormData.method || 'Efectivo',
                            status: 'PAID', // Simulado para vista previa
                            paymentDate: new Date().toISOString(),
                            contractNumber: '--- (Vista Previa)',
                            transactionId: '--- (Vista Previa)',
                            tenantName: 'Bantos'
                          });
                          const win = window.open('', '_blank');
                          if(win) {
                            win.document.write(html);
                            win.document.close();
                            setTimeout(() => win.print(), 1000);
                          }
                        }}
                        className="bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest transition-all flex items-center gap-2"
                      >
                        <FileText size={16} /> Vista Previa Voucher
                      </button>
                    </div>
                  </div>
                )}
                {currentStep === 8 && (
                  <div className="col-span-2 flex flex-col items-center justify-center text-center py-10">
                     <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-600/20">
                        <CheckSquare size={48} />
                     </div>
                     <h2 className="text-4xl font-black text-slate-800 tracking-tight">¡Venta y Pago Registrados!</h2>
                     <p className="text-lg text-slate-500 font-medium max-w-lg mx-auto">El registro se ha completado exitosamente en Bantos Data Center y los documentos están listos.</p>
                     
                     <div className="flex gap-4 mt-8 justify-center">
                        <button type="button" onClick={() => savedData?.contractId ? window.open(`/datacenter-api/backoffice/contracts/${savedData.contractId}/pdf?tenantId=${session?.tenantId}`, '_blank') : alert('No se registró ningún contrato.')} className={`px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 ${!savedData?.contractId ? 'opacity-60' : ''}`}>
                          <Printer size={20} /> Imprimir Contrato
                        </button>
                        <button type="button" onClick={() => savedData?.paymentId ? window.open(`/datacenter-api/backoffice/payments/${savedData.paymentId}/pdf?tenantId=${session?.tenantId}`, '_blank') : alert('No se registró ningún pago en este contrato.')} className={`px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-blue-200 hover:text-blue-600 font-bold rounded-2xl transition-all flex items-center gap-2 ${!savedData?.paymentId ? 'opacity-60' : ''}`}>
                          <FileText size={20} /> Imprimir Voucher
                        </button>
                     </div>
                     <button type="button" onClick={onBack} className="mt-8 text-slate-400 hover:text-slate-600 font-bold tracking-widest text-sm transition-colors uppercase">Cerrar Asistente</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showScanModal && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg rounded-[36px] shadow-2xl p-8 border border-slate-100 relative text-center space-y-6">
                <button type="button" onClick={() => setShowScanModal(false)} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>

                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-600/30">
                  <Smartphone size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900">Escanear Documentos desde Móvil</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Escanea el QR o copia el enlace DeepLink</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(scanDeepLink)}`} 
                    alt="QR DeepLink" 
                    className="w-48 h-48 rounded-2xl border-4 border-white shadow-md mx-auto" 
                  />
                  <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Sincronización en vivo activa...</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 bg-slate-100 p-2.5 rounded-2xl border border-slate-200">
                    <input 
                      type="text" 
                      readOnly 
                      value={scanDeepLink} 
                      className="w-full bg-transparent text-xs font-mono font-bold text-slate-700 px-2 outline-none truncate" 
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(scanDeepLink);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shrink-0 transition-all flex items-center gap-1.5"
                    >
                      {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 font-bold">
                    Abre la cámara de tu celular, apunta al código QR o pega el enlace en el navegador de tu teléfono.
                  </p>
                </div>

                <button 
                  type="button" 
                  onClick={() => setShowScanModal(false)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Entendido / Listo
                </button>
              </div>
            </div>
          )}

          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-center">
            <button onClick={() => onSaveDraft({ 
              id: prefillData?.id || Date.now().toString(), 
              clientName: `${firstName} ${lastName}`.trim(), 
              device: selectedProduct?.name || '', 
              status: `Paso ${currentStep}: ${steps[currentStep-1]}`,
              selectedProductId,
              dealId: selectedDeal,
              ...formData
            })} className="px-6 py-3 text-slate-400 hover:text-slate-600 font-bold transition-colors">Guardar Borrador y Salir</button>
            <div className="flex gap-4">
              {currentStep > 1 && (
                <button onClick={() => setCurrentStep(currentStep - 1)} disabled={isSubmitting} className="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-colors disabled:opacity-50">Atrás</button>
              )}
              {currentStep < steps.length - 1 ? (
                <button onClick={() => setCurrentStep(currentStep + 1)} disabled={isSubmitting} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 text-white font-bold rounded-2xl transition-all disabled:opacity-50">Siguiente</button>
              ) : currentStep === steps.length - 1 ? (
                <>
                  {(paymentFormData.method === 'Tarjeta Crédito' || paymentFormData.method === 'Tarjeta Débito') && !dynamicoreSuccess ? (
                    <button 
                      disabled={iframeLoading || isSubmitting}
                      onClick={() => {
                        setIframeError(null);
                        setIframeLoading(true);
                        const iframe = document.getElementById('dynamicore-inline-iframe');
                        if (window.DynamicoreHelper && typeof window.DynamicoreHelper.submit === 'function') {
                          window.DynamicoreHelper.submit();
                        } else if (iframe && iframe.contentWindow) {
                          iframe.contentWindow.postMessage({ type: 'SUBMIT_FORM', action: 'tokenize' }, '*');
                        } else {
                          setTimeout(() => { setIframeError('No se pudo conectar con el formulario de pagos.'); setIframeLoading(false); }, 1000);
                        }
                      }} 
                      className="px-10 bg-emerald-600 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-xl shadow-emerald-600/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                    >
                      {iframeLoading ? <RefreshCw className="animate-spin" size={16} /> : <Lock size={16} />}
                      Procesar Tarjeta
                    </button>
                  ) : (
                    <button 
                      disabled={isSubmitting}
                      onClick={async () => {
                        setIsSubmitting(true);
                        try {
                          // 1. Guardar Contrato (Venta)
                          const totalCost = parseFloat(selectedProduct?.base_value) || parseFloat(selectedProduct?.precio) || 0;
                          
                          const contractPayload = {
                            idFront: formData.idFront,
                            proofAddress: formData.proofAddress,
                            client_name: `${firstName} ${lastName}`.trim(),
                            email: '', // Podríamos agregar email si es necesario
                            client_number: formData.idNumber || Date.now().toString(),
                            phone: formData.phoneMain,
                            phone_2: formData.phoneEmergency,
                            product_id: selectedProductId,
                            product_name: selectedProduct?.name || '',
                            deal_id: selectedDeal,
                            deal_name: deals?.find(d => String(d.name) === String(selectedDeal))?.name || selectedDeal || '',
                            total_value: totalCost,
                            paid_value: paymentFormData.amount || 0,
                            date_created: new Date().toISOString(),
                            address: formData.address,
                            signatureData: formData.signature,
                            signatureName: formData.signatureName,
                            gender: formData.gender,
                            birthDate: formData.birthDate,
                            referenceName: formData.referenceName,
                            idType: formData.idType,
                          };

                          const res = await onSaveContract(contractPayload, 'generate');
                          const newContractId = res?.contract?.upya_id || res?.contract?.contract_number;

                          if (newContractId) {
                            // 2. Guardar Pago
                            const savedPayment = await onSavePayment({
                              ...paymentFormData,
                              contract_id: newContractId,
                              selectedDeal
                            });
                            setSavedData({ contractId: newContractId, paymentId: savedPayment?.id });
                            setCurrentStep(8);
                          } else {
                            setSavedData({ contractId: newContractId });
                            setCurrentStep(8);
                          }
                        } catch (e) {
                          alert('Error al guardar la venta y el pago');
                        } finally {
                          setIsSubmitting(false);
                        }
                      }} 
                      className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white font-bold rounded-2xl transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting ? <RefreshCw size={20} className="animate-spin" /> : <CheckSquare size={20} />} Finalizar Venta y Pago
                    </button>
                  )}
                </>
              ) : (
                <button onClick={onBack} className="px-8 py-4 bg-slate-800 hover:bg-slate-900 shadow-lg shadow-slate-800/30 text-white font-bold rounded-2xl transition-all">Cerrar Asistente</button>
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
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600"><Zap size={20} /></div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">{action ? 'Editar Acción' : 'Nueva Acción'}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
        </div>
        <div className="p-5 md:p-8 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Descripción / Asunto</label>
            <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium text-slate-800" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Ej. Revisar instalación..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Tipo</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                <option>Soporte</option><option>Mantenimiento</option><option>Cobranza</option><option>Instalación</option><option>Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Estado</label>
              <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                <option>Pendiente</option><option>En Proceso</option><option>Completado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Asignado a</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-medium text-slate-800" value={formData.assigned_to} onChange={(e) => setFormData({...formData, assigned_to: e.target.value})} placeholder="Nombre del agente" />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Fecha Límite</label>
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
      <p className="text-slate-300 font-black uppercase tracking-widest text-base">Módulo en preparación</p>
    </div>
  </div>
);

const StoresView = ({ stores, session, refreshData }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);

  const handleSave = async (e) => {
    e.preventDefault();
    if (session?.role === 'manager') return;
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    payload.tenantId = session.tenantId;
    try {
      if (editingStore) {
        await axios.put(`${API}/backoffice/stores/${editingStore.id}`, payload);
      } else {
        await axios.post(`${API}/backoffice/stores`, payload);
      }
      setModalOpen(false);
      refreshData();
    } catch (err) { alert('Error guardando la tienda: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta tienda?')) return;
    try {
      await axios.delete(`${API}/backoffice/stores/${id}`, { params: { tenantId: session.tenantId } });
      refreshData();
    } catch (err) { alert('Error al eliminar la tienda: ' + err.message); }
  };

  return (
    <div className="space-y-10 pb-20">
      <PageHeader 
        title="Gestión de Tiendas" 
        subtitle="Administración de establecimientos operativos"
        action={
          session?.role !== 'manager' && (
            <button onClick={() => { setEditingStore(null); setModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 hover:scale-105 transition-all flex items-center gap-2">
              <Plus size={16} /> Nueva Tienda
            </button>
          )
        }
      />
      <div className="bg-white rounded-[32px] shadow-xl border border-slate-100 overflow-hidden">
        <Table cols={['ID', 'Nombre', 'Dirección', 'Estado', 'Acciones']} rows={stores} render={store => (
          <>
            <td className="px-6 py-4 font-bold text-slate-800">{store.id}</td>
            <td className="px-6 py-4 font-bold text-slate-800">{store.name}</td>
            <td className="px-6 py-4 text-slate-500 text-sm">{store.address}</td>
            <td className="px-6 py-4"><Badge status={store.status} /></td>
            <td className="px-6 py-4 flex items-center gap-2">
              <button onClick={() => { setEditingStore(store); setModalOpen(true); }} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={16}/></button>
              {session?.role === 'admin' && (
                <button onClick={() => handleDelete(store.id)} className="text-rose-600 hover:text-rose-800 p-2"><Trash2 size={16}/></button>
              )}
            </td>
          </>
        )} renderMobile={store => (
          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <p className="font-bold text-slate-800">{store.name}</p>
            <p className="text-sm text-slate-500">{store.address}</p>
            <div className="flex gap-2">
              <button onClick={() => { setEditingStore(store); setModalOpen(true); }} className="text-blue-600 font-bold text-xs">EDITAR</button>
              {session?.role === 'admin' && (
                <button onClick={() => handleDelete(store.id)} className="text-rose-600 font-bold text-xs">ELIMINAR</button>
              )}
            </div>
          </div>
        )}/>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-6">{editingStore ? 'Editar Tienda' : 'Nueva Tienda'}</h3>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400">Nombre</label>
                  <input name="name" defaultValue={editingStore?.name || ''} required disabled={session?.role === 'manager'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400">Dirección</label>
                  <input name="address" defaultValue={editingStore?.address || ''} disabled={session?.role === 'manager'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 disabled:opacity-50" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400">Estado</label>
                  <select name="status" defaultValue={editingStore?.status || 'Active'} disabled={session?.role === 'manager'} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3 px-5 mt-1 font-bold outline-none focus:border-blue-600 disabled:opacity-50">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl">Cancelar</button>
                  {session?.role !== 'manager' && (
                    <button type="submit" className="flex-1 bg-blue-600 text-white font-bold py-4 rounded-2xl">Guardar</button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TransferenciasView = ({ stores, inventory, session, refreshData, users }) => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDest, setFilterDest] = useState('');
  const [filterUser, setFilterUser] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [originStoreId, setOriginStoreId] = useState('');
  const [modelFilter, setModelFilter] = useState('');
  const [destStoreId, setDestStoreId] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  const originInventory = inventory?.filter(i => i.store_id == originStoreId && originStoreId !== '') || [];

  const loadTransfers = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}/backoffice/inventory/transfers?tenantId=${session.tenantId}`;
      if (filterOrigin) url += `&originStoreId=${filterOrigin}`;
      if (filterDest) url += `&destStoreId=${filterDest}`;
      if (filterUser) url += `&userId=${filterUser}`;
      if (session?.role !== 'admin' && session?.storeId) {
        url += `&storeId=${session.storeId}`;
      }
      const res = await axios.get(url);
      setTransfers(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filterOrigin, filterDest, filterUser, session]);

  useEffect(() => {
    loadTransfers();
  }, [loadTransfers]);

  const handleTransfer = async () => {
    if (!destStoreId) return alert('Seleccione tienda destino');
    if (selectedItems.length === 0) return alert('Seleccione al menos un dispositivo');
    try {
      await axios.post(`${API}/backoffice/inventory/transfer`, {
        tenantId: session.tenantId,
        originStoreId,
        destStoreId,
        inventoryIds: selectedItems,
        userId: session.id || session.userId
      });
      alert('Transferencia exitosa');
      setSelectedItems([]);
      setOriginStoreId('');
      setDestStoreId('');
      setShowModal(false);
      refreshData();
      loadTransfers();
    } catch(e) { alert('Error: ' + e.message); }
  };

  const handleRevert = async (id) => {
    if (!window.confirm('¿Está seguro de revertir esta transferencia? Los dispositivos volverán a la tienda de origen.')) return;
    try {
      await axios.post(`${API}/backoffice/inventory/transfers/${id}/revert`, {
        tenantId: session.tenantId,
        userId: session.id || session.userId
      });
      alert('Transferencia revertida exitosamente');
      refreshData();
      loadTransfers();
    } catch (e) {
      alert('Error al revertir: ' + (e.response?.data?.error || e.message));
    }
  };

  const toggleItem = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-10 pb-20 relative">
      <div className="flex justify-between items-center">
        <PageHeader title="Transferencias" subtitle="Historial y movimientos de inventario" />
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Plus size={16} /> Nueva Transferencia
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Filtrar por Origen</label>
          <select value={filterOrigin} onChange={e => setFilterOrigin(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
            <option value="">Todas las tiendas</option>
            {stores?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Filtrar por Destino</label>
          <select value={filterDest} onChange={e => setFilterDest(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
            <option value="">Todas las tiendas</option>
            {stores?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        {session?.role === 'admin' && (
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Filtrar por Usuario</label>
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-4 font-bold text-slate-700 outline-none focus:border-blue-500 transition-all">
              <option value="">Todos los usuarios</option>
              {users?.filter(u => ['admin', 'manager'].includes(u.role)).map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-500 font-bold">Cargando transferencias...</div>
        ) : transfers.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <ArrowRightLeft size={24} />
            </div>
            <p className="text-lg font-bold text-slate-800">No hay transferencias registradas</p>
            <p className="text-sm text-slate-500">Ajusta los filtros o crea una nueva transferencia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">ID / Fecha</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Origen</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Destino</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Cant. Equipos</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                  <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {transfers.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">TR-{t.id.toString().padStart(4,'0')}</p>
                      <p className="text-xs font-medium text-slate-500">{new Date(t.transferred_at).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{t.origin_store_name || `Tienda ${t.origin_store_id}`}</td>
                    <td className="px-6 py-4 font-bold text-slate-700">{t.dest_store_name || `Tienda ${t.dest_store_id}`}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{t.total_items} equipos</td>
                    <td className="px-6 py-4 font-medium text-slate-600">{t.user_name || `User ${t.user_id}`}</td>
                    <td className="px-6 py-4">
                      {t.is_reverted ? (
                        <span className="px-3 py-1 bg-rose-50 text-rose-600 font-bold text-[10px] uppercase tracking-widest rounded-md">Revertida</span>
                      ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest rounded-md">Completada</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!t.is_reverted && (
                        <button onClick={() => handleRevert(t.id)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-1 inline-flex">
                          <RotateCcw size={14} /> Revertir
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Modal Nueva Transferencia */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-200">
            <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nueva Transferencia</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">Mueve dispositivos entre tiendas de forma segura.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">Tienda Origen</label>
                  <select value={originStoreId} onChange={e => { setOriginStoreId(e.target.value); setSelectedItems([]); setModelFilter(''); }} className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-blue-500 transition-all">
                    <option value="">-- Seleccionar origen --</option>
                    {stores?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="bg-slate-50 p-6 rounded-[24px] border border-slate-200">
                  <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">Tienda Destino</label>
                  <select value={destStoreId} onChange={e => setDestStoreId(e.target.value)} className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 px-4 font-bold outline-none focus:border-emerald-500 transition-all">
                    <option value="">-- Seleccionar destino --</option>
                    {stores?.filter(s => s.id != originStoreId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              
              {originStoreId && (
                <div className="bg-white border border-slate-200 rounded-[24px] overflow-hidden">
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center gap-4">
                    <h4 className="font-black text-slate-800 flex-shrink-0">Inventario Disponible ({originInventory.length})</h4>
                    <select 
                      className="bg-white border border-slate-200 rounded-xl py-2 px-3 text-sm font-bold text-slate-600 outline-none focus:border-blue-500 w-64"
                      onChange={e => setModelFilter(e.target.value)}
                    >
                      <option value="">Todos los modelos</option>
                      {Array.from(new Set(originInventory.map(i => i.model))).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-200 flex-shrink-0">{selectedItems.length} seleccionados</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white sticky top-0 border-b border-slate-100 shadow-sm z-10">
                        <tr>
                          <th className="px-4 py-3"><input type="checkbox" onChange={e => {
                            const filteredIds = (modelFilter ? originInventory.filter(i => i.model === modelFilter) : originInventory).map(i=>i.id);
                            if (e.target.checked) {
                              const newSelected = [...new Set([...selectedItems, ...filteredIds])];
                              setSelectedItems(newSelected);
                            } else {
                              setSelectedItems(selectedItems.filter(id => !filteredIds.includes(id)));
                            }
                          }} checked={
                            (()=>{
                              const filteredIds = (modelFilter ? originInventory.filter(i => i.model === modelFilter) : originInventory).map(i=>i.id);
                              return filteredIds.length > 0 && filteredIds.every(id => selectedItems.includes(id));
                            })()
                          } className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" /></th>
                          <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Modelo</th>
                          <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">IMEI</th>
                          <th className="px-4 py-3 text-xs font-black text-slate-400 uppercase tracking-widest">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(modelFilter ? originInventory.filter(i => i.model === modelFilter) : originInventory).map(item => (
                          <tr key={item.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => toggleItem(item.id)}>
                            <td className="px-4 py-3"><input type="checkbox" checked={selectedItems.includes(item.id)} readOnly className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 pointer-events-none" /></td>
                            <td className="px-4 py-3 text-sm font-bold text-slate-800">{item.model}</td>
                            <td className="px-4 py-3 text-sm font-mono text-slate-600">{item.serial_number}</td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-500">{item.status}</td>
                          </tr>
                        ))}
                        {(modelFilter ? originInventory.filter(i => i.model === modelFilter) : originInventory).length === 0 && (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center text-slate-400 font-medium">No hay inventario disponible.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 transition-all text-xs uppercase tracking-widest">
                Cancelar
              </button>
              <button 
                onClick={handleTransfer} 
                disabled={selectedItems.length === 0 || !destStoreId}
                className="px-8 py-3 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/30 text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <ArrowRightLeft size={16} /> Transferir ({selectedItems.length}) Equipos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- APP PRINCIPAL ---
const App = () => {
  const getScanSessionParam = () => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('scanSession')) return searchParams.get('scanSession');
      
      const hashParams = new URLSearchParams(window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '');
      if (hashParams.get('scanSession')) return hashParams.get('scanSession');

      const match = window.location.href.match(/[?&]scanSession=([^&]+)/);
      if (match) return match[1];
    } catch {
      return null;
    }
    return null;
  };
  const scanSessionParam = getScanSessionParam();
  if (scanSessionParam) {
    return <MobileDocScannerView sessionId={scanSessionParam} />;
  }

  const [session, setSession] = useState(() => { try { return JSON.parse(localStorage.getItem('bantos_session')); } catch { return null; } });
  const [activeScope, setActiveScope] = useState(session?.scope || null);
  const [view, setView] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem('bantos_session'));
      return savedSession?.last_view || 'manage-dashboard';
    } catch {
      return 'manage-dashboard';
    }
  });
  const [expandedMenus, setExpandedMenus] = useState(['setup', 'records', 'trustonic-menu']);
  const [summary, setSummary] = useState({ totalClients: 0, totalContracts: 0, totalInventory: 0, totalProducts: 0, totalDataCollections: 0, totalPaid: 0 });
  const [data, setData] = useState({ clients: [], contracts: [], inventory: [], payments: [], products: [], paymentPlans: [], orgStructure: [], actions: [], audit: [], dataCollections: [], trustonic: { devices: [], summary: [] }, trustonicLogs: [], users: [] });
  const [syncing, setSyncing] = useState(false);
  const [syncingTrustonic, setSyncingTrustonic] = useState(false);
  const [syncingTrustonicLogs, setSyncingTrustonicLogs] = useState(false);
  const [modalState, setModalState] = useState({ type: null, open: false, item: null });
  const [actionFormState, setActionFormState] = useState({ open: false, actionType: null, prefillData: null });
  const [incompleteActions, setIncompleteActions] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [whitelabel, setWhitelabel] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);

  const fetchGlobalSettings = useCallback(async (tenantId) => {
    try {
      const res = await axios.get(`${API}/backoffice/settings?tenantId=${tenantId}`);
      if (res.data) {
        setWhitelabel({
          whitelabel_name: res.data.whitelabel_name || '',
          whitelabel_logo: res.data.whitelabel_logo || ''
        });
        setGlobalSettings(res.data);
      } else {
        setWhitelabel(null);
        setGlobalSettings(null);
      }
    } catch (e) {
      console.error('Error fetching global settings:', e);
      setWhitelabel(null);
      setGlobalSettings(null);
    }
  }, []);

  useEffect(() => {
    const handleWhitelabelUpdate = () => {
      const currentSession = JSON.parse(localStorage.getItem('bantos_session'));
      if (currentSession?.tenantId) {
        fetchGlobalSettings(currentSession.tenantId);
      }
    };
    window.addEventListener('whitelabel-updated', handleWhitelabelUpdate);
    return () => window.removeEventListener('whitelabel-updated', handleWhitelabelUpdate);
  }, [fetchGlobalSettings]);

  useEffect(() => {
    if (session?.tenantId) {
      fetchGlobalSettings(session.tenantId);
    } else {
      setWhitelabel(null);
    }
  }, [session?.tenantId, fetchGlobalSettings]);

  // Estado para flujo de selección de tenant SuperAdmin
  const [loginStep, setLoginStep] = useState('credentials'); // 'credentials' | 'tenant-select'
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [availableTenants, setAvailableTenants] = useState([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const refreshData = useCallback(async () => {
    const tenantId = session?.tenantId;
    if (!tenantId) return;
    try {
      const config = { 
        params: { 
          tenantId,
          userId: session?.id,
          username: session?.username,
          role: session?.role,
          storeId: session?.storeId,
          orgId: activeScope?.orgId,
          scopeRole: activeScope?.role
        } 
      };
      const [sumRes, cliRes, conRes, invRes, payRes, proRes, ppRes, orgRes, actRes, dcRes, audRes, truRes, truLogRes, usrRes, strRes] = await Promise.allSettled([
        axios.get(`${API}/backoffice/summary`, config),
        axios.get(`${API}/backoffice/clients`, config),
        axios.get(`${API}/backoffice/contracts`, config),
        axios.get(`${API}/backoffice/inventory`, config),
        axios.get(`${API}/backoffice/payments`, config),
        axios.get(`${API}/backoffice/products`, config),
        axios.get(`${API}/backoffice/payment-plans`, config),
        axios.get(`${API}/backoffice/org-structure`, config),
        axios.get(`${API}/backoffice/actions`, config),
        axios.get(`${API}/backoffice/data-collections`, config),
        axios.get(`${API}/backoffice/audit`, config),
        axios.get(`${API}/backoffice/trustonic-devices`, config),
        axios.get(`${API}/backoffice/trustonic-logs`, config),
        axios.get(`${API}/backoffice/users`, config),
        axios.get(`${API}/backoffice/stores`, config)
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
        trustonic: truRes.status === 'fulfilled' ? truRes.value.data : { devices: [], summary: [] },
        trustonicLogs: truLogRes && truLogRes.status === 'fulfilled' ? truLogRes.value.data : [],
        users: usrRes.status === 'fulfilled' ? usrRes.value.data : [],
        stores: strRes.status === 'fulfilled' ? strRes.value.data : [],
      });
    } catch (e) { console.error(e); }
  }, [session, activeScope]);
  useEffect(() => {
    const reqInterceptor = axios.interceptors.request.use(config => {
      if (session && config.method !== 'get') {
        if (config.data && typeof config.data === 'object' && !(config.data instanceof FormData)) {
          config.data.storeId = session.storeId;
          config.data.role = session.role;
          config.data.username = session.username;
        } else if (config.data instanceof FormData) {
          if (!config.data.has('storeId')) config.data.append('storeId', session.storeId || '');
          if (!config.data.has('role')) config.data.append('role', session.role || '');
          if (!config.data.has('username')) config.data.append('username', session.username || '');
        }
      }
      return config;
    });
    return () => axios.interceptors.request.eject(reqInterceptor);
  }, [session]);

  // Reset state on tenant switch to ensure clean multi-tenant isolation
  useEffect(() => {
    if (session?.tenantId) {
      setData({ 
        clients: [], 
        contracts: [], 
        inventory: [], 
        payments: [], 
        products: [], 
        paymentPlans: [], 
        orgStructure: [], 
        actions: [], 
        audit: [], 
        dataCollections: [], 
        trustonic: { devices: [], summary: [] }, 
        trustonicLogs: [], 
        users: [] 
      });
      refreshData();
    }
  }, [session?.tenantId]);

  useEffect(() => { refreshData(); }, [view, refreshData]);

  const handleAddInventory = async (productName, imeiValue, variantValue) => {
    const sn = imeiValue || window.prompt(`Ingrese el IMEI para ${productName}:`);
    if (!sn) return;
    try {
      await axios.post(`${API}/backoffice/inventory`, { tenantId: session.tenantId, serialNumber: sn, model: productName, variant: variantValue, status: 'UNASSIGNED' });
      await refreshData();
    } catch (e) {
      throw new Error(e.response?.data?.error || e.message);
    }
  };

  const handleEditInventory = async (inventoryItem, newImeiValue, newVariantValue) => {
    if (!inventoryItem || !newImeiValue) return;
    try {
      await axios.put(`${API}/backoffice/inventory/${inventoryItem.id || inventoryItem.upya_id}`, {
        tenantId: session.tenantId,
        serialNumber: newImeiValue,
        model: inventoryItem.model,
        variant: newVariantValue,
        status: inventoryItem.status
      });
      await refreshData();
    } catch (e) {
      throw new Error(e.response?.data?.error || e.message);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await axios.post(`${API}/sync/bootstrap`, { 
        tenantId: session.tenantId
      });
      await refreshData();
      alert(`✅ ${res.data.message || 'Sincronización masiva iniciada en segundo plano.'}\n\nPuedes continuar usando el panel mientras los datos se actualizan internamente.`);
    } catch (e) { 
      console.error('Sync error:', e);
      alert('Error de sincronización: ' + (e.response?.data?.error || e.message)); 
    }
    finally { setSyncing(false); }
  };

  const handleSyncTrustonic = async () => {
    setSyncingTrustonic(true);
    try {
      const res = await axios.post(`${API}/sync/trustonic`, { 
        tenantId: session.tenantId
      });
      await refreshData();
      const count = res.data.devicesCount || res.data.count || 0;
      const src = res.data.source || 'API';
      alert(`✅ Sincronización de Trustonic completada (${src})\n• Equipos procesados: ${count}`);
    } catch (e) { 
      alert('Error en sincronización Trustonic: ' + (e.response?.data?.error || e.message)); 
    } finally { setSyncingTrustonic(false); }
  };

  const handleSyncTrustonicLogs = async () => {
    setSyncingTrustonicLogs(true);
    try {
      const res = await axios.post(`${API}/sync/trustonic-logs`, { tenantId: session.tenantId });
      if (res.data.success) {
        await refreshData();
        alert(`✅ Auditoría actualizada (${res.data.source})\n• Equipos procesados: ${res.data.count}`);
      } else {
        alert(`⚠️ Sincronización parcial\n${res.data.message}`);
      }
    } catch (e) { 
      alert('Error: ' + (e.response?.data?.error || e.message)); 
    } finally { setSyncingTrustonicLogs(false); }
  };

  const handleSavePayment = async (paymentData) => {
    try {
      let finalContractId = paymentData.contract_id;

      if (!finalContractId && paymentData.selectedProductId) {
        const product = data.products?.find(p => p.upya_id == paymentData.selectedProductId);
        const deal = data.paymentPlans?.find(d => d.upya_id == paymentData.selectedDeal);
        const contractPayload = {
          client_id: paymentData.client_id,
          product_name: product?.name || '',
          deal_name: deal?.name || '',
          total_value: deal?.total_cost || paymentData.amount || 0,
          paid_value: paymentData.amount || 0,
          status: 'Signed',
          tenantId: session.tenantId,
          userId: session.id,
          orgId: session.scope?.orgId
        };
        const cRes = await axios.post(`${API}/backoffice/contracts`, contractPayload);
        if (cRes.data && cRes.data.id) {
          finalContractId = cRes.data.id;
        }
      }

      const payload = { ...paymentData, contract_id: finalContractId, tenantId: session.tenantId, userId: session.id, orgId: session.scope?.orgId };
      let savedItem = paymentData;
      
      if (modalState.item && modalState.item.id) {
        await axios.put(`${API}/backoffice/payments/${modalState.item.id}`, payload);
      } else {
        const res = await axios.post(`${API}/backoffice/payments`, payload);
        if (res.data && res.data.id) {
          savedItem = { ...paymentData, id: res.data.id };
        }
      }
      
      setModalState(prev => ({ ...prev, item: savedItem }));
      refreshData();
      console.log('Pago guardado exitosamente:', savedItem);
      return savedItem;
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar el pago');
    }
  };

  const handleSaveContract = async (contractData, mode = false) => {
    try {
      const id = modalState.item?.upya_id || modalState.item?.contract_number;
      const tenantId = session.tenantId;
      let res;
      if (mode === true) { // Import
        const fd = contractData instanceof FormData ? contractData : new FormData();
        if (!(contractData instanceof FormData)) Object.entries(contractData).forEach(([k,v]) => fd.append(k,v));
        fd.append('tenantId', tenantId);
        fd.append('userId', session.id);
        if (session.scope?.orgId) fd.append('orgId', session.scope.orgId);
        res = await axios.post(`${API}/backoffice/contracts/import-and-sign`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (mode === 'generate') { // Generate from form
        res = await axios.post(`${API}/backoffice/contracts/generate-and-sign`, { 
          contractData, 
          signatureData: contractData.signatureData, 
          tenantId, 
          userId: session.id, 
          orgId: session.scope?.orgId 
        });
      } else {
        const payload = { ...contractData, tenantId, userId: session.id, orgId: session.scope?.orgId };
        if (id) {
          res = await axios.put(`${API}/backoffice/contracts/${id}`, payload);
        } else {
          res = await axios.post(`${API}/backoffice/contracts`, payload);
        }
      }
      setModalState({ type: null, open: false, item: null });
      await refreshData();
      return res?.data;
    } catch (e) {
      alert(e.response?.data?.error || e.message || 'Error al guardar el contrato');
    }
  };

  const handleSaveSignature = async (signatureData) => {
    try {
      const id = modalState.item?.upya_id || modalState.item?.contract_number;
      await axios.post(`${API}/backoffice/contracts/${id}/sign`, { signatureData, tenantId: session.tenantId });
      setModalState({ type: null, open: false, item: null });
      await refreshData();
      alert('✅ Contrato firmado exitosamente');
    } catch (e) {
      alert(e.response?.data?.error || 'Error al firmar el contrato');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      const payload = { username: session.username, password: session.password, productData, tenantId: session.tenantId };
      if (modalState.item) await axios.put(`${API}/backoffice/products/${modalState.item.upya_id}`, payload);
      else await axios.post(`${API}/backoffice/products`, payload);
      setModalState({ type: null, open: false, item: null });
      await refreshData();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto ${product.name}?`)) return;
    try {
      await axios.delete(`${API}/backoffice/products/${product.upya_id}?tenantId=${session.tenantId}`);
      refreshData();
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  const handleSaveTerm = async (planData) => {
    try {
      const payload = { planData, tenantId: session.tenantId };
      if (modalState.item) await axios.put(`${API}/backoffice/payment-plans/${modalState.item.upya_id}`, payload);
      else await axios.post(`${API}/backoffice/payment-plans`, payload);
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) { alert(e.message); }
  };

  const handleDeleteTerm = async (term) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el término ${term.name}?`)) return;
    try {
      await axios.delete(`${API}/backoffice/payment-plans/${term.upya_id}?tenantId=${session.tenantId}`);
      refreshData();
    } catch (e) { alert(e.response?.data?.error || e.message); }
  };

  const handleSaveCollection = async (collectionData) => {
    try {
      const payload = { username: session.username, password: session.password, collectionData, tenantId: session.tenantId };
      if (modalState.item) await axios.put(`${API}/backoffice/data-collections/${modalState.item.upya_id}`, payload);
      else await axios.post(`${API}/backoffice/data-collections`, payload);
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) { alert(e.message); }
  };

  const handleSaveAction = async (formData) => {
    try {
      const payload = { ...formData, tenantId: session.tenantId };
      if (modalState.item) {
        await axios.put(`${API}/backoffice/actions/${modalState.item.upya_id}`, payload);
      } else {
        await axios.post(`${API}/backoffice/actions`, payload);
      }
      refreshData();
    } catch (e) {
      console.error('Error saving action:', e);
      alert('Error al guardar la acción');
    }
  };

  const handleSaveDevice = async (deviceData) => {
    try {
      const payload = { ...deviceData, tenantId: session.tenantId };
      if (modalState.item) {
        await axios.put(`${API}/backoffice/trustonic-devices/${modalState.item.imei1}`, payload);
      } else {
        await axios.post(`${API}/backoffice/trustonic-devices`, payload);
      }
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar el dispositivo');
    }
  };

  const handleSaveClient = async (clientData) => {
    try {
      const clientId = clientData.upya_id || clientData.id;
      if (clientId) {
        await axios.put(`${API}/backoffice/clients/${clientId}`, { ...clientData, tenantId: session.tenantId });
      } else {
        await axios.post(`${API}/backoffice/clients`, { ...clientData, tenantId: session.tenantId });
      }
      setModalState({ type: null, open: false, item: null });
      refreshData();
    } catch (e) {
      alert(e.response?.data?.error || 'Error al guardar el cliente');
    }
  };

  const handleGenerateWallet = async (clientId) => {
    try {
      const res = await axios.post(`${API}/backoffice/clients/${clientId}/wallet`, { tenantId: session.tenantId });
      if (res.data.success) {
        alert(`✅ Wallet generada exitosamente\nCLABE: ${res.data.clabe || 'Pendiente'}`);
        await refreshData();
        if (modalState.open && modalState.item?.upya_id === clientId) {
          setModalState(prev => ({ ...prev, item: { ...prev.item, clabe: res.data.clabe, wallet_account_id: res.data.dcAccountId, wallet_client_id: res.data.dcClientId } }));
        }
      }
    } catch (e) { 
      console.error('Wallet Gen Error:', e);
      alert('Error al generar wallet: ' + (e.response?.data?.error || e.message)); 
    }
  };

  const handleNewContract = () => {
    console.log('Opening modal...');
    setModalState({ type: 'contract', open: true, item: null });
  };

  const handleOpenPaymentForContract = (contract) => {
    // 1. Calcular fechas recurrentes (día del mes actual para los siguientes 3 meses)
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    
    // Buscar el plan de pago asociado para calcular el enganche y pagos recurrentes
    const plan = (data.paymentPlans || []).find(p => p.name === contract.deal_name);
    let initialAmount = contract.upfront_payment || 0;
    let isRecurring = (contract.deal_name || '').toLowerCase().includes('mes');
    let repaymentFreq = null;
    let repaymentAmt = null;
    
    if (plan && plan.type === 'INSTALMENTS') {
      isRecurring = true;
      const totalValue = parseFloat(contract.total_value) || 0;
      
      const upfrontPct = parseFloat(plan.upfront_percentage) || 0;
      const calculatedInitial = upfrontPct;
      
      const interestPct = parseFloat(plan.interest_percentage) || 0;
      const remainingBalance = totalValue - calculatedInitial;
      const totalWithInterest = remainingBalance * (1 + (interestPct / 100));
      
      const iters = parseInt(plan.installments_count) || 1;
      repaymentAmt = (totalWithInterest / iters).toFixed(2);
      
      initialAmount = calculatedInitial.toFixed(2);
      repaymentFreq = plan.frequency_days;
    }
    
    const prefillPayment = {
      amount: initialAmount,
      method: (plan && plan.type === 'INSTALMENTS') ? 'Tarjeta Crédito' : 'Transferencia',
      status: 'Pending',
      contract_id: contract.contract_number || '',
      client_id: contract.client_id || '',
      payment_date: new Date().toISOString().split('T')[0],
      is_recurring: isRecurring,
      recurring_dates: isRecurring ? [day] : [],
      repayment_frequency: repaymentFreq,
      repayment_amount: repaymentAmt
    };

    setModalState({ type: 'payment', open: true, item: prefillPayment });
  };

  if (!session) return (
    <div className="min-h-dvh bg-slate-50 flex items-center justify-center p-5 md:p-8">
      <div className="w-full max-w-[440px] bg-white rounded-[48px] p-10 shadow-2xl text-center">
        <div className="w-16 h-16 bg-blue-600 rounded-[22px] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-blue-600/40"><ShieldCheck size={32} /></div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Bantos</h1>
        <p className="text-blue-600 font-black text-[11px] uppercase tracking-widest mb-8">Data Center</p>

        {!isRegistering ? (
          <div className="space-y-4">
            {loginError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-3 text-red-600 text-xs font-bold text-left flex items-center gap-2">
                <AlertCircle size={14} />{loginError}
              </div>
            )}

            {/* PASO 1: Credenciales */}
            {loginStep === 'credentials' && (
              <>
                <input id="u" type="text" placeholder="Usuario" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
                <div className="relative w-full">
                  <input 
                    id="p" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Contraseña" 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-6 pr-14 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors"
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <input id="tid" type="text" placeholder="Tenant ID (ej. c-romel)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
                <button
                  disabled={loginLoading}
                  onClick={async () => {
                    const u = document.getElementById('u').value.trim();
                    const p = document.getElementById('p').value;
                    const tid = document.getElementById('tid').value.trim();
                    if (!u || !p || !tid) { setLoginError('Usuario, Tenant ID y Contraseña son requeridos'); return; }
                    setLoginError('');
                    setLoginLoading(true);
                    try {
                      const res = await axios.post(`${API}/backoffice/auth`, { username: u, password: p, tenantId: tid });
                      if (res.data.success) {
                        if (res.data.user?.role === 'superadmin') {
                          // SuperAdmin: cargar lista de tenants y avanzar al selector
                          setLoginCredentials({ username: u, password: p });
                          const tenantsRes = await axios.get(`${API}/backoffice/tenant-list`);
                          setAvailableTenants(tenantsRes.data || []);
                          setSelectedTenantId(tid); // Pre-seleccionar el tenant escrito
                          setLoginStep('tenant-select');
                        } else {
                          // Usuario normal: sesión directa
                          const s = { ...res.data.user, password: p };
                          localStorage.setItem('bantos_session', JSON.stringify(s));
                          setSession(s);
                        }
                      }
                    } catch (err) {
                      setLoginError(err.response?.data?.message || 'Credenciales incorrectas o denegadas.');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 transition-all"
                >{loginLoading ? 'Autenticando...' : 'Acceder'}</button>
              </>
            )}


            {/* PASO 2: Selector de Tenant (solo SuperAdmin) */}
            {loginStep === 'tenant-select' && (
              <>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 text-blue-700 text-xs font-bold text-left flex items-center gap-2 mb-2">
                  <ShieldCheck size={14} /> SuperAdmin — Selecciona el tenant a gestionar
                </div>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all"
                >
                  <option value="">-- Selecciona un tenant --</option>
                  {availableTenants.map(t => (
                    <option key={t.tenant_id} value={t.tenant_id}>
                      {t.company_name || t.tenant_id}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!selectedTenantId || loginLoading}
                  onClick={async () => {
                    if (!selectedTenantId) return;
                    setLoginLoading(true);
                    setLoginError('');
                    try {
                      const res = await axios.post(`${API}/backoffice/auth`, {
                        username: loginCredentials.username,
                        password: loginCredentials.password,
                        tenantId: selectedTenantId
                      });
                      if (res.data.success) {
                        const s = { ...res.data.user, password: loginCredentials.password };
                        localStorage.setItem('bantos_session', JSON.stringify(s));
                        setSession(s);
                      }
                    } catch (err) {
                      setLoginError(err.response?.data?.message || 'Error al acceder al tenant.');
                    } finally {
                      setLoginLoading(false);
                    }
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/30 transition-all"
                >{loginLoading ? 'Accediendo...' : 'Entrar al Tenant'}</button>
                <button
                  onClick={() => { setLoginStep('credentials'); setLoginError(''); }}
                  className="w-full text-slate-400 font-bold text-xs py-2 hover:text-slate-600 transition-all"
                >← Volver</button>
              </>
            )}

            <p className="text-sm font-bold text-slate-400 mt-4">¿No tienes cuenta? <button onClick={() => setIsRegistering(true)} className="text-blue-600">Regístrate</button></p>
          </div>
        ) : (
          <div className="space-y-3">
            <input id="reg_u" type="text" placeholder="Nombre de Usuario" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_e" type="email" placeholder="Correo Electrónico" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_p" type="password" placeholder="Contraseña" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_cn" type="text" placeholder="Nombre de Contacto" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_co" type="text" placeholder="Nombre de Empresa" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_ph" type="text" placeholder="Teléfono" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <input id="reg_tid" type="text" placeholder="Tenant ID (ej. c-romel)" className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl py-3 px-5 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all" />
            <button onClick={async (e) => {
              const u = document.getElementById('reg_u').value;
              const e_mail = document.getElementById('reg_e').value;
              const p = document.getElementById('reg_p').value;
              const cn = document.getElementById('reg_cn').value;
              const co = document.getElementById('reg_co').value;
              const ph = document.getElementById('reg_ph').value;
              const tid = document.getElementById('reg_tid').value;
              if (!u || !p || !tid) return alert('Usuario, Contraseña y Tenant ID son requeridos');
              try {
                await axios.post(`${API}/auth/register`, { username: u, email: e_mail, password: p, contactName: cn, companyName: co, phone: ph, tenantId: tid });
                alert('Registro exitoso. Ahora puedes iniciar sesión.');
                setIsRegistering(false);
              } catch (err) { alert('Error en el registro'); }
            }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-600/30 transition-all">Registrar</button>
            <p className="text-sm font-bold text-slate-400 mt-2">¿Ya tienes cuenta? <button onClick={() => setIsRegistering(false)} className="text-blue-600">Inicia Sesión</button></p>
          </div>
        )}
      </div>
    </div>
  );

  const isAdmin = session?.role === 'admin' || session?.role === 'superadmin';

  const navItems = [
    { section: 'Operación', items: [
      { id: 'manage-dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'setup', label: 'Setup', icon: Settings2, children: [
        { id: 'setup-products', label: 'Productos', icon: Tag },
        ...(isAdmin ? [{ id: 'setup-terms', label: 'Términos & Condiciones', icon: ShieldCheck }] : []),
        ...(isAdmin ? [{ id: 'setup-org', label: 'Organización', icon: Building2 }] : []),
        { id: 'setup-users', label: 'Usuarios', icon: Users },
        { id: 'setup-stores', label: 'Tiendas', icon: Store },
        { id: 'setup-transfers', label: 'Transferencias', icon: ArrowRightLeft },
      ]},
      { id: 'records', label: 'Registro', icon: BookOpen, children: [
        { id: 'record-actions', label: 'Ventas', icon: Zap },
        { id: 'manage-clients', label: 'Clientes', icon: Users },
        { id: 'manage-contracts', label: 'Contratos', icon: FileText },
        { id: 'manage-payments', label: 'Pagos', icon: CreditCard },
      ]},
      { id: 'trustonic-menu', label: 'Trustonic', icon: Smartphone, children: [
        { id: 'manage-trustonic', label: 'Dispositivos', icon: Smartphone },
        { id: 'manage-trustonic-logs', label: 'Movimientos', icon: Activity },
      ]},
      { id: 'manage-audit', label: 'Auditoría', icon: Clock },
    ]},
    { section: 'Estructura', items: [ { id: 'setup-messaging', label: 'Mensajería', icon: Mail }, { id: 'setup-config', label: 'Sistema', icon: Settings2 } ]},
  ];

  const isAgent = session?.role === 'agent' || session?.role === 'agente';
  const allowedAgentItems = ['manage-dashboard', 'setup-products', 'record-actions', 'manage-payments'];

  const filteredNavItems = isAgent
    ? navItems.map(section => {
        const newItems = section.items.map(item => {
          if (allowedAgentItems.includes(item.id)) return item;
          if (item.children) {
            const filteredChildren = item.children.filter(child => allowedAgentItems.includes(child.id));
            if (filteredChildren.length > 0) {
              return { ...item, children: filteredChildren };
            }
          }
          return null;
        }).filter(Boolean);
        return { ...section, items: newItems };
      }).filter(section => section.items.length > 0)
    : navItems;

  return (
    <div className="flex min-h-dvh bg-slate-50 font-sans text-slate-800">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-100 flex flex-col p-8 shrink-0 transform transition-transform duration-300 md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 mb-10">
          {whitelabel?.whitelabel_logo ? (
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
              <img src={whitelabel.whitelabel_logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <ShieldCheck size={22} />
            </div>
          )}
          <div className="leading-none flex-1 truncate pr-2">
            {whitelabel?.whitelabel_name ? (
              <p className="font-black text-slate-900 text-base tracking-tight leading-tight truncate whitespace-normal break-words line-clamp-2">{whitelabel.whitelabel_name}</p>
            ) : (
              <>
                <p className="font-black text-slate-900 text-base tracking-tight">Bantos</p>
                <p className="text-blue-600 font-black text-[12px] uppercase tracking-widest">Data Center</p>
              </>
            )}
          </div>
        </div>
        
        {/* Context Selector for Hierarchy */}
        {session && (session.role === 'admin' || session.scope?.role === 'MANAGER') && (
          <div className="mb-10 p-5 bg-slate-50 rounded-[28px] border border-slate-100/50">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={14} className="text-blue-600" />
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Contexto Operativo</p>
            </div>
            <select 
              className="w-full bg-white border-2 border-slate-100 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-700 outline-none focus:border-blue-600 transition-all cursor-pointer shadow-sm"
              value={activeScope?.orgId || ''}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) setActiveScope(session.role === 'admin' ? null : session.scope);
                else {
                  const org = data.orgStructure.find(o => o.id == id);
                  setActiveScope({ orgId: org.id, orgName: org.name, orgType: org.type, role: 'MANAGER' });
                }
              }}
            >
              {session.role === 'admin' && <option value="">Global / Central</option>}
              {data.orgStructure.map(o => (
                <option key={o.id} value={o.id}>
                  {o.type === 'COUNTRY' ? '🌎 ' : o.type === 'BRANCH' ? '🏢 ' : '🛒 '} {o.name}
                </option>
              ))}
            </select>
            {activeScope && (
              <div className="mt-3 flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Filtrado por: {activeScope.orgType}</p>
              </div>
            )}
          </div>
        )}
        <nav className="flex-1 space-y-6 overflow-y-auto">
          {filteredNavItems.map(({ section, items }) => (
            <div key={section}>
              <p className="text-[12px] font-black uppercase tracking-[0.18em] text-slate-300 px-4 mb-3">{section}</p>
              <div className="space-y-0.5">{items.map(({ id, label, icon: Icon, children }) => (
                <div key={id} className="space-y-1">
                  <button onClick={() => { if (children) { setExpandedMenus(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]); } else { setView(id); setIsMobileMenuOpen(false); } }} className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl font-bold text-base transition-all ${view === id || (children && children.some(c => c.id === view)) ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                    <div className="flex items-center gap-3"><Icon size={20} /> {label}</div>
                    {children && (expandedMenus.includes(id) ? <ChevronDown size={16} className="opacity-50" /> : <ChevronRight size={16} className="opacity-50" />)}
                  </button>
                  {children && expandedMenus.includes(id) && (<div className="ml-4 pl-4 border-l border-slate-100 space-y-1 mt-1">{children.map(child => (<button key={child.id} onClick={() => { setView(child.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-bold text-sm transition-all ${view === child.id ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}><child.icon size={16} /> {child.label}</button>))}</div>)}
                </div>
              ))}</div>
            </div>
          ))}
          <div className="pt-4 border-t border-slate-50">
            <button onClick={() => { localStorage.removeItem('bantos_session'); window.location.reload(); }} className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 font-bold text-base hover:text-red-500 hover:bg-red-100/50 hover:text-red-600 rounded-xl transition-all group">
              <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> 
              Salir
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-dvh overflow-hidden bg-slate-50 w-full">
        <header className="flex justify-between md:justify-end items-center px-6 md:px-12 py-4 shrink-0 bg-white border-b border-slate-100 z-10 w-full">
          <button className="md:hidden p-2 -ml-2 text-slate-600 rounded-lg hover:bg-slate-100" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="bg-blue-50 px-6 py-3 rounded-2xl border border-blue-100 flex items-center gap-3">
            <ShieldCheck size={20} className="text-blue-600" />
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">{session?.email || 'Usuario Activo'}</p>
              <p className="text-sm font-black text-blue-700 leading-none">Tenant: {session?.tenantId || '—'}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-12 pb-12 pt-8">
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.18 }}>
            {view === 'manage-dashboard' && (
              <DashboardView 
                summary={summary} 
                session={session} 
                data={data} 
                setView={setView}
                onNewSale={() => { setView('record-actions'); setActionFormState({ open: true, actionType: 'Nuevo Cliente', prefillData: null }); }}
                onNewPayment={() => { setView('manage-payments'); setModalState({ type: 'payment', open: true, item: null }); }}
              />
            )}
            {view === 'manage-clients' && <ClientsView clients={data.clients} onEdit={(c) => setModalState({ type: 'client', open: true, item: c })} onCreate={() => setModalState({ type: 'client', open: true, item: null })} />}
            {view === 'manage-contracts' && (
              <ContractsView 
                contracts={data.contracts} 
                onNew={handleNewContract}
                onEdit={(c) => setModalState({ type: 'contract', open: true, item: c })} 
                onSign={(c) => setModalState({ type: 'signature', open: true, item: c })}
                onSettle={(c) => setModalState({ type: 'settlement', open: true, item: c })}
                session={session}
              />
            )}

            {view === 'manage-trustonic' && (
              <TrustonicDevicesView 
                data={data.trustonic} 
                onSync={handleSyncTrustonic} 
                syncing={syncingTrustonic} 
                onEdit={(d) => setModalState({ type: 'trustonic-device', open: true, item: d })}
                onCreate={() => setModalState({ type: 'trustonic-device', open: true, item: null })}
                session={session}
                onRefresh={refreshData}
              />
            )}
            {view === 'manage-trustonic-logs' && (
              <TrustonicLogsView 
                data={data.trustonicLogs} 
                onSync={handleSyncTrustonicLogs} 
                syncing={syncingTrustonicLogs} 
              />
            )}
            {view === 'manage-audit' && <AuditView audit={data.audit} />}
            {view === 'setup-system' && <SyncView onSync={handleSync} loading={syncing} />}
            {view === 'setup-messaging' && <MessagingSetup session={session} />}
            {view === 'setup-config' && <ConfigSetup session={session} />}
            {view === 'setup-products' && (
              <ViewErrorBoundary>
                <ProductsView 
                  products={Array.isArray(data?.products) ? data.products : []} 
                  onEdit={(p) => setModalState({ type: 'product', open: true, item: p })} 
                  onCreate={() => setModalState({ type: 'product', open: true, item: null })} 
                  onDelete={handleDeleteProduct} 
                  onImportSuccess={refreshData} 
                  tenantId={session?.tenantId} 
                  user={session} 
                />
              </ViewErrorBoundary>
            )}
            {view === 'setup-data-collection' && <DataCollectionView collections={data.dataCollections} onEdit={(c) => setModalState({ type: 'collection', open: true, item: c })} onCreate={() => setModalState({ type: 'collection', open: true, item: null })} />}
            {view === 'setup-terms' && <TermsView deals={data.paymentPlans} onEdit={(d) => setModalState({ type: 'term', open: true, item: d })} onCreate={() => setModalState({ type: 'term', open: true, item: null })} onDelete={handleDeleteTerm} />}
            {view === 'setup-org' && <OrganizationView structure={data.orgStructure} session={session} refreshData={refreshData} />}
            {view === 'setup-users' && <UsersView users={data.users} structure={data.orgStructure} session={session} refreshData={refreshData} />}
            {view === 'setup-stores' && <StoresView stores={data.stores} session={session} refreshData={refreshData} />}
            {view === 'setup-transfers' && <TransferenciasView stores={data.stores} inventory={data.inventory} session={session} refreshData={refreshData} users={data.users} />}
            
            {/* Navigational state for Actions Form vs List */}
            {view === 'record-actions' && !actionFormState.open && (
              <ActionsView incompleteActions={incompleteActions} onNavigate={(actionType, prefillData = null) => setActionFormState({ open: true, actionType, prefillData })} />
            )}
              {view === 'record-actions' && actionFormState.open && (
                <ActionFormView 
                  actionType={actionFormState.actionType} 
                  prefillData={actionFormState.prefillData} 
                  deals={data.paymentPlans} 
                  products={data.products} 
                  inventory={data.inventory}
                  clients={data.clients}
                  session={session}
                  globalSettings={globalSettings}
                  onOpenClientModal={() => setModalState({ type: 'client', open: true, item: null })}
                  onSaveContract={handleSaveContract}
                  onSavePayment={handleSavePayment}
                  onSaveDraft={(updatedData) => {
                    setIncompleteActions(prev => {
                      const idx = prev.findIndex(a => a.id === updatedData.id);
                      if (idx >= 0) {
                        const newActions = [...prev];
                        newActions[idx] = { ...newActions[idx], ...updatedData };
                        return newActions;
                      }
                      return [{ ...updatedData, date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }) }, ...prev];
                    });
                    setActionFormState({ open: false, actionType: null, prefillData: null });
                  }}
                  onBack={() => setActionFormState({ open: false, actionType: null, prefillData: null })} 
                />
              )}

            {view === 'manage-payments' && <PaymentsView payments={data.payments} onEdit={(p) => setModalState({ type: 'payment', open: true, item: p })} onCreate={() => setModalState({ type: 'payment', open: true, item: null })} session={session} />}
            
            {/* Fallbacks */}
            {['setup-templates', 'record-todos', 'record-comms'].includes(view) && (
              <PlaceholderView 
                title={navItems.flatMap(n => n.items).flatMap(i => [i, ...(i.children || [])]).find(x => x.id === view)?.label || 'Módulo'} 
                subtitle="Funcionalidad programada para la siguiente fase" 
              />
            )}
          </motion.div>
        </AnimatePresence>
        </div>

        <ProductModal isOpen={modalState.open && modalState.type === 'product'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveProduct} product={modalState.item} inventory={data.inventory} products={data.products} users={data.users} onAddInventory={handleAddInventory} onEditInventory={handleEditInventory} refreshData={refreshData} session={session} />
        <TermModal isOpen={modalState.open && modalState.type === 'term'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveTerm} term={modalState.item} globalSettings={globalSettings} />
        <DataCollectionModal isOpen={modalState.open && modalState.type === 'collection'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveCollection} collection={modalState.item} />
        <ActionModal isOpen={modalState.open && modalState.type === 'action'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveAction} action={modalState.item} />
        <PaymentModal isOpen={modalState.open && modalState.type === 'payment'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSavePayment} payment={modalState.item} clients={data.clients} contracts={data.contracts} session={session} products={data.products} inventory={data.inventory} deals={data.paymentPlans} onOpenClientModal={() => setModalState({ type: 'client', open: true, item: null })} onSaveContract={handleSaveContract} globalSettings={globalSettings} />
        <ContractModal isOpen={modalState.open && modalState.type === 'contract'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveContract} contract={modalState.item} clients={data.clients} products={data.products} inventory={data.inventory} paymentPlans={data.paymentPlans} tenantId={session?.tenantId} onOpenPayment={handleOpenPaymentForContract} />
        <SignatureModal isOpen={modalState.open && modalState.type === 'signature'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveSignature} contract={modalState.item} />
        <TrustonicDeviceModal isOpen={modalState.open && modalState.type === 'trustonic-device'} onClose={() => setModalState({ type: null, open: false, item: null })} onSave={handleSaveDevice} device={modalState.item} />
        <ClientModal isOpen={modalState.open && modalState.type === 'client'} onClose={() => setModalState({ type: null, open: false, item: null })} client={modalState.item} onSave={handleSaveClient} onGenerateWallet={handleGenerateWallet} orgStructure={data.orgStructure} />
        <SettlementModal isOpen={modalState.open && modalState.type === 'settlement'} onClose={() => setModalState({ type: null, open: false, item: null })} contract={modalState.item} session={session} onSettled={refreshData} />
      </main>
      <SupportAgent />
    </div>
  );
};

export default App;
