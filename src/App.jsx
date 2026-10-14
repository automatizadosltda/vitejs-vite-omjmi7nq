import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, Users, Wrench, FileText, 
  DollarSign, Settings, LogOut, Menu, X, Plus, Search, 
  Phone, Mail, MapPin, CheckCircle, Clock, AlertCircle, 
  ChevronRight, Smartphone, Monitor, Lock, User
} from 'lucide-react';
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";

// NOTA: Asegúrate de tener tu archivo firebase.js configurado correctamente en src/firebase.js
// Aquí importamos auth y db desde tu archivo de configuración:
// import { auth, db } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');

  const [activeTab, setActiveTab] = useState('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deviceMode, setDeviceMode] = useState('responsive'); // responsive, mobile, desktop

  // Estados de modales y datos simulados/reales
  const [showNewModal, setShowNewModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'cita', 'cliente', 'orden', 'cotizacion'
  
  // Datos de ejemplo para la interfaz inmediata
  const [clientes, setClientes] = useState([
    { id: 1, nombre: 'Juan Pérez', telefono: '+56 9 1234 5678', direccion: 'Av. Providencia 1234, Santiago', tipo: 'Residencial' },
    { id: 2, nombre: 'María González', telefono: '+56 9 8765 4321', direccion: 'Vitacura 4500, Santiago', tipo: 'Comercial' },
    { id: 3, nombre: 'Automatizaciones Sur SpA', telefono: '+56 9 5555 4433', direccion: 'Camino Lonquén 800, Maipú', tipo: 'Empresa' }
  ]);

  const [ordenes, setOrdenes] = useState([
    { id: 1089, cliente: 'Juan Pérez', servicio: 'Reparación de Motor Corredizo', estado: 'En Proceso', fecha: '13 Oct 2026' },
    { id: 1090, cliente: 'María González', servicio: 'Instalación Brazo Hidráulico', estado: 'Pendiente', fecha: '14 Oct 2026' }
  ]);

  // Simulación de autenticación (Si quieres conectar Firebase Auth real, descomenta las funciones de abajo)
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setUser({ email: email });
    } else {
      setErrorLogin('Por favor ingresa correo y contraseña');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">AUTOMATIZADOS</h1>
            <p className="text-slate-400 text-sm mt-1">Gestión y Automatización de Portones</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {errorLogin && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorLogin}</span>
              </div>
            )}
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Correo Electrónico</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@automatizados.cl"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-5 h-5 text-slate-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pl-12 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-200"
            >
              Iniciar Sesión
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            Automatizados Gestión © 2026 • Acceso Privado Seguro
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Barra superior de control de vistas (Simulador de Dispositivo) */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-medium text-white">Automatizados Gestión</span>
          <span className="text-slate-500 hidden sm:inline">| Sesión: {user.email}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-800 rounded-lg p-1">
            <button 
              onClick={() => setDeviceMode('responsive')}
              className={`px-2.5 py-1 rounded ${deviceMode === 'responsive' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Vista Responsiva Automática"
            >
              Auto
            </button>
            <button 
              onClick={() => setDeviceMode('mobile')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${deviceMode === 'mobile' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Simular Teléfono"
            >
              <Smartphone className="w-3.5 h-3.5" /> Móvil
            </button>
            <button 
              onClick={() => setDeviceMode('desktop')}
              className={`px-2.5 py-1 rounded flex items-center gap-1 ${deviceMode === 'desktop' ? 'bg-blue-600 text-white' : 'hover:text-white'}`}
              title="Simular Escritorio"
            >
              <Monitor className="w-3.5 h-3.5" /> PC
            </button>
          </div>
          <button 
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2.5 py-1 rounded-lg"
          >
            <LogOut className="w-3.5 h-3.5" /> Salir
          </button>
        </div>
      </div>

      {/* Contenedor principal adaptable */}
      <div className={`flex-1 flex justify-center bg-slate-200/50 p-0 ${deviceMode === 'mobile' ? 'py-6' : ''}`}>
        <div className={`w-full bg-slate-100 flex overflow-hidden shadow-2xl ${
          deviceMode === 'mobile' ? 'max-w-[410px] h-[840px] rounded-[40px] border-[8px] border-slate-900 flex-col relative' : 
          deviceMode === 'desktop' ? 'max-w-[1440px] min-h-screen' : 
          'max-w-[1440px] min-h-screen'
        }`}>

          {/* MENÚ LATERAL (Escritorio / Auto ancho) */}
          {deviceMode !== 'mobile' && (
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between hidden md:flex border-r border-slate-800">
              <div>
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                    <Wrench className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white text-sm tracking-wide">AUTOMATIZADOS</h2>
                    <p className="text-[10px] text-blue-400 font-semibold tracking-wider">GESTIÓN Y SERVICIOS</p>
                  </div>
                </div>

                <nav className="p-4 space-y-1">
                  {[
                    { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
                    { id: 'agenda', label: 'Agenda', icon: Calendar },
                    { id: 'clientes', label: 'Clientes', icon: Users },
                    { id: 'ordenes', label: 'Órdenes de Trabajo', icon: Wrench },
                    { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
                    { id: 'pagos', label: 'Pagos y Finanzas', icon: DollarSign },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                            : 'hover:bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-slate-800 space-y-1">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </aside>
          )}

          {/* CONTENIDO CENTRAL DE LA APP */}
          <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
            
            {/* Cabecera superior interna */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
              <div className="flex items-center gap-3">
                {deviceMode === 'mobile' && (
                  <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg">
                    <Menu className="w-6 h-6" />
                  </button>
                )}
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-slate-800 capitalize">
                    {activeTab === 'inicio' ? 'Panel Principal' : activeTab}
                  </h1>
                  <p className="text-xs text-slate-500 hidden sm:block">Martes, 13 de Octubre de 2026 • Santiago, Chile</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => { setModalType('cita'); setShowNewModal(true); }}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/25 transition-all"
                >
                  <Plus className="w-4 h-4" /> <span>Nuevo Registro</span>
                </button>
              </div>
            </header>

            {/* Menú desplegable para móvil */}
            {isMobileMenuOpen && (
              <div className="absolute top-16 left-0 w-64 bg-slate-900 text-slate-200 z-50 shadow-2xl border-r border-slate-800 h-[calc(100%-4rem)] flex flex-col justify-between md:hidden animate-in slide-in-from-left duration-200">
                <nav className="p-4 space-y-1">
                  {[
                    { id: 'inicio', label: 'Inicio', icon: LayoutDashboard },
                    { id: 'agenda', label: 'Agenda', icon: Calendar },
                    { id: 'clientes', label: 'Clientes', icon: Users },
                    { id: 'ordenes', label: 'Órdenes de Trabajo', icon: Wrench },
                    { id: 'cotizaciones', label: 'Cotizaciones', icon: FileText },
                    { id: 'pagos', label: 'Pagos y Finanzas', icon: DollarSign },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                          activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            )}

            {/* VISTAS SEGÚN LA SECCIÓN ACTIVA */}
            <div className="p-4 md:p-6 flex-1 space-y-6 pb-20">
              
              {/* VISTA INICIO */}
              {activeTab === 'inicio' && (
                <>
                  {/* Tarjetas de Resumen */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Órdenes Activas</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">24</h3>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">+3 esta semana</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Wrench className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Totales</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">1,280</h3>
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-2 inline-block">Base activa</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ingresos del Mes</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">$1.450.000</h3>
                        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-2 inline-block">↑ 12% vs anterior</span>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <DollarSign className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Actividades Próximas y Órdenes Recientes */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Órdenes de Trabajo Recientes</h3>
                        <button onClick={() => setActiveTab('ordenes')} className="text-xs text-blue-600 font-semibold hover:underline">Ver todas</button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 text-xs">
                              <th className="pb-3 font-semibold">ID</th>
                              <th className="pb-3 font-semibold">Cliente</th>
                              <th className="pb-3 font-semibold">Servicio</th>
                              <th className="pb-3 font-semibold">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {ordenes.map((ord) => (
                              <tr key={ord.id} className="hover:bg-slate-50">
                                <td className="py-3 font-medium text-slate-800">#{ord.id}</td>
                                <td className="py-3 text-slate-700">{ord.cliente}</td>
                                <td className="py-3 text-slate-500">{ord.servicio}</td>
                                <td className="py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    ord.estado === 'En Proceso' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {ord.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                      <h3 className="font-bold text-slate-800 mb-4">Próximas Visitas Hoy</h3>
                      <div className="space-y-3">
                        {[
                          { time: '09:30', title: 'Reparación Motor Corredizo', client: 'Juan Pérez', status: 'En Curso' },
                          { time: '12:00', title: 'Mantenimiento Preventivo', client: 'María González', status: 'Pendiente' },
                          { time: '16:15', title: 'Cotización Automatización', client: 'Automatizaciones Sur', status: 'Programado' }
                        ].map((vis, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                            <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-lg mt-0.5">
                              {vis.time}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xs font-bold text-slate-800">{vis.title}</h4>
                              <p className="text-[11px] text-slate-500">{vis.client}</p>
                            </div>
                            <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-medium">{vis.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* VISTA AGENDA */}
              {activeTab === 'agenda' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Calendario de Instalaciones y Visitas</h3>
                      <p className="text-xs text-slate-500">Organiza tus visitas técnicas y mantén el control diario.</p>
                    </div>
                    <button 
                      onClick={() => { setModalType('cita'); setShowNewModal(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" /> Nueva Cita
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((day, idx) => (
                      <div key={idx} className="text-center font-semibold text-xs text-slate-500 pb-2 border-b border-slate-200">{day}</div>
                    ))}
                    {Array.from({ length: 31 }).map((_, i) => (
                      <div key={i} className={`min-h-[90px] bg-white p-2 rounded-lg border ${i === 12 ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'} flex flex-col justify-between`}>
                        <span className={`text-xs font-bold ${i === 12 ? 'text-blue-600' : 'text-slate-700'}`}>{i + 1}</span>
                        {i === 12 && (
                          <div className="bg-blue-50 border border-blue-200 text-blue-700 text-[10px] p-1 rounded font-medium truncate">
                            09:30 - Reparación Portón
                          </div>
                        )}
                        {i === 14 && (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] p-1 rounded font-medium truncate">
                            15:00 - Mantención
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA CLIENTES */}
              {activeTab === 'clientes' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Base de Datos de Clientes</h3>
                      <p className="text-xs text-slate-500">Gestiona direcciones, teléfonos y equipos instalados.</p>
                    </div>
                    <button 
                      onClick={() => { setModalType('cliente'); setShowNewModal(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" /> Agregar Cliente
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {clientes.map((c) => (
                      <div key={c.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-all shadow-sm space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-slate-800">{c.nombre}</h4>
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">{c.tipo}</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-500">
                          <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-slate-400" /> {c.telefono}</p>
                          <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.direccion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA ÓRDENES */}
              {activeTab === 'ordenes' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Órdenes de Trabajo</h3>
                      <p className="text-xs text-slate-500">Seguimiento de reparaciones, instalaciones y repuestos.</p>
                    </div>
                    <button 
                      onClick={() => { setModalType('orden'); setShowNewModal(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" /> Nueva Orden
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ordenes.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">Orden #{ord.id}</span>
                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{ord.fecha}</span>
                          </div>
                          <p className="text-sm font-medium text-slate-700">{ord.servicio}</p>
                          <p className="text-xs text-slate-500">Cliente: {ord.cliente}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            ord.estado === 'En Proceso' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {ord.estado}
                          </span>
                          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">Ver PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VISTA COTIZACIONES */}
              {activeTab === 'cotizaciones' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Cotizaciones Formales</h3>
                      <p className="text-xs text-slate-500">Genera presupuestos de motores, cremalleras e instalaciones.</p>
                    </div>
                    <button 
                      onClick={() => { setModalType('cotizacion'); setShowNewModal(true); }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20"
                    >
                      <Plus className="w-4 h-4" /> Crear Cotización
                    </button>
                  </div>

                  <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                    <h4 className="font-bold text-slate-700">Sin cotizaciones recientes creadas</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">Haz clic en el botón superior para armar tu primera cotización con cálculo de IVA y formato profesional para enviar por WhatsApp o PDF.</p>
                  </div>
                </div>
              )}

              {/* VISTA PAGOS Y FINANZAS */}
              {activeTab === 'pagos' && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Control de Pagos y Finanzas</h3>
                    <p className="text-xs text-slate-500">Historial de abonos, saldos pendientes y facturación.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-emerald-700 uppercase">Ingresos Totales (Octubre)</p>
                      <h4 className="text-2xl font-black text-emerald-900">$1.450.000</h4>
                      <p className="text-xs text-emerald-600">18 trabajos pagados en su totalidad.</p>
                    </div>

                    <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-amber-700 uppercase">Saldos Pendientes por Cobrar</p>
                      <h4 className="text-2xl font-black text-amber-900">$320.000</h4>
                      <p className="text-xs text-amber-600">4 clientes con abono pendiente.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Barra de navegación inferior exclusiva para vista teléfono */}
            {deviceMode === 'mobile' && (
              <nav className="bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center sticky bottom-0 z-30">
                {[
                  { id: 'inicio', icon: LayoutDashboard, label: 'Inicio' },
                  { id: 'agenda', icon: Calendar, label: 'Agenda' },
                  { id: 'clientes', icon: Users, label: 'Clientes' },
                  { id: 'ordenes', icon: Wrench, label: 'Órdenes' },
                  { id: 'pagos', icon: DollarSign, label: 'Pagos' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex flex-col items-center gap-1 p-1 ${isActive ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

          </main>
        </div>
      </div>

      {/* MODAL UNIVERSAL PARA CREAR NUEVOS REGISTROS */}
      {showNewModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 capitalize">
                Nuevo Registro ({modalType})
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre / Título Principal</label>
                <input type="text" placeholder="Ej. Juan Pérez o Instalación Motor" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Detalle / Teléfono / Dirección</label>
                <input type="text" placeholder="Ej. +56 9 1234 5678" className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Observaciones</label>
                <textarea rows="3" placeholder="Notas adicionales..." className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  alert('¡Registro guardado con éxito!');
                  setShowNewModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 shadow-lg shadow-blue-600/20"
              >
                Guardar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
