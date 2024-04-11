import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { SunIcon, MoonIcon } from 'lucide-react';

export default function ThemeButton() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let theme = localStorage.getItem("tix-dark");
        const root = document.documentElement;
        if (theme) {
            setIsDark(theme.toLowerCase() === "true");
            if (theme.toLowerCase() === "true")
                root.classList.add("dark");
            else
                root.classList.remove("dark");
        }
        else {
            setIsDark(false);
            root.classList.remove("dark");
        }
    }, []);

    function changeMode() {
        const root = document.documentElement;
        setIsDark(old => {
            const newDark = !old;
            if (newDark)
                root.classList.add("dark");
            else
                root.classList.remove("dark");

            localStorage.setItem("tix-dark", newDark ? "true" : "false");

            return newDark;
        });
    }

    return (
        <div onClick={changeMode} className="ml-7 p-0 flex flex-col items-center justify-center">
            {isDark ? <MoonIcon className="w-7 h-7" /> : <SunIcon className="w-7 h-7" />}
        </div>
    )
}