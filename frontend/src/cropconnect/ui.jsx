import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, Share2, Workflow, RotateCcw, Tag, HelpCircle, Save,
  FolderOpen, X, Trash2, Plus, Cpu, ArrowRight, Boxes,
} from 'lucide-react';
import { SYSTEM_FLOW, HOW_IT_WORKS, COMPONENTS } from './data';

/* ---------------- top toolbar ---------------- */
export function Toolbar(props) {
  const {
    exploded, onToggleExplode, showConnections, onToggleConnections,
    showFlow, onToggleFlow, showLabels, onToggleLabels, onReset,
    showHow, onToggleHow, onOpenSave, onOpenViews,
  } = props;

  const Btn = ({ active, onClick, icon: Icon, label, primary, testid }) => (
    <button
      data-testid={testid}
      onClick={onClick}
      className={`cc-btn ${active ? 'cc-btn-active' : ''} ${primary ? 'cc-btn-primary' : ''}`}
    >
      <Icon size={15} strokeWidth={2.2} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="cc-toolbar" data-testid="toolbar">
      <Btn testid="btn-explode" primary active={exploded} onClick={onToggleExplode} icon={Layers}
        label={exploded ? 'COLLAPSE SYSTEM' : 'EXPLODE SYSTEM'} />
      <Btn testid="btn-connections" active={showConnections} onClick={onToggleConnections} icon={Share2} label="SHOW CONNECTIONS" />
      <Btn testid="btn-flow" active={showFlow} onClick={onToggleFlow} icon={Workflow} label="SHOW SYSTEM FLOW" />
      <div className="cc-toolbar-sep" />
      <Btn testid="btn-labels" active={showLabels} onClick={onToggleLabels} icon={Tag} label="LABELS" />
      <Btn testid="btn-how" active={showHow} onClick={onToggleHow} icon={HelpCircle} label="HOW IT WORKS" />
      <Btn testid="btn-reset" onClick={onReset} icon={RotateCcw} label="RESET VIEW" />
      <div className="cc-toolbar-sep" />
      <Btn testid="btn-save" onClick={onOpenSave} icon={Save} label="SAVE VIEW" />
      <Btn testid="btn-views" onClick={onOpenViews} icon={FolderOpen} label="SAVED VIEWS" />
    </div>
  );
}

/* ---------------- component info panel ---------------- */
export function InfoPanel({ id, showConnections, onToggleConnections, onClose, notes, onAddNote, onDeleteNote }) {
  const [text, setText] = useState('');
  const comp = id ? COMPONENTS[id] : null;

  return (
    <AnimatePresence mode="wait">
      {comp ? (
        <motion.aside
          key={id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="cc-panel"
          data-testid="info-panel"
        >
          <div className="cc-panel-accent" style={{ background: comp.color }} />
          <button className="cc-panel-close" onClick={onClose} data-testid="info-close"><X size={16} /></button>

          <div className="cc-panel-head">
            <span className="cc-panel-kicker" style={{ color: comp.color }}>{comp.subtitle}</span>
            <h2 className="cc-panel-title" data-testid="info-name">{comp.name}</h2>
            <div className="cc-panel-role">{comp.role}</div>
          </div>

          <div className="cc-panel-section">
            <h3>Purpose</h3>
            <p>{comp.purpose}</p>
          </div>

          {comp.inputs?.length > 0 && (
            <div className="cc-panel-section">
              <h3>Inputs</h3>
              <div className="cc-chips">{comp.inputs.map((x) => <span key={x} className="cc-chip">{x}</span>)}</div>
            </div>
          )}

          {comp.outputs?.length > 0 && (
            <div className="cc-panel-section">
              <h3>Outputs</h3>
              <div className="cc-chips">{comp.outputs.map((x) => <span key={x} className="cc-chip cc-chip-out">{x}</span>)}</div>
            </div>
          )}

          {comp.connectsTo?.length > 0 && (
            <div className="cc-panel-section">
              <div className="cc-connects-head">
                <h3>Connects To</h3>
                <button className={`cc-mini-btn ${showConnections ? 'on' : ''}`} onClick={onToggleConnections} data-testid="info-toggle-connections">
                  <Share2 size={12} /> {showConnections ? 'Hide' : 'Highlight'}
                </button>
              </div>
              <div className="cc-connects">
                {comp.connectsTo.map((cid) => (
                  <span key={cid} className="cc-connect-node">{COMPONENTS[cid]?.name || cid}</span>
                ))}
              </div>
            </div>
          )}

          <div className="cc-panel-section">
            <h3>Field Notes</h3>
            <div className="cc-note-input">
              <input
                data-testid="note-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && text.trim()) { onAddNote(text.trim()); setText(''); } }}
                placeholder="Add a note for this component…"
              />
              <button data-testid="note-add" onClick={() => { if (text.trim()) { onAddNote(text.trim()); setText(''); } }}><Plus size={15} /></button>
            </div>
            <div className="cc-note-list">
              {notes.length === 0 && <div className="cc-note-empty">No notes yet.</div>}
              {notes.map((n) => (
                <div key={n.id} className="cc-note-item" data-testid="note-item">
                  <span>{n.text}</span>
                  <button onClick={() => onDeleteNote(n.id)}><Trash2 size={13} /></button>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      ) : (
        <motion.aside
          key="empty"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          className="cc-panel cc-panel-empty"
          data-testid="info-panel-empty"
        >
          <Cpu size={30} strokeWidth={1.5} />
          <h2>Select a component</h2>
          <p>Click any part of the CropConnect field unit to inspect its role, connections and place in the system.</p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/* ---------------- system flow overlay ---------------- */
export function FlowOverlay({ open }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }} className="cc-flow" data-testid="flow-overlay"
        >
          <div className="cc-flow-head"><Workflow size={15} /> SYSTEM FLOW</div>
          {SYSTEM_FLOW.map((step, i) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }} className="cc-flow-step"
            >
              <span className="cc-flow-dot" />
              <span className="cc-flow-label">{step}</span>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- how it works ---------------- */
export function HowItWorks({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
          className="cc-how" data-testid="how-panel"
        >
          <div className="cc-how-head">
            <span><Boxes size={15} /> HOW THIS UNIT WORKS</span>
            <button onClick={onClose}><X size={15} /></button>
          </div>
          <ol>
            {HOW_IT_WORKS.map((s, i) => (
              <li key={i}><span className="cc-how-num">{i + 1}</span>{s}</li>
            ))}
          </ol>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- save dialog ---------------- */
export function SaveDialog({ open, onClose, onSave }) {
  const [name, setName] = useState('');
  const [notes, setNotes] = useState('');
  if (!open) return null;
  return (
    <div className="cc-modal-backdrop" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="cc-modal" onClick={(e) => e.stopPropagation()} data-testid="save-dialog">
        <div className="cc-modal-head"><Save size={16} /> Save Current View<button onClick={onClose}><X size={16} /></button></div>
        <input data-testid="save-name" className="cc-input" placeholder="View name (e.g. Exploded — ESP32 focus)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <textarea data-testid="save-notes" className="cc-input" rows={3} placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button data-testid="save-confirm" className="cc-btn cc-btn-primary cc-modal-save" disabled={!name.trim()} onClick={() => { onSave(name.trim(), notes); setName(''); setNotes(''); }}>
          Save View
        </button>
      </motion.div>
    </div>
  );
}

/* ---------------- saved views drawer ---------------- */
export function SavedViews({ open, views, onClose, onApply, onDelete }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="cc-modal-backdrop" onClick={onClose}>
          <motion.div initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} className="cc-drawer" onClick={(e) => e.stopPropagation()} data-testid="views-drawer">
            <div className="cc-modal-head"><FolderOpen size={16} /> Saved Views<button onClick={onClose}><X size={16} /></button></div>
            <div className="cc-views-list">
              {views.length === 0 && <div className="cc-note-empty">No saved views yet.</div>}
              {views.map((v) => (
                <div key={v.id} className="cc-view-item" data-testid="view-item">
                  <button className="cc-view-apply" onClick={() => onApply(v)}>
                    <span className="cc-view-name">{v.name}</span>
                    <span className="cc-view-meta">
                      {v.selectedId ? (COMPONENTS[v.selectedId]?.name || v.selectedId) : 'Overview'} · {v.explodeFactor > 0.5 ? 'Exploded' : 'Assembled'}
                    </span>
                    {v.notes ? <span className="cc-view-notes">{v.notes}</span> : null}
                    <ArrowRight size={14} className="cc-view-go" />
                  </button>
                  <button className="cc-view-del" onClick={() => onDelete(v.id)} data-testid="view-delete"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- brand header ---------------- */
export function Brand() {
  return (
    <div className="cc-brand" data-testid="brand">
      <div className="cc-brand-mark"><Cpu size={18} strokeWidth={2.4} /></div>
      <div>
        <div className="cc-brand-name">CROPCONNECT</div>
        <div className="cc-brand-sub">Smart Farming IoT · Field Unit</div>
      </div>
    </div>
  );
}
