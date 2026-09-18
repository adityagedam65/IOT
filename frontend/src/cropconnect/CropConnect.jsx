import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './Scene';
import { Toolbar, InfoPanel, FlowOverlay, HowItWorks, SaveDialog, SavedViews, Brand } from './ui';
import { HOME_CAMERA } from './data';
import * as api from './api';
import { toast, Toaster } from 'sonner';

const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

function useTween(target, duration = 780) {
  const [val, setVal] = useState(target);
  const raf = useRef();
  const from = useRef(target);
  const start = useRef(0);
  const cur = useRef(target);
  useEffect(() => {
    from.current = cur.current;
    start.current = performance.now();
    cancelAnimationFrame(raf.current);
    const step = (now) => {
      const t = Math.min(1, (now - start.current) / duration);
      const k = easeInOut(t);
      const v = from.current + (target - from.current) * k;
      cur.current = v;
      setVal(v);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return val;
}

export default function CropConnect() {
  const [exploded, setExploded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [showConnections, setShowConnections] = useState(false);
  const [showFlow, setShowFlow] = useState(false);
  const [showHow, setShowHow] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  const [camTarget, setCamTarget] = useState(HOME_CAMERA);
  const [camSignal, setCamSignal] = useState(0);
  const camApiRef = useRef(null);

  const [saveOpen, setSaveOpen] = useState(false);
  const [viewsOpen, setViewsOpen] = useState(false);
  const [views, setViews] = useState([]);
  const [notes, setNotes] = useState([]);

  const explodeFactor = useTween(exploded ? 1 : 0);

  const refreshViews = useCallback(() => {
    api.listViews().then(setViews).catch(() => {});
  }, []);
  useEffect(() => { refreshViews(); }, [refreshViews]);

  // notes for the selected component
  useEffect(() => {
    if (!selectedId) { setNotes([]); return; }
    api.listNotes(selectedId).then(setNotes).catch(() => setNotes([]));
  }, [selectedId]);

  const onSelect = (id) => {
    setSelectedId((prev) => (prev === id ? prev : id));
  };

  const resetView = () => {
    setCamTarget(HOME_CAMERA);
    setCamSignal((s) => s + 1);
  };

  const flyTo = (cam) => {
    if (!cam || !cam.position) { resetView(); return; }
    setCamTarget(cam);
    setCamSignal((s) => s + 1);
  };

  const addNote = (text) => {
    api.createNote({ componentId: selectedId, text })
      .then((n) => { setNotes((p) => [n, ...p]); toast.success('Note added'); })
      .catch(() => toast.error('Could not save note'));
  };
  const removeNote = (id) => {
    api.deleteNote(id).then(() => setNotes((p) => p.filter((n) => n.id !== id))).catch(() => {});
  };

  const saveView = (name, viewNotes) => {
    const cam = camApiRef.current ? camApiRef.current() : null;
    api.createView({
      name, camera: cam, explodeFactor: exploded ? 1 : 0,
      selectedId, showConnections, showFlow, notes: viewNotes,
    }).then((v) => {
      setViews((p) => [v, ...p]);
      setSaveOpen(false);
      toast.success('View saved');
    }).catch(() => toast.error('Could not save view'));
  };

  const applyView = (v) => {
    setExploded(v.explodeFactor > 0.5);
    setSelectedId(v.selectedId || null);
    setShowConnections(!!v.showConnections);
    setShowFlow(!!v.showFlow);
    setViewsOpen(false);
    if (v.camera) flyTo(v.camera);
    toast.success(`Loaded "${v.name}"`);
  };

  const deleteViewItem = (id) => {
    api.deleteView(id).then(() => setViews((p) => p.filter((v) => v.id !== id))).catch(() => {});
  };

  return (
    <div className="cc-root" data-testid="cropconnect-app">
      <div className="cc-canvas-wrap" onPointerMissed={() => setSelectedId(null)}>
        <Canvas shadows camera={{ position: HOME_CAMERA.position, fov: 42 }} dpr={[1, 2]} gl={{ antialias: true }}>
          <Scene
            explodeFactor={explodeFactor}
            selectedId={selectedId}
            onSelect={onSelect}
            showConnections={showConnections}
            camTarget={camTarget}
            camSignal={camSignal}
            camApiRef={camApiRef}
            showLabels={showLabels}
          />
        </Canvas>
        <Loader />
      </div>

      <Brand />

      <div className="cc-hint" data-testid="hint">Drag to rotate · Scroll to zoom · Click a component</div>

      <Toolbar
        exploded={exploded}
        onToggleExplode={() => setExploded((e) => !e)}
        showConnections={showConnections}
        onToggleConnections={() => setShowConnections((s) => !s)}
        showFlow={showFlow}
        onToggleFlow={() => setShowFlow((s) => !s)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((s) => !s)}
        onReset={resetView}
        showHow={showHow}
        onToggleHow={() => setShowHow((s) => !s)}
        onOpenSave={() => setSaveOpen(true)}
        onOpenViews={() => { refreshViews(); setViewsOpen(true); }}
      />

      <FlowOverlay open={showFlow} />
      <HowItWorks open={showHow} onClose={() => setShowHow(false)} />

      <InfoPanel
        id={selectedId}
        showConnections={showConnections}
        onToggleConnections={() => setShowConnections((s) => !s)}
        onClose={() => setSelectedId(null)}
        notes={notes}
        onAddNote={addNote}
        onDeleteNote={removeNote}
      />

      <SaveDialog open={saveOpen} onClose={() => setSaveOpen(false)} onSave={saveView} />
      <SavedViews open={viewsOpen} views={views} onClose={() => setViewsOpen(false)} onApply={applyView} onDelete={deleteViewItem} />

      <Toaster position="top-center" richColors />
    </div>
  );
}
