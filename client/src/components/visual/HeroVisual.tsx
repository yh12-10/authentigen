import { Suspense, lazy, Component, type ReactNode } from "react";
import { useHasTouch } from "@/hooks/useHasTouch";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const ParticleSphere = lazy(() => import("./ParticleSphere"));

class R3FErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[HeroVisual] Three.js failed, using fallback:", error);
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

function CssOrbsFallback() {
  return (
    <div className="relative w-full h-full">
      <div
        className="absolute top-1/4 left-1/4 size-64 rounded-full blur-3xl orb"
        style={{
          background:
            "radial-gradient(closest-side, rgba(245,166,35,0.5), transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 size-72 rounded-full blur-3xl orb orb-delay"
        style={{
          background:
            "radial-gradient(closest-side, rgba(79,142,247,0.4), transparent 70%)",
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 size-48 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,200,100,0.25), transparent 70%)",
        }}
      />
    </div>
  );
}

export function HeroVisual() {
  const touch = useHasTouch();
  const reduced = useReducedMotion();
  const fallback = <CssOrbsFallback />;

  if (touch || reduced) return fallback;

  return (
    <R3FErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <ParticleSphere />
      </Suspense>
    </R3FErrorBoundary>
  );
}
