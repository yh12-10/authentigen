import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import { type ReactNode } from "react";

interface StaggerGroupProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  stagger?: number;
  delayChildren?: number;
}

export const childVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function StaggerGroup({
  children,
  stagger = 0.08,
  delayChildren = 0,
  ...rest
}: StaggerGroupProps) {
  const parentVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={parentVariants}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerChild({
  children,
  ...rest
}: Omit<HTMLMotionProps<"div">, "children"> & { children: ReactNode }) {
  return (
    <motion.div variants={childVariants} {...rest}>
      {children}
    </motion.div>
  );
}
