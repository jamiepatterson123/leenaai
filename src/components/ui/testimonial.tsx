
import { motion } from "framer-motion";

function Testimonial() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center rounded-full border border-border bg-white/80 backdrop-blur-sm p-2 shadow-soft"
    >
      <div className="flex -space-x-2">
        <img
          className="h-7 w-7 rounded-full ring-2 ring-white"
          src="https://originui.com/avatar-80-03.jpg"
          width={28}
          height={28}
          alt="Avatar 01"
        />
        <img
          className="h-7 w-7 rounded-full ring-2 ring-white"
          src="https://originui.com/avatar-80-04.jpg"
          width={28}
          height={28}
          alt="Avatar 02"
        />
        <img
          className="h-7 w-7 rounded-full ring-2 ring-white"
          src="https://originui.com/avatar-80-05.jpg"
          width={28}
          height={28}
          alt="Avatar 03"
        />
        <img
          className="h-7 w-7 rounded-full ring-2 ring-white"
          src="https://originui.com/avatar-80-06.jpg"
          width={28}
          height={28}
          alt="Avatar 04"
        />
      </div>
      <p className="px-3 text-sm text-muted-foreground">
        Trusted by <strong className="font-medium text-foreground">wellness professionals</strong>
      </p>
    </motion.div>
  );
}

export { Testimonial };
