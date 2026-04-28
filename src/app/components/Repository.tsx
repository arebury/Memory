import { ArrowRight, ArrowUpRight, Database, Users, User, Phone, Tags, Workflow, MessageSquareText, Sparkles, BookOpen, Circle, FileText } from 'lucide-react';
import { DataExportImport } from './DataExportImport';

interface RepositoryProps {
  onNavigateToRules: () => void;
  onNavigateToEntities: () => void;
  onNavigateToCategories: () => void;
}

export function Repository({ onNavigateToRules, onNavigateToEntities, onNavigateToCategories }: RepositoryProps) {
  return (
    <div className="h-full bg-[#F4F6FC] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-[#CFD3DE] px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[#1C283D] mb-1">Repositorio</h1>
            <p className="text-sm text-[#8D939D]">
              Todos los elementos configurables de tu sistema de conversaciones
            </p>
          </div>
          <DataExportImport />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">

          {/* ─── Automatización ─── */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm text-[#233155] uppercase tracking-wider mb-0.5">Automatización</h2>
              <p className="text-xs text-[#A3A8B0]">Lógica que define qué ocurre con cada conversación</p>
            </div>

            {/* Rules — hero card */}
            <div
              className="bg-white rounded-xl border border-[#E5E7EB] hover:border-[#60D3E4] cursor-pointer hover:shadow-sm transition-all p-6 group"
              onClick={onNavigateToRules}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  {/* Rule type icons cluster */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                      <Circle size={10} className="text-red-500 fill-red-500" />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                      <FileText size={14} />
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                      <Sparkles size={14} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[#233155] mb-1">Reglas de automatización</h3>
                    <p className="text-sm text-[#8D939D] leading-relaxed max-w-lg">
                      Define cuándo grabar, transcribir o analizar una conversación con IA. Las reglas se aplican automáticamente en función del alcance y la prioridad que configures.
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                        <span className="text-xs text-[#8D939D]">Grabación</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <span className="text-xs text-[#8D939D]">Transcripción</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                        <span className="text-xs text-[#8D939D]">Clasificación IA</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 shrink-0">
                  <ArrowRight size={18} className="text-[#60D3E4] group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                  <button
                    onClick={(e) => { e.stopPropagation(); window.open('#', '_blank'); }}
                    className="flex items-center gap-1 text-xs text-[#60D3E4] hover:text-[#387983] transition-colors"
                  >
                    <BookOpen size={12} />
                    Cómo funcionan las reglas
                    <ArrowUpRight size={10} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Estructura del contact center ─── */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm text-[#233155] uppercase tracking-wider mb-0.5">Estructura del contact center</h2>
              <p className="text-xs text-[#A3A8B0]">Unidades organizativas que se usan como alcance en las reglas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'services',
                  title: 'Servicios',
                  description: 'Líneas de atención y colas de entrada',
                  icon: Phone,
                  color: '#60D3E4',
                  bgColor: '#EEFBFD',
                },
                {
                  id: 'groups',
                  title: 'Grupos',
                  description: 'Equipos y colas de trabajo por función',
                  icon: Users,
                  color: '#60D3E4',
                  bgColor: '#EEFBFD',
                },
                {
                  id: 'agents',
                  title: 'Agentes',
                  description: 'Operadores individuales del contact center',
                  icon: User,
                  color: '#60D3E4',
                  bgColor: '#EEFBFD',
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-[#E5E7EB] p-4 flex items-center gap-3 opacity-75 cursor-default"
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: item.bgColor }}>
                    <item.icon size={18} style={{ color: item.color }} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-[#233155]">{item.title}</p>
                      <span className="text-[10px] bg-[#F4F6FC] text-[#8D939D] px-1.5 py-0.5 rounded">Sincronizado</span>
                    </div>
                    <p className="text-xs text-[#A3A8B0] mt-0.5 truncate">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-[#A3A8B0] mt-2 pl-1">
              Estos datos se sincronizan automáticamente desde tu sistema IVR. No requieren gestión manual.
            </p>
          </section>

          {/* ─── Inteligencia Artificial ─── */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm text-[#233155] uppercase tracking-wider mb-0.5">Inteligencia artificial</h2>
              <p className="text-xs text-[#A3A8B0]">Define qué detectar y extraer de las conversaciones analizadas</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                className="bg-white rounded-lg border border-[#E5E7EB] hover:border-[#60D3E4] cursor-pointer hover:shadow-sm transition-all p-5 group"
                onClick={onNavigateToCategories}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                      <Tags size={18} className="text-purple-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[#233155] mb-1">Categorías IA</h3>
                      <p className="text-sm text-[#8D939D] leading-relaxed">
                        Temas y motivos de contacto personalizados que la IA detecta en las conversaciones.
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#60D3E4] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </div>
              </div>

              <div
                className="bg-white rounded-lg border border-[#E5E7EB] hover:border-[#60D3E4] cursor-pointer hover:shadow-sm transition-all p-5 group"
                onClick={onNavigateToEntities}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                      <Database size={18} className="text-teal-500" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="text-[#233155] mb-1">Entidades IA</h3>
                      <p className="text-sm text-[#8D939D] leading-relaxed">
                        Variables específicas a extraer: DNI, importes, productos, fechas y más.
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[#60D3E4] shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </section>

          {/* ─── Próximamente ─── */}
          <section>
            <div className="mb-3">
              <h2 className="text-sm text-[#233155] uppercase tracking-wider mb-0.5">Próximamente</h2>
              <p className="text-xs text-[#A3A8B0]">Nuevas funcionalidades en desarrollo</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: 'scripts',
                  title: 'Scripts de IVR',
                  description: 'Flujos de conversación y árboles de decisión configurables',
                  icon: Workflow,
                },
                {
                  id: 'templates',
                  title: 'Plantillas de respuesta',
                  description: 'Respuestas predefinidas reutilizables por los agentes',
                  icon: MessageSquareText,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border border-[#E5E7EB] p-5 opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F4F6FC] flex items-center justify-center shrink-0">
                      <item.icon size={18} className="text-[#8D939D]" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[#8D939D]">{item.title}</h3>
                        <span className="text-[10px] bg-[#FEF3C7] text-[#92400E] px-1.5 py-0.5 rounded shrink-0">Próximamente</span>
                      </div>
                      <p className="text-sm text-[#A3A8B0]">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
