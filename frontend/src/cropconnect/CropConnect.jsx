import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import Scene from './Scene';
import { Toolbar, InfoPanel, FlowOverlay, HowItWorks, Brand } from './ui';
import { HOME_CAMERA } from './data';

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

  const explodeFactor = useTween(exploded ? 1 : 0);

  const onSelect = (id) => {
    setSelectedId((prev) => (prev === id ? prev : id));
  };

  const resetView = () => {
    setCamTarget(HOME_CAMERA);
    setCamSignal((s) => s + 1);
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
      />

      <FlowOverlay open={showFlow} />
      <HowItWorks open={showHow} onClose={() => setShowHow(false)} />

      <InfoPanel
        id={selectedId}
        showConnections={showConnections}
        onToggleConnections={() => setShowConnections((s) => !s)}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
