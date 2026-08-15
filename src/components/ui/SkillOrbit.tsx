import { useAnimationFrame, useReducedMotion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { rings } from '../../data/skills';
import type { Ring, Skill } from '../../data/skills';

const CX = 240;
const CY = 240;

type Node = { skill: Skill; ring: Ring; x: number; y: number };

type Props = {
  /** ring to spotlight; null = all rings equal */
  focus: Ring['id'] | null;
  /** currently inspected skill name */
  activeName: string;
  onPick: (skill: Skill, ring: Ring) => void;
};

export default function SkillOrbit({ focus, activeName, onPick }: Props) {
  const ringRefs    = useRef<Record<string, SVGGElement | null>>({});
  const counterRefs = useRef<Record<string, SVGGElement | null>>({});
  const angles      = useRef<Record<string, number>>({});
  const paused      = useRef(false);
  const reduced     = useReducedMotion();

  /* node positions are fixed on their ring; the ring is what rotates */
  const nodes = useMemo<Node[]>(
    () =>
      rings.flatMap((ring) =>
        ring.skills.map((skill, i) => {
          const a = ((-90 + (i * 360) / ring.skills.length) * Math.PI) / 180;
          return {
            skill,
            ring,
            x: CX + ring.r * Math.cos(a),
            y: CY + ring.r * Math.sin(a),
          };
        }),
      ),
    [],
  );

  useAnimationFrame((_, delta) => {
    if (reduced || paused.current) return;
    for (const ring of rings) {
      const step = ((360 / ring.duration) * delta) / 1000;
      const next = (angles.current[ring.id] ?? 0) + (ring.reverse ? -step : step);
      angles.current[ring.id] = next % 360;
      ringRefs.current[ring.id]?.setAttribute('transform', `rotate(${next} ${CX} ${CY})`);
      /* labels spin back the other way so text always reads level */
      for (const skill of ring.skills) {
        counterRefs.current[skill.name]?.setAttribute('transform', `rotate(${-next})`);
      }
    }
  });

  return (
    <svg
      viewBox="0 0 480 480"
      className="fp-orbit"
      role="group"
      aria-label="Interactive skill orbit"
      onMouseEnter={() => { paused.current = true; }}
      onMouseLeave={() => { paused.current = false; }}
    >
      {/* orbit paths */}
      {rings.map((ring) => (
        <circle
          key={ring.id}
          cx={CX}
          cy={CY}
          r={ring.r}
          className={`fp-orbit-path${focus && focus !== ring.id ? ' is-dim' : ''}`}
          style={{ stroke: ring.color }}
        />
      ))}

      {/* core */}
      <g className="fp-orbit-core">
        <circle cx={CX} cy={CY} r={40} />
        <text x={CX} y={CY - 3}>FULL</text>
        <text x={CX} y={CY + 13}>STACK</text>
      </g>

      {/* rotating rings */}
      {rings.map((ring) => (
        <g key={ring.id} ref={(el) => { ringRefs.current[ring.id] = el; }}>
          {nodes
            .filter((n) => n.ring.id === ring.id)
            .map(({ skill, x, y }) => {
              const isActive = skill.name === activeName;
              const isDim    = !!focus && focus !== ring.id;
              return (
                <g key={skill.name} transform={`translate(${x} ${y})`}>
                  <g ref={(el) => { counterRefs.current[skill.name] = el; }}>
                    <g
                      className={`fp-orbit-node${isActive ? ' is-active' : ''}${isDim ? ' is-dim' : ''}`}
                      style={{ '--pc': ring.color } as React.CSSProperties}
                      role="button"
                      tabIndex={0}
                      aria-label={`${skill.name} — ${ring.label}`}
                      onMouseEnter={() => onPick(skill, ring)}
                      onFocus={() => onPick(skill, ring)}
                      onClick={() => onPick(skill, ring)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onPick(skill, ring);
                        }
                      }}
                    >
                      {/* generous invisible hit area */}
                      <circle className="fp-orbit-hit" r={22} />
                      <circle className="fp-orbit-glow" r={isActive ? 16 : 11} />
                      <circle className="fp-orbit-dot"  r={isActive ? 7.5 : 5} />
                      <text y={26}>{skill.name}</text>
                    </g>
                  </g>
                </g>
              );
            })}
        </g>
      ))}
    </svg>
  );
}
