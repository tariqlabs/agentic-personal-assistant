/**
 * TechIcon — renders an official Simple Icons SVG for a given slug.
 * Falls back to a Lucide icon for concepts without brand icons (ai, machinelearning, aws).
 */
import {
  siNodedotjs,
  siLinux,
  siReact,
  siJavascript,
  siPython,
  siDocker,
  siKubernetes,
} from "simple-icons";
import { BrainCircuit, Cpu, Cloud } from "lucide-react";

const ICON_MAP = {
  nodejs:     siNodedotjs,
  linux:      siLinux,
  react:      siReact,
  javascript: siJavascript,
  python:     siPython,
  docker:     siDocker,
  kubernetes: siKubernetes,
};

const LUCIDE_MAP = {
  ai:             { Icon: BrainCircuit, color: "text-primary-500" },
  machinelearning: { Icon: Cpu,         color: "text-primary-500" },
  aws:            { Icon: Cloud,        color: "text-orange-400" },
};

export function TechIcon({ slug, size = 40, className = "" }) {
  const si = ICON_MAP[slug];

  if (si) {
    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill={`#${si.hex}`}
        className={className}
        aria-label={si.title}
      >
        <path d={si.path} />
      </svg>
    );
  }

  const fallback = LUCIDE_MAP[slug];
  if (fallback) {
    const { Icon, color } = fallback;
    return (
      <Icon
        width={size}
        height={size}
        className={`${color} ${className}`}
        strokeWidth={1.5}
      />
    );
  }

  return null;
}
