import { useTypewriter } from "@/hooks/useTypewriter";

interface TypewriterProps {
  words: string[];
  className?: string;
  caretClassName?: string;
}

export function Typewriter({ words, className, caretClassName }: TypewriterProps) {
  const text = useTypewriter({ words });
  return (
    <span className={className}>
      <span className="text-gold">{text}</span>
      <span
        aria-hidden
        className={`inline-block w-[3px] h-[0.9em] ml-1 align-middle bg-[#F5A623] animate-pulse ${caretClassName ?? ""}`}
      />
    </span>
  );
}
