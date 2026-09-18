import React, { useMemo } from 'react';
import { RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';

const GOLD = '#d8b45a';

/* ---------- shared helpers ---------- */
function Screw({ position = [0, 0, 0], r = 0.045, axis = 'z', color = '#9aa0a8' }) {
  const rot = axis === 'z' ? [Math.PI / 2, 0, 0] : axis === 'x' ? [0, 0, Math.PI / 2] : [0, 0, 0];
  return (
    <group position={position}>
      <mesh rotation={rot}>
        <cylinderGeometry args={[r, r, 0.035, 16]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.35} />
      </mesh>
    </group>
  );
}

function PinRow({ count = 8, spacing = 0.06, position = [0, 0, 0], vertical = false }) {
  const pins = [];
  for (let i = 0; i < count; i++) {
    const off = (i - (count - 1) / 2) * spacing;
    pins.push(
      <mesh key={i} position={vertical ? [0, off, 0] : [off, 0, 0]}>
        <boxGeometry args={[0.028, 0.028, 0.08]} />
        <meshStandardMaterial color={GOLD} metalness={0.85} roughness={0.3} />
      </mesh>
    );
  }
  return (
    <group position={position}>
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={vertical ? [0.05, count * spacing + 0.02, 0.05] : [count * spacing + 0.02, 0.05, 0.05]} />
        <meshStandardMaterial color="#0d0f12" roughness={0.7} />
      </mesh>
      {pins}
    </group>
  );
}

const boardMat = (color, metal = 0.1, rough = 0.55) => (
  <meshStandardMaterial color={color} metalness={metal} roughness={rough} />
);

/* ---------- ENCLOSURE BODY ---------- */
export function Body() {
  const wall = '#22392c';
  const glands = [-0.7, -0.5, -0.3, 0.1, 0.3, 0.5, 0.85];
  return (
    <group>
      {/* back panel */}
      <RoundedBox args={[2.24, 1.52, 0.08]} radius={0.06} smoothness={4} position={[0, 0, -0.42]}>
        {boardMat('#1c3125')}
      </RoundedBox>
      {/* rim walls */}
      <RoundedBox args={[2.24, 0.14, 0.9]} radius={0.04} position={[0, 0.7, 0]}>{boardMat(wall)}</RoundedBox>
      <RoundedBox args={[2.24, 0.14, 0.9]} radius={0.04} position={[0, -0.7, 0]}>{boardMat(wall)}</RoundedBox>
      <RoundedBox args={[0.14, 1.42, 0.9]} radius={0.04} position={[-1.06, 0, 0]}>{boardMat(wall)}</RoundedBox>
      <RoundedBox args={[0.14, 1.42, 0.9]} radius={0.04} position={[1.06, 0, 0]}>{boardMat(wall)}</RoundedBox>
      {/* mounting flanges */}
      <mesh position={[-1.2, 0, -0.2]}><boxGeometry args={[0.22, 1.6, 0.1]} />{boardMat('#18271e')}</mesh>
      <mesh position={[1.2, 0, -0.2]}><boxGeometry args={[0.22, 1.6, 0.1]} />{boardMat('#18271e')}</mesh>
      <Screw position={[-1.2, 0.65, -0.14]} r={0.05} color="#6f757c" />
      <Screw position={[-1.2, -0.65, -0.14]} r={0.05} color="#6f757c" />
      <Screw position={[1.2, 0.65, -0.14]} r={0.05} color="#6f757c" />
      <Screw position={[1.2, -0.65, -0.14]} r={0.05} color="#6f757c" />
      {/* cable glands on bottom */}
      {glands.map((x, i) => (
        <group key={i} position={[x, -0.78, 0.32]}>
          <mesh><cylinderGeometry args={[0.062, 0.062, 0.09, 6]} /><meshStandardMaterial color="#0b0d10" roughness={0.6} /></mesh>
          <mesh position={[0, -0.08, 0]}><cylinderGeometry args={[0.04, 0.04, 0.09, 12]} /><meshStandardMaterial color="#0b0d10" roughness={0.6} /></mesh>
        </group>
      ))}
    </group>
  );
}

/* ---------- ENCLOSURE LID ---------- */
export function Lid() {
  return (
    <group>
      <RoundedBox args={[2.2, 1.48, 0.06]} radius={0.06} smoothness={4}>
        {boardMat('#274632')}
      </RoundedBox>
      {/* raised inner panel */}
      <RoundedBox args={[1.9, 1.2, 0.02]} radius={0.04} position={[0, 0, 0.035]}>{boardMat('#2f5540')}</RoundedBox>
      {/* corner screws */}
      {[[-0.98, 0.62], [0.98, 0.62], [-0.98, -0.62], [0.98, -0.62]].map(([x, y], i) => (
        <Screw key={i} position={[x, y, 0.04]} r={0.05} color="#c7ccd2" />
      ))}
      <Text position={[0, 0.15, 0.05]} fontSize={0.15} color="#eafff2" anchorX="center" anchorY="middle" letterSpacing={0.06}>
        CROPCONNECT
      </Text>
      <Text position={[0, -0.02, 0.05]} fontSize={0.062} color="#7fe0a5" anchorX="center" anchorY="middle" letterSpacing={0.12}>
        SMART FARMING IoT FIELD UNIT
      </Text>
      {/* status LED */}
      <mesh position={[0.6, -0.4, 0.05]}><cylinderGeometry args={[0.03, 0.03, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#37c871" emissive="#37c871" emissiveIntensity={1.4} /></mesh>
    </group>
  );
}

/* ---------- MOUNTING PLATE ---------- */
export function Plate() {
  return (
    <group>
      <RoundedBox args={[2.0, 1.32, 0.04]} radius={0.03} smoothness={3}>
        <meshStandardMaterial color="#b6bcc3" metalness={0.7} roughness={0.4} />
      </RoundedBox>
      {[[-0.85, 0.55], [0.85, 0.55], [-0.85, -0.55], [0.85, -0.55]].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.06]}><cylinderGeometry args={[0.04, 0.04, 0.1, 10]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#7d838a" metalness={0.7} roughness={0.4} /></mesh>
      ))}
    </group>
  );
}

/* ---------- SOLAR PANEL ---------- */
export function Solar() {
  const cells = useMemo(() => {
    const arr = [];
    const cols = 6, rows = 3;
    const w = 1.78, d = 0.92;
    const cw = w / cols, cd = d / rows;
    for (let c = 0; c < cols; c++)
      for (let r = 0; r < rows; r++)
        arr.push([(c - (cols - 1) / 2) * cw, (r - (rows - 1) / 2) * cd]);
    return { arr, cw, cd };
  }, []);
  return (
    <group>
      {/* aluminium frame */}
      <RoundedBox args={[2.02, 0.07, 1.12]} radius={0.02} position={[0, 0, 0]}>
        <meshStandardMaterial color="#c2c7cd" metalness={0.85} roughness={0.35} />
      </RoundedBox>
      {/* dark laminate under cells */}
      <mesh position={[0, 0.04, 0]}><boxGeometry args={[1.92, 0.015, 1.0]} /><meshStandardMaterial color="#0a1622" roughness={0.4} /></mesh>
      {/* solar cells */}
      {cells.arr.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.052, z]}>
          <boxGeometry args={[cells.cw * 0.9, 0.006, cells.cd * 0.9]} />
          <meshStandardMaterial color="#122e52" metalness={0.5} roughness={0.25} emissive="#0a1e3a" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* mounting posts to enclosure */}
      <mesh position={[-0.6, -0.28, -0.45]}><boxGeometry args={[0.07, 0.5, 0.07]} /><meshStandardMaterial color="#8a8f96" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[0.6, -0.28, -0.45]}><boxGeometry args={[0.07, 0.5, 0.07]} /><meshStandardMaterial color="#8a8f96" metalness={0.7} roughness={0.4} /></mesh>
      {/* junction box + wire */}
      <mesh position={[0, -0.06, -0.4]}><boxGeometry args={[0.24, 0.08, 0.14]} /><meshStandardMaterial color="#111" roughness={0.6} /></mesh>
    </group>
  );
}

/* ---------- ESP32 DEVKIT ---------- */
export function ESP32() {
  return (
    <group>
      <RoundedBox args={[0.52, 0.98, 0.045]} radius={0.02}>{boardMat('#171b21')}</RoundedBox>
      {/* metal shield module */}
      <mesh position={[0, 0.3, 0.05]}><boxGeometry args={[0.34, 0.34, 0.05]} /><meshStandardMaterial color="#c7ccd2" metalness={0.9} roughness={0.28} /></mesh>
      {/* PCB antenna */}
      <mesh position={[0, 0.47, 0.03]}><boxGeometry args={[0.28, 0.1, 0.008]} /><meshStandardMaterial color={GOLD} metalness={0.7} roughness={0.3} /></mesh>
      {/* USB connector */}
      <mesh position={[0, -0.52, 0.02]}><boxGeometry args={[0.16, 0.1, 0.11]} /><meshStandardMaterial color="#b9bec5" metalness={0.85} roughness={0.3} /></mesh>
      {/* chip / regulator */}
      <mesh position={[0, -0.05, 0.04]}><boxGeometry args={[0.14, 0.14, 0.04]} /><meshStandardMaterial color="#0b0d10" roughness={0.6} /></mesh>
      {/* buttons */}
      <mesh position={[-0.12, -0.34, 0.04]}><boxGeometry args={[0.06, 0.06, 0.04]} /><meshStandardMaterial color="#2a2f36" /></mesh>
      <mesh position={[0.12, -0.34, 0.04]}><boxGeometry args={[0.06, 0.06, 0.04]} /><meshStandardMaterial color="#2a2f36" /></mesh>
      {/* pin headers on both sides */}
      <PinRow count={15} spacing={0.055} vertical position={[-0.24, -0.02, 0.05]} />
      <PinRow count={15} spacing={0.055} vertical position={[0.24, -0.02, 0.05]} />
      {/* power LED */}
      <mesh position={[0.1, 0.02, 0.05]}><boxGeometry args={[0.03, 0.03, 0.02]} /><meshStandardMaterial color="#ff4d4d" emissive="#ff2d2d" emissiveIntensity={1.2} /></mesh>
    </group>
  );
}

/* ---------- SIM A7670C ---------- */
export function SIM() {
  return (
    <group>
      <RoundedBox args={[0.64, 0.8, 0.045]} radius={0.02}>{boardMat('#12324f')}</RoundedBox>
      {/* module IC / shield */}
      <mesh position={[-0.06, 0.06, 0.05]}><boxGeometry args={[0.34, 0.34, 0.06]} /><meshStandardMaterial color="#1c1f24" metalness={0.5} roughness={0.5} /></mesh>
      <Text position={[-0.06, 0.06, 0.085]} fontSize={0.045} color="#8fb7d8" anchorX="center" anchorY="middle">A7670C</Text>
      {/* SIM card holder */}
      <mesh position={[0.2, 0.22, 0.05]}><boxGeometry args={[0.2, 0.16, 0.05]} /><meshStandardMaterial color="#c7ccd2" metalness={0.85} roughness={0.3} /></mesh>
      {/* u.FL antenna connector */}
      <mesh position={[0.24, -0.12, 0.05]}><cylinderGeometry args={[0.03, 0.03, 0.05, 12]} /><meshStandardMaterial color={GOLD} metalness={0.9} roughness={0.25} /></mesh>
      {/* power input pads */}
      <mesh position={[-0.2, -0.3, 0.05]}><boxGeometry args={[0.16, 0.06, 0.03]} /><meshStandardMaterial color="#0d0f12" /></mesh>
      <PinRow count={8} spacing={0.052} position={[0, -0.36, 0.05]} />
    </group>
  );
}

/* ---------- MAX485 ---------- */
export function MAX485() {
  return (
    <group>
      <RoundedBox args={[0.36, 0.5, 0.04]} radius={0.015}>{boardMat('#0a4a86')}</RoundedBox>
      <mesh position={[0, 0.02, 0.04]}><boxGeometry args={[0.16, 0.1, 0.04]} /><meshStandardMaterial color="#111" roughness={0.6} /></mesh>
      <PinRow count={4} spacing={0.05} position={[0, 0.19, 0.04]} />
      <PinRow count={4} spacing={0.05} position={[0, -0.19, 0.04]} />
    </group>
  );
}

/* ---------- RELAY MODULE ---------- */
export function Relay() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.44, 0.04]} radius={0.015}>{boardMat('#0a63b0')}</RoundedBox>
      {/* relay can */}
      <mesh position={[0.12, 0, 0.13]}><boxGeometry args={[0.26, 0.2, 0.22]} /><meshStandardMaterial color="#1f74d6" roughness={0.4} /></mesh>
      {/* green terminal block */}
      <mesh position={[-0.2, 0, 0.09]}><boxGeometry args={[0.14, 0.3, 0.14]} /><meshStandardMaterial color="#0b7a3b" roughness={0.5} /></mesh>
      {/* opto + LED */}
      <mesh position={[-0.02, 0.14, 0.05]}><boxGeometry args={[0.04, 0.04, 0.02]} /><meshStandardMaterial color="#ff4d4d" emissive="#ff2d2d" emissiveIntensity={1.2} /></mesh>
      <PinRow count={4} spacing={0.05} position={[0.05, -0.19, 0.04]} />
    </group>
  );
}

/* ---------- BUCK CONVERTER ---------- */
export function Buck() {
  return (
    <group>
      <RoundedBox args={[0.46, 0.32, 0.035]} radius={0.012}>{boardMat('#0a63b0')}</RoundedBox>
      {/* inductor */}
      <mesh position={[0.1, 0.03, 0.07]}><cylinderGeometry args={[0.07, 0.07, 0.08, 16]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#111" roughness={0.6} /></mesh>
      {/* IC */}
      <mesh position={[-0.08, 0.02, 0.04]}><boxGeometry args={[0.08, 0.08, 0.03]} /><meshStandardMaterial color="#0d0f12" /></mesh>
      {/* trimpot */}
      <mesh position={[-0.14, -0.06, 0.05]}><boxGeometry args={[0.07, 0.07, 0.05]} /><meshStandardMaterial color="#2a54c0" /></mesh>
      {/* electrolytic caps */}
      <mesh position={[0.14, -0.06, 0.06]}><cylinderGeometry args={[0.035, 0.035, 0.08, 12]} rotation={[Math.PI / 2, 0, 0]} /><meshStandardMaterial color="#12223a" /></mesh>
    </group>
  );
}

/* ---------- DHT22 (with vented housing) ---------- */
export function DHT22() {
  return (
    <group>
      {/* radiation-shield louvers */}
      {[-0.14, -0.06, 0.02, 0.1].map((y, i) => (
        <mesh key={i} position={[0, y, -0.02]} rotation={[-0.35, 0, 0]}>
          <boxGeometry args={[0.34, 0.02, 0.22]} />
          <meshStandardMaterial color="#e9edf1" roughness={0.7} />
        </mesh>
      ))}
      {/* white DHT22 body */}
      <RoundedBox args={[0.22, 0.34, 0.1]} radius={0.02} position={[0, 0, 0.06]}>
        <meshStandardMaterial color="#f2f4f6" roughness={0.6} />
      </RoundedBox>
      {/* vent grid */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.02, 0.115]}><boxGeometry args={[0.02, 0.22, 0.01]} /><meshStandardMaterial color="#cfd4d9" /></mesh>
      ))}
      {/* pins */}
      <PinRow count={4} spacing={0.045} position={[0, -0.2, 0.06]} />
    </group>
  );
}

/* ---------- NPK PROBE ---------- */
export function NPK() {
  return (
    <group>
      {/* stainless body */}
      <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[0.06, 0.06, 0.8, 20]} /><meshStandardMaterial color="#c2c7cd" metalness={0.85} roughness={0.3} /></mesh>
      {/* sensing band */}
      <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.063, 0.063, 0.12, 20]} /><meshStandardMaterial color="#7f858c" metalness={0.6} roughness={0.5} /></mesh>
      {/* pointed tip */}
      <mesh position={[0, -0.42, 0]}><coneGeometry args={[0.06, 0.16, 20]} /><meshStandardMaterial color="#a9aeb4" metalness={0.85} roughness={0.35} /></mesh>
      {/* top cap + gland */}
      <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.075, 0.075, 0.1, 20]} /><meshStandardMaterial color="#111" roughness={0.6} /></mesh>
    </group>
  );
}

/* ---------- pH PROBE ---------- */
export function PH() {
  return (
    <group>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.048, 0.048, 0.72, 18]} /><meshStandardMaterial color="#c2c7cd" metalness={0.85} roughness={0.3} /></mesh>
      {/* black sensing tip */}
      <mesh position={[0, -0.32, 0]}><cylinderGeometry args={[0.05, 0.035, 0.16, 18]} /><meshStandardMaterial color="#1a1c1f" roughness={0.5} /></mesh>
      <mesh position={[0, -0.42, 0]}><coneGeometry args={[0.035, 0.08, 18]} /><meshStandardMaterial color="#1a1c1f" /></mesh>
      <mesh position={[0, 0.48, 0]}><cylinderGeometry args={[0.058, 0.058, 0.1, 18]} /><meshStandardMaterial color="#0b7a3b" roughness={0.5} /></mesh>
    </group>
  );
}

/* ---------- CAPACITIVE MOISTURE SENSOR ---------- */
export function Moisture() {
  return (
    <group>
      {/* blade */}
      <RoundedBox args={[0.13, 0.66, 0.018]} radius={0.01} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#23282e" roughness={0.55} />
      </RoundedBox>
      {/* printed corrosion-resist coating line */}
      <mesh position={[0, 0.05, 0.011]}><boxGeometry args={[0.05, 0.5, 0.004]} /><meshStandardMaterial color="#37c871" emissive="#1f7a44" emissiveIntensity={0.3} /></mesh>
      {/* head */}
      <RoundedBox args={[0.17, 0.13, 0.03]} radius={0.01} position={[0, 0.4, 0]}>
        <meshStandardMaterial color="#2c3138" roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.4, 0.02]}><boxGeometry args={[0.06, 0.05, 0.02]} /><meshStandardMaterial color="#0d0f12" /></mesh>
      <PinRow count={3} spacing={0.04} position={[0, 0.49, 0.01]} />
    </group>
  );
}

/* ---------- RAIN SENSOR ---------- */
export function Rain() {
  return (
    <group>
      {/* detection plate */}
      <RoundedBox args={[0.42, 0.02, 0.56]} radius={0.01}>
        <meshStandardMaterial color="#0d3b12" roughness={0.5} />
      </RoundedBox>
      {/* interdigitated copper traces */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[(i - 3) * 0.055, 0.014, 0]}><boxGeometry args={[0.02, 0.006, 0.46]} /><meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} /></mesh>
      ))}
      {/* comparator module underneath */}
      <mesh position={[0, -0.06, -0.34]}><boxGeometry args={[0.34, 0.05, 0.16]} /><meshStandardMaterial color="#0a4a86" /></mesh>
    </group>
  );
}

/* ---------- WATER LEVEL SENSOR ---------- */
export function WaterLevel() {
  return (
    <group>
      <RoundedBox args={[0.14, 0.34, 0.02]} radius={0.008} position={[0, 0.05, 0]}>
        <meshStandardMaterial color="#0a4a86" roughness={0.5} />
      </RoundedBox>
      {/* comb traces at lower half */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[(i - 2.5) * 0.02, -0.05, 0.012]}><boxGeometry args={[0.008, 0.18, 0.004]} /><meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.3} /></mesh>
      ))}
      <mesh position={[0, 0.2, 0.02]}><boxGeometry args={[0.1, 0.06, 0.03]} /><meshStandardMaterial color="#0d0f12" /></mesh>
    </group>
  );
}

/* ---------- FLOW SENSOR ---------- */
export function Flow() {
  return (
    <group rotation={[0, 0, Math.PI / 2]}>
      {/* body */}
      <mesh><cylinderGeometry args={[0.13, 0.13, 0.3, 24]} /><meshStandardMaterial color="#1b1d20" roughness={0.5} /></mesh>
      {/* barbs */}
      <mesh position={[0, 0.22, 0]}><cylinderGeometry args={[0.07, 0.07, 0.16, 18]} /><meshStandardMaterial color="#12223a" roughness={0.5} /></mesh>
      <mesh position={[0, -0.22, 0]}><cylinderGeometry args={[0.07, 0.07, 0.16, 18]} /><meshStandardMaterial color="#12223a" roughness={0.5} /></mesh>
      {/* sensor bump */}
      <mesh position={[0.11, 0, 0]} rotation={[0, 0, Math.PI / 2]}><boxGeometry args={[0.1, 0.14, 0.1]} /><meshStandardMaterial color="#2a54c0" /></mesh>
    </group>
  );
}

/* ---------- WIRE (curved cable tube) ---------- */
export function Wire({ start, end, color = '#222', radius = 0.018, sag = 0.35 }) {
  const geo = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = s.clone().add(e).multiplyScalar(0.5);
    mid.y -= s.distanceTo(e) * sag;
    const curve = new THREE.CatmullRomCurve3([s, mid, e]);
    return new THREE.TubeGeometry(curve, 26, radius, 8, false);
  }, [start[0], start[1], start[2], end[0], end[1], end[2], radius, sag]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

/* ---------- SCENE DECOR ---------- */
export function Soil() {
  return (
    <group>
      <mesh position={[0, -0.12, 0]} receiveShadow>
        <boxGeometry args={[16, 0.24, 12]} />
        <meshStandardMaterial color="#6d543f" roughness={1} />
      </mesh>
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#7a5f47" roughness={1} />
      </mesh>
    </group>
  );
}

export function Pole() {
  return (
    <group>
      <mesh position={[0, 0.42, -0.55]}><boxGeometry args={[0.16, 1.7, 0.16]} /><meshStandardMaterial color="#8a9096" metalness={0.7} roughness={0.4} /></mesh>
      <mesh position={[0, 0.75, -0.48]}><boxGeometry args={[0.5, 0.14, 0.12]} /><meshStandardMaterial color="#767c82" metalness={0.6} roughness={0.5} /></mesh>
    </group>
  );
}

export function Pipe() {
  return (
    <group>
      {/* irrigation pipe running along -z through the flow sensor toward crops */}
      <mesh position={[0.6, 0.2, -2.4]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 2.2, 20]} />
        <meshStandardMaterial color="#2a6bd6" roughness={0.5} />
      </mesh>
      <mesh position={[0.6, 0.2, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.9, 20]} />
        <meshStandardMaterial color="#2a6bd6" roughness={0.5} />
      </mesh>
      {/* pump / valve box */}
      <mesh position={[0.6, 0.24, -0.55]}><boxGeometry args={[0.3, 0.28, 0.3]} /><meshStandardMaterial color="#3a3f45" roughness={0.5} /></mesh>
    </group>
  );
}

export function Plants() {
  const spots = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      arr.push([-4 + Math.random() * 8, 0, -3.6 - Math.random() * 1.4]);
    }
    return arr;
  }, []);
  return (
    <group>
      {spots.map((p, i) => (
        <group key={i} position={p}>
          <mesh position={[0, 0.12, 0]}><coneGeometry args={[0.12, 0.26, 6]} /><meshStandardMaterial color="#2e7d3a" roughness={0.8} /></mesh>
          <mesh position={[0, 0.28, 0]}><coneGeometry args={[0.09, 0.2, 6]} /><meshStandardMaterial color="#37944a" roughness={0.8} /></mesh>
        </group>
      ))}
    </group>
  );
}

/* map id -> geometry component */
export const PART_GEOMETRY = {
  body: Body, lid: Lid, plate: Plate, solar: Solar, esp32: ESP32, sim: SIM,
  max485: MAX485, relay: Relay, buck: Buck, dht22: DHT22, npk: NPK, ph: PH,
  moisture1: Moisture, moisture2: Moisture, moisture3: Moisture,
  rain: Rain, waterlevel: WaterLevel, flow: Flow,
};
