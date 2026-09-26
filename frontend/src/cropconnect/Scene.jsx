import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html, Line, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { LAYOUT, getPos, COMPONENTS, CABLES, HOME_CAMERA } from './data';
import { PART_GEOMETRY, Wire, Soil, Pole, Pipe, Plants } from './parts';

const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

const EXTERNAL_LABELS = {
  solar: 'SOLAR PANEL', dht22: 'DHT22', npk: 'NPK', ph: 'pH',
  moisture1: 'MOISTURE Z1', moisture2: 'MOISTURE Z2', moisture3: 'MOISTURE Z3',
  rain: 'RAIN', waterlevel: 'WATER LEVEL', flow: 'FLOW', sim: '4G ANTENNA',
};

/* ---------- highlight halo ---------- */
function Halo({ color }) {
  const ref = useRef();
  useFrame((s) => {
    if (!ref.current) return;
    const p = 1 + Math.sin(s.clock.elapsedTime * 3) * 0.08;
    ref.current.scale.set(p, p, p);
  });
  return (
    <Billboard>
      <mesh ref={ref}>
        <ringGeometry args={[0.62, 0.72, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
    </Billboard>
  );
}

/* ---------- selectable part ---------- */
function Selectable({ id, position, rotation, selected, onSelect, showLabel }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const Geo = PART_GEOMETRY[id];
  const info = COMPONENTS[id];
  const clickable = !!info;

  useFrame(() => {
    if (!ref.current) return;
    const t = selected ? 1.14 : hovered ? 1.05 : 1;
    ref.current.scale.lerp(new THREE.Vector3(t, t, t), 0.16);
  });

  return (
    <group position={position} rotation={rotation || [0, 0, 0]}>
      {selected && <Halo color={info?.color || '#37c871'} />}
      <group
        ref={ref}
        onPointerOver={clickable ? (e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; } : undefined}
        onPointerOut={clickable ? () => { setHovered(false); document.body.style.cursor = 'auto'; } : undefined}
        onClick={clickable ? (e) => { e.stopPropagation(); onSelect(id); } : undefined}
      >
        <Geo />
      </group>

      {clickable && (showLabel || hovered || selected) && (
        <Html center distanceFactor={9} position={[0, 0.55, 0]} zIndexRange={[20, 0]} pointerEvents="none">
          <div className={`cc-tag ${selected ? 'cc-tag-active' : ''}`}>{EXTERNAL_LABELS[id] || info.name}</div>
        </Html>
      )}

      {selected && info && (
        <Html center distanceFactor={7} position={[0, -0.75, 0]} zIndexRange={[30, 0]} pointerEvents="none">
          <div className="cc-callout" style={{ borderColor: info.color }}>
            <div className="cc-callout-name">{info.name}</div>
            <div className="cc-callout-role">{info.role}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

/* ---------- connection lines ---------- */
function ConnLine({ a, b, color }) {
  const ref = useRef();
  const ax = a[0], ay = a[1], az = a[2];
  const bx = b[0], by = b[1], bz = b[2];
  const pts = useMemo(() => {
    const s = new THREE.Vector3(ax, ay, az);
    const e = new THREE.Vector3(bx, by, bz);
    const m = s.clone().add(e).multiplyScalar(0.5);
    m.y += 0.6;
    return new THREE.QuadraticBezierCurve3(s, m, e).getPoints(32);
  }, [ax, ay, az, bx, by, bz]);
  useFrame(() => { if (ref.current?.material) ref.current.material.dashOffset -= 0.03; });
  return <Line ref={ref} points={pts} color={color} lineWidth={3} dashed dashSize={0.16} gapSize={0.1} transparent opacity={0.95} />;
}

function ConnectionLines({ activeId, factor }) {
  const info = COMPONENTS[activeId];
  if (!info || !info.connectsTo.length) return null;
  const a = getPos(activeId, factor);
  return info.connectsTo.map((tid) => (
    <ConnLine key={tid} a={a} b={getPos(tid, factor)} color={info.color} />
  ));
}

/* ---------- camera rig ---------- */
function CameraRig({ controls, camTarget, camSignal, camApiRef }) {
  const { camera } = useThree();
  const anim = useRef(null);

  useEffect(() => {
    if (camApiRef) {
      camApiRef.current = () => ({
        position: camera.position.toArray(),
        target: controls.current ? controls.current.target.toArray() : HOME_CAMERA.target,
      });
    }
  }, [camApiRef, camera, controls]);

  useEffect(() => { if (camSignal > 0) anim.current = { t: 0 }; }, [camSignal]);

  useFrame((_, dt) => {
    if (!anim.current) return;
    anim.current.t = Math.min(1, anim.current.t + dt * 1.8);
    const dest = camTarget || HOME_CAMERA;
    camera.position.lerp(V(dest.position), 0.14);
    if (controls.current) {
      controls.current.target.lerp(V(dest.target), 0.14);
      controls.current.update();
    }
    if (anim.current.t >= 1) anim.current = null;
  });
  return null;
}

/* ---------- full scene ---------- */
export default function Scene({ explodeFactor, selectedId, onSelect, showConnections, camTarget, camSignal, camApiRef, showLabels }) {
  const controls = useRef();
  const f = explodeFactor;

  const partIds = Object.keys(LAYOUT);

  // internal jumper wires (esp32 -> boards) and power
  const internalWires = [
    { to: 'sim', color: '#c0c4c9' },
    { to: 'max485', color: '#ffb43b' },
    { to: 'relay', color: '#ff6b6b' },
    { to: 'buck', color: '#c58bff' },
  ];

  return (
    <>
      <color attach="background" args={['#f3f6f4']} />
      <hemisphereLight intensity={0.55} groundColor="#8a7a63" color="#ffffff" />
      <directionalLight
        position={[5, 8, 4]} intensity={1.5} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8} shadow-camera-right={8}
        shadow-camera-top={8} shadow-camera-bottom={-8}
      />
      <directionalLight position={[-4, 3, -3]} intensity={0.4} />
      <directionalLight position={[0, 5, -6]} intensity={0.3} />

      <Soil />
      <Pole />
      <Pipe />
      <Plants />

      {/* all parts */}
      {partIds.map((id) => (
        <Selectable
          key={id}
          id={id}
          position={getPos(id, f)}
          rotation={LAYOUT[id].rot}
          selected={selectedId === id}
          onSelect={onSelect}
          showLabel={showLabels && !!EXTERNAL_LABELS[id]}
        />
      ))}

      {/* external sensor cables */}
      {CABLES.map((c, i) => (
        <Wire key={i} start={c.gland} end={[getPos(c.to, f)[0], getPos(c.to, f)[1] + 0.42, getPos(c.to, f)[2]]} color={c.color} radius={0.017} sag={0.28} />
      ))}
      {/* solar power cable */}
      <Wire start={[0, 2.2, -0.35]} end={getPos('buck', f)} color="#e05555" radius={0.02} sag={0.15} />
      {/* internal jumper wires */}
      {internalWires.map((w, i) => (
        <Wire key={i} start={getPos('esp32', f)} end={getPos(w.to, f)} color={w.color} radius={0.012} sag={0.12} />
      ))}
      {/* relay -> flow (pump path) */}
      <Wire start={getPos('relay', f)} end={getPos('flow', f)} color="#ff8a3b" radius={0.016} sag={0.2} />

      {showConnections && selectedId && <ConnectionLines activeId={selectedId} factor={f} />}

      <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={14} blur={2.2} far={6} />

      <OrbitControls
        ref={controls}
        target={HOME_CAMERA.target}
        enablePan
        enableDamping
        dampingFactor={0.08}
        touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
        minDistance={2.5}
        maxDistance={16}
        maxPolarAngle={Math.PI / 2.05}
      />
      <CameraRig controls={controls} camTarget={camTarget} camSignal={camSignal} camApiRef={camApiRef} />
    </>
  );
}
