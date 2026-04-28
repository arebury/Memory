import { Conversation, TranscriptionLine } from "./mockData";

/**
 * Random transcription generator · prototype-only.
 *
 * Produces a believable Speaker-1/Speaker-2 dialogue for any conversation
 * that does not yet have a `transcription` array. The generator is
 * deterministic per conversation id (same id → same dialogue) so the
 * prototype stays stable between renders, but different conversations
 * yield different content.
 */

interface ScriptLine {
  speakerKey: "agent" | "client";
  text: string;
}

/* Six small dialogue templates that we cycle through by id-hash. Each
   covers a different domain so the demo doesn't feel repetitive. */
const dialogues: ScriptLine[][] = [
  [
    { speakerKey: "agent",  text: "Hola, gracias por contactar con atención al cliente. ¿En qué puedo ayudarle?" },
    { speakerKey: "client", text: "Hola, llevo dos días sin servicio en mi línea principal y necesito una solución urgente." },
    { speakerKey: "agent",  text: "Lamento lo ocurrido. ¿Me puede confirmar su número de cliente, por favor?" },
    { speakerKey: "client", text: "Sí, es el 1847263. Lo tengo apuntado por las llamadas anteriores." },
    { speakerKey: "agent",  text: "Perfecto, lo tengo localizado. Veo una incidencia abierta desde ayer en su zona." },
    { speakerKey: "client", text: "¿Y por qué no me han avisado? Esto es inadmisible." },
    { speakerKey: "agent",  text: "Comprendo su frustración. Voy a escalarlo a prioridad alta y le compensaremos en la próxima factura." },
    { speakerKey: "client", text: "Está bien. ¿En cuánto tiempo se resuelve?" },
    { speakerKey: "agent",  text: "Estimamos entre 4 y 6 horas. Le mandaré un SMS cuando esté restablecido." },
    { speakerKey: "client", text: "De acuerdo, gracias por la rápida atención." },
  ],
  [
    { speakerKey: "client", text: "Buenas tardes, vi su anuncio del plan empresarial y me interesa." },
    { speakerKey: "agent",  text: "¡Excelente! ¿Cuántos usuarios tiene su empresa actualmente?" },
    { speakerKey: "client", text: "Somos unos 50 empleados, con previsión de crecer en los próximos meses." },
    { speakerKey: "agent",  text: "Para ese tamaño les recomendaría el plan Pro: acceso ilimitado y soporte prioritario." },
    { speakerKey: "client", text: "¿Cuál sería el coste mensual?" },
    { speakerKey: "agent",  text: "Para 50 usuarios estaríamos en 2.500€ al mes con descuento anual del 15%." },
    { speakerKey: "client", text: "Necesitaría una demo antes de tomar la decisión." },
    { speakerKey: "agent",  text: "Por supuesto. ¿Le viene bien el viernes a las 11:00? Le envío invitación." },
    { speakerKey: "client", text: "Perfecto, agendado." },
  ],
  [
    { speakerKey: "agent",  text: "Hola, soy del departamento técnico. ¿Cómo podemos ayudarle?" },
    { speakerKey: "client", text: "Mi sistema no arranca desde esta mañana, tengo toda la oficina parada." },
    { speakerKey: "agent",  text: "Entiendo la urgencia. ¿Ha probado a reiniciar el servidor principal?" },
    { speakerKey: "client", text: "Dos veces, pero se queda en la pantalla de carga." },
    { speakerKey: "agent",  text: "Vamos a probar un arranque seguro. ¿Tiene acceso físico al equipo?" },
    { speakerKey: "client", text: "Sí, estoy delante." },
    { speakerKey: "agent",  text: "Apague pulsando el botón de encendido y al volver a encender pulse F8 repetidamente." },
    { speakerKey: "client", text: "Listo, aparece un menú. Selecciono modo seguro." },
    { speakerKey: "agent",  text: "Perfecto, eso aísla el problema. Le paso a nivel 2 para que se conecten remotamente." },
    { speakerKey: "client", text: "Muchas gracias por la rapidez." },
  ],
  [
    { speakerKey: "client", text: "Hola, llamo porque he visto un cargo en mi factura que no reconozco." },
    { speakerKey: "agent",  text: "Lamento la confusión. ¿Podría indicarme la fecha y el importe?" },
    { speakerKey: "client", text: "El 15 del mes pasado, 45,50€. Antes pagaba 32,00€ exactos." },
    { speakerKey: "agent",  text: "Permítame revisarlo... Veo que ese mes finalizó la promoción de bienvenida del 30%." },
    { speakerKey: "client", text: "Nadie me avisó de eso, no me parece justo." },
    { speakerKey: "agent",  text: "Le entiendo. Voy a aplicar una bonificación del 20% durante los próximos tres meses." },
    { speakerKey: "client", text: "Eso me parece razonable, gracias." },
    { speakerKey: "agent",  text: "Verá el ajuste reflejado en la próxima factura. ¿Algo más en lo que ayudarle?" },
    { speakerKey: "client", text: "No, eso es todo. Que tenga buen día." },
  ],
  [
    { speakerKey: "agent",  text: "Hola, llamo en seguimiento de su pedido número 4521. ¿Tiene un momento?" },
    { speakerKey: "client", text: "Sí, dígame, esperaba esta llamada." },
    { speakerKey: "agent",  text: "El equipo de logística confirma entrega para el martes entre 10 y 14 horas." },
    { speakerKey: "client", text: "Perfecto, esa franja me viene bien. ¿Tendré tracking en tiempo real?" },
    { speakerKey: "agent",  text: "Sí, le enviaremos el enlace por SMS y email una hora antes." },
    { speakerKey: "client", text: "Ideal. ¿Y la instalación está incluida?" },
    { speakerKey: "agent",  text: "Sí, viene un técnico certificado. La instalación dura unos 30 minutos." },
    { speakerKey: "client", text: "Genial, muchas gracias por la información." },
  ],
  [
    { speakerKey: "client", text: "Hola, quería darme de baja del servicio premium." },
    { speakerKey: "agent",  text: "Antes de proceder, ¿podría preguntarle el motivo? Quizás podamos ofrecerle una alternativa." },
    { speakerKey: "client", text: "Es por precio, los últimos meses he usado muy poco la plataforma." },
    { speakerKey: "agent",  text: "Le entiendo. ¿Sabe que tenemos un plan reducido al 50% para uso esporádico?" },
    { speakerKey: "client", text: "No lo conocía. ¿Qué incluye exactamente?" },
    { speakerKey: "agent",  text: "Las mismas funcionalidades pero con un cupo mensual de 20 horas." },
    { speakerKey: "client", text: "Eso me cuadraría perfecto. ¿Cuándo se aplicaría el cambio?" },
    { speakerKey: "agent",  text: "A partir del próximo periodo de facturación. Le mando el cambio por email para que confirme." },
    { speakerKey: "client", text: "Estupendo, gracias por la sugerencia." },
  ],
];

const labelFor = (
  speakerKey: "agent" | "client",
  channel: Conversation["channel"],
  origin: string,
) => {
  if (channel === "chat") {
    // Chats: alternate "Speaker 1" / "Speaker 2" since they don't have an audio agent role.
    return speakerKey === "agent" ? "Speaker 1" : "Speaker 2";
  }
  // Calls: prefer the agent name when the origin looks like a person.
  const looksLikePerson = /[a-zA-Z]/.test(origin) && !/^\d/.test(origin);
  if (speakerKey === "agent") return looksLikePerson ? origin : "Agente";
  return "Cliente";
};

const hashString = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};

const formatTime = (totalSeconds: number) => {
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const ss = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
};

const parseDuration = (dur?: string) => {
  if (!dur) return 180;
  const parts = dur.split(":").map((p) => parseInt(p, 10) || 0);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 180;
};

/**
 * Returns a new transcription array for the conversation. Deterministic
 * per `conversation.id`: the same id always yields the same dialogue.
 */
export function generateTranscriptionFor(
  conversation: Conversation,
): TranscriptionLine[] {
  const seed = hashString(conversation.id);
  const dialogue = dialogues[seed % dialogues.length];

  // Spread the lines evenly across the call duration, with a small
  // pseudo-random jitter so timestamps don't look mechanical.
  const totalSec = Math.max(60, parseDuration(conversation.duration));
  const step = totalSec / (dialogue.length + 1);

  return dialogue.map((line, idx) => {
    const jitter = ((seed + idx * 13) % 7) - 3; // -3..+3 seconds
    const time = Math.max(0, Math.round((idx + 1) * step + jitter));
    return {
      time: formatTime(time),
      speaker: labelFor(line.speakerKey, conversation.channel, conversation.origin),
      text: line.text,
    };
  });
}
