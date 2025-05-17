
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

function Header1() {
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background">
            <div className="container relative mx-auto min-h-20 flex justify-between items-center">
                <Link to="/" className="font-semibold">
                    Leena.ai
                </Link>
                <Link to="/auth">
                    <Button variant="outline" className="font-semibold">Sign in</Button>
                </Link>
            </div>
        </header>
    );
}

export { Header1 };
