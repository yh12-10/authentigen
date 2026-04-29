import { motion } from "framer-motion";

const AVATARS = ["SR", "DK", "MT", "ML", "PC"];
const COLORS = ["#F5A623", "#4F8EF7", "#10B981", "#A855F7", "#EC4899"];

export function TrustedByBadge() {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="inline-flex items-center gap-3 rounded-full glass-strong px-4 py-2 border border-[#F5A623]/15"
    >
      <div className="flex -space-x-2">
        {AVATARS.map((a, i) => (
          <div
            key={a}
            className="size-7 rounded-full border-2 border-background flex items-center justify-center font-medium text-[10px] text-black"
            style={{ background: COLORS[i % COLORS.length] }}
          >
            {a}
          </div>
        ))}
      </div>
      <span className="text-xs font-medium">
        Trusted by <span className="text-gold">50,000+</span> creators
      </span>
    </motion.div>
  );
}
