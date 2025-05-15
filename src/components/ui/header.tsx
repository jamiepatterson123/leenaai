
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Header1() {
    const [scrolled, setScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return (
        <header 
            className={`w-full z-40 fixed top-0 left-0 transition-all duration-200 ${
                scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
            }`}
        >
            <div className="container relative mx-auto min-h-20 flex justify-between items-center">
                <Link to="/" className="font-heading text-xl font-semibold flex items-center gap-2">
                    <img 
                        src="/app-icon.png" 
                        alt="Leena.ai" 
                        className="h-8 w-8"
                    />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
                        Leena.ai
                    </span>
                </Link>
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Link to="/auth">
                        <Button variant="outline" className="font-medium shadow-sm hover:shadow">
                            Sign in
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </header>
    );
}

export { Header1 };
