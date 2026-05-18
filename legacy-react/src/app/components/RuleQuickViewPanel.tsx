import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Rule } from "./RulesContext";
import { FileText, Users, Phone, ArrowRight, Calendar, Clock } from "lucide-react";
import { Badge } from "./ui/badge";

interface RuleQuickViewPanelProps {
  rule: Rule | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RuleQuickViewPanel({ rule, open, onOpenChange }: RuleQuickViewPanelProps) {
  if (!rule) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] overflow-y-auto p-6">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <FileText size={20} className="text-[#60D3E4]" />
            {rule.name}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Estado */}
          <div>
            <Badge 
              variant={rule.active ? "default" : "secondary"}
              className={rule.active ? "bg-green-500 hover:bg-green-600" : "bg-gray-400"}
            >
              {rule.active ? "Activa" : "Inactiva"}
            </Badge>
          </div>

          {/* Descripción */}
          {rule.description && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2">Descripción</h4>
              <p className="text-sm text-[#8D939D]">{rule.description}</p>
            </div>
          )}

          {/* Servicios */}
          <div>
            <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
              <Phone size={16} />
              Servicios
            </h4>
            <div className="flex flex-wrap gap-2">
              {rule.servicios.length > 0 ? (
                rule.servicios.map((servicio, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {servicio}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-[#8D939D]">Todos los servicios</p>
              )}
            </div>
          </div>

          {/* Grupos */}
          {rule.grupos && rule.grupos.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
                <Users size={16} />
                Grupos
              </h4>
              <div className="flex flex-wrap gap-2">
                {rule.grupos.map((grupo, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                    {grupo}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Agentes */}
          {rule.agentes && rule.agentes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
                <Users size={16} />
                Agentes
              </h4>
              <div className="flex flex-wrap gap-2">
                {rule.agentes.map((agente, idx) => (
                  <Badge key={idx} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    {agente}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Dirección */}
          {(rule.origen || rule.destino) && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
                <ArrowRight size={16} />
                Dirección
              </h4>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#8D939D]">{rule.origen || "Cualquiera"}</span>
                <ArrowRight size={14} className="text-[#8D939D]" />
                <span className="text-[#8D939D]">{rule.destino || "Cualquiera"}</span>
              </div>
            </div>
          )}

          {/* Horario */}
          {rule.schedule?.enabled && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
                <Clock size={16} />
                Horario
              </h4>
              <p className="text-sm text-[#8D939D]">
                De {rule.schedule.from} a {rule.schedule.to}
              </p>
            </div>
          )}

          {/* Duración */}
          {(rule.durationMin || rule.durationMax) && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2 flex items-center gap-2">
                <Calendar size={16} />
                Duración
              </h4>
              <p className="text-sm text-[#8D939D]">
                {rule.durationMin && `Mínimo: ${rule.durationMin}s`}
                {rule.durationMin && rule.durationMax && " | "}
                {rule.durationMax && `Máximo: ${rule.durationMax}s`}
              </p>
            </div>
          )}

          {/* Categorías vinculadas */}
          {rule.categorias && rule.categorias.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2">Categorías vinculadas</h4>
              <div className="flex flex-wrap gap-2">
                {rule.categorias.map((categoria, idx) => (
                  <Badge key={idx} variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {categoria}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Entidades vinculadas */}
          {rule.entidades && rule.entidades.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[#233155] mb-2">Entidades vinculadas</h4>
              <div className="flex flex-wrap gap-2">
                {rule.entidades.map((entidad, idx) => (
                  <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {entidad}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Procesamiento */}
          <div>
            <h4 className="text-sm font-medium text-[#233155] mb-2">Procesamiento</h4>
            <div className="space-y-1 text-sm text-[#8D939D]">
              <p>✓ Transcripción: {rule.transcripcion ? "Sí" : "No"}</p>
              <p>✓ Clasificación: {rule.clasificacion ? "Sí" : "No"}</p>
              {rule.sentimiento !== undefined && (
                <p>✓ Sentimiento: {rule.sentimiento ? "Sí" : "No"}</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}