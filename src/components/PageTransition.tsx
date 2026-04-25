import { memo } from "react";
import { motion } from "framer-motion";
import { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

// Variantes fora do componente — não recriadas a cada render
const VARIANTS = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
};

const TRANSITION = { duration: 0.45, ease: EASE };

// memo evita que PageTransition seja re-criado ao re-renderizar o pai
const PageTransition = memo(function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={TRANSITION}
      className="min-h-full"
    >
      {children}
    </motion.div>
  );
});

export default PageTransition;
