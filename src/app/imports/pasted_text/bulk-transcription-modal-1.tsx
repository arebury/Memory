Update BulkTranscriptionModal in the prototype. Replace the existing 
component entirely with the following specification. Preserve all 
existing visual tokens, spacing, and component patterns from the 
codebase — do not introduce new styles.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The modal opens when the user clicks the transcription icon button 
in the toolbar. That button is enabled only when selectedIds.length 
>= 1. Remove the old BulkActionBar strip entirely — the icon button 
in the toolbar is the only entry point.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DATA MODEL — compute from selectedConversations
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const calls = selectedConversations.filter(c => c.channel === 'llamada');
const chats = selectedConversations.filter(c => c.channel === 'chat');

// Calls breakdown
const callsToTranscribe      = calls.filter(c => c.hasRecording && !c.hasTranscription);
const callsAlreadyTranscribed = calls.filter(c => c.hasTranscription);
const callsEligibleAnalysis  = callsAlreadyTranscribed.filter(c => !c.hasAnalysis);
const callsAlreadyAnalyzed   = callsAlreadyTranscribed.filter(c => c.hasAnalysis);

// Chats breakdown
const chatsEligibleAnalysis  = chats.filter(c => !c.hasAnalysis);
const chatsAlreadyAnalyzed   = chats.filter(c => c.hasAnalysis);

// Three row values — no overlap, always sum to total selected
const nTranscribe = callsToTranscribe.length;
const nAnalyze    = callsEligibleAnalysis.length + chatsEligibleAnalysis.length;
const nDone       = callsAlreadyAnalyzed.length  + chatsAlreadyAnalyzed.length;

// Toggle auto-lock: when nothing to transcribe, analysis is the only action
const analysisOnly = nTranscribe === 0 && nAnalyze > 0;

Add hasAnalysis?: boolean to the Conversation type if not present.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODAL STRUCTURE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Header:
  Title: "Transcribir y analizar"
  Subtitle: "{total} conversaciones seleccionadas"
  Close button (X)

Body (flex column, gap 12px):
  1. Toggle
  2. Breakdown (3 rows)
  3. Warning slot

Footer:
  Left: Cancelar button
  Right: Primary action button (dynamic label)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOGGLE — "Incluir análisis"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Default state: OFF
Exception: when analysisOnly === true, toggle starts ON and is 
non-interactive (locked). User cannot turn it off.

Description text:
  - Normal: "Resumen y sentimiento"
  - Locked: "Todas las llamadas ya están transcritas"

Do not show the toggle in C1 (all already done, nTranscribe === 0 
AND nAnalyze === 0).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BREAKDOWN — 3 fixed rows
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the existing breakdown card pattern with border and border-radius.
Three rows always in the DOM. Never add or remove rows dynamically.
Use only opacity and transform transitions — never height or display.

Each row contains:
  [icon] [label + sublabel] [channel tags] [count]

Row heights are fixed. All three rows always reserve their space.

── ROW 1: Transcribir ──

Icon: FileText (Lucide)
Label: "Transcribir"
Sublabel: none (empty, space reserved for layout stability)
Channel tag: [Phone icon + "Llamadas"] — visible only if nTranscribe > 0
Count: nTranscribe (green, large weight)

Badge "+ análisis":
  Appears inline next to the label when toggle is ON AND nTranscribe > 0.
  Animate with opacity + transform (scale) only.
  Hidden when toggle OFF.

Visibility states (opacity only, never display:none):
  nTranscribe > 0 → opacity: 1 (active)
  nTranscribe === 0 → opacity: 0, pointer-events: none (space reserved)

── ROW 2: Analizar ──

Icon: Sparkles (Lucide)
Label: "Analizar"

Sublabel — THE KEY AFFORDANCE:
  Visible when: nAnalyze > 0 AND toggle is OFF (avail state)
  Text: "Activa análisis para incluirlas"
  Font-size: 11px, color: #6b7280
  Animate with opacity transition only (never height)
  Hidden when toggle ON or nAnalyze === 0

Channel tags:
  Show [Phone icon + "Llamadas"] if callsEligibleAnalysis.length > 0
  Show [Chat icon + "Chat"] if chatsEligibleAnalysis.length > 0

Count: nAnalyze

Visibility states (opacity only):
  nAnalyze > 0 AND toggle ON → opacity: 1, count color: green (active)
  nAnalyze > 0 AND toggle OFF → opacity: 0.55, count: smaller font-size 
    (14px) and muted color (#9ca3af) — reduced weight communicates 
    "available but not selected". Do not use the hero green size here.
  nAnalyze === 0 → opacity: 0, pointer-events: none

── ROW 3: Ya procesadas ──

Icon: CheckCircle2 (Lucide)
Label: "Ya procesadas"
Sublabel: none (empty, space reserved)
Channel tags: none
Count: nDone, always muted color (#9ca3af), smaller font-size (14px)

Visibility states:
  nDone > 0 → opacity: 0.28 (informational, never actionable)
  nDone === 0 → opacity: 0, pointer-events: none

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
C1 — NOTHING TO PROCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Condition: nTranscribe === 0 AND nAnalyze === 0

Show an empty state inside the breakdown card instead of the 3 rows:
  "No hay conversaciones pendientes de procesar."
  color: #9ca3af, centered, font-size 13px

Hide toggle entirely.
Hide warning entirely.
Primary button: disabled, no label.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WARNING SLOT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Always reserve space with min-height so no layout shift occurs when 
warning appears or disappears. Use opacity transition only.

Warning is visible when primary button is enabled.

Dynamic text:
  nTranscribe === 0:
    "{nAnalyze} conversaciones a procesar · genera costes"
  toggle OFF (nTranscribe > 0):
    "{nTranscribe} conversaciones a procesar · genera costes"
  toggle ON (nTranscribe > 0 AND nAnalyze > 0):
    "{nTranscribe + nAnalyze} conversaciones a procesar · genera costes"
  toggle ON (nTranscribe > 0 AND nAnalyze === 0):
    "{nTranscribe} conversaciones a procesar · genera costes"

Style: amber/yellow soft banner, TriangleAlert icon, font-size 12px.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRIMARY BUTTON — dynamic label
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const totalProcessed = nTranscribe + (toggleOn ? nAnalyze : 0);

if C1 (nothing):
  disabled, empty label

else if nTranscribe === 0:
  "Analizar {nAnalyze}"   // C2, C5

else if toggle OFF:
  "Transcribir {nTranscribe}"   // C3off, C4off, C6off

else if nAnalyze === 0:
  "Transcribir {nTranscribe}"   // C3on (analysis bundled, no extra)

else:
  "Procesar {totalProcessed}"   // C4on, C6on

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
onConfirm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pass to parent:
  options: { includeAnalysis: boolean }
  eligibleIds: string[]
    - Always include callsToTranscribe IDs
    - If toggle ON: also include callsEligibleAnalysis and 
      chatsEligibleAnalysis IDs

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANIMATION RULES — no exceptions
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Only use: transition on opacity and transform.
Never animate: height, top, display, max-height, width.
All dynamic content (sublabel, badge, warning) must have reserved 
space before it appears so the modal never shifts layout.