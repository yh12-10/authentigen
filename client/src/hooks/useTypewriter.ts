import { useEffect, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export interface UseTypewriterOptions {
  words: string[];
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
}

export function useTypewriter({
  words,
  typeMs = 90,
  deleteMs = 50,
  holdMs = 1500,
}: UseTypewriterOptions) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setText(words[0] ?? "");
      return;
    }
    const word = words[wordIndex] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < word.length) {
        timer = setTimeout(() => setText(word.slice(0, text.length + 1)), typeMs);
      } else {
        timer = setTimeout(() => setPhase("deleting"), holdMs);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), deleteMs);
      } else {
        setWordIndex((i) => (i + 1) % words.length);
        setPhase("typing");
        return;
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, wordIndex, words, typeMs, deleteMs, holdMs, reduced]);

  return text;
}
