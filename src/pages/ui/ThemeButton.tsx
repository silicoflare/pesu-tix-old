import { useState, useEffect } from "react";
import { SunIcon, MoonIcon } from 'lucide-react';
import { useAtom } from "jotai";
import { dark } from "~/atoms";

export default function ThemeButton({ hidden } : { hidden?: boolean }) {
    const [isDark, setIsDark] = useAtom(dark);

    useEffect(() => {
        changeMode();
    }, []);

    function changeMode() {
        const root = document.documentElement;
        setIsDark(old => {
            const newDark = !old;
            if (newDark)
                root.classList.add("dark");
            else
                root.classList.remove("dark");
            return newDark;
        });
    }

    return (
        <div onClick={changeMode} className="mr-7 p-0 flex flex-col items-center justify-center" style={{ visibility: hidden ? "hidden" : "visible" }}>
            {isDark ? <MoonIcon className="w-7 h-7" /> : <SunIcon className="w-7 h-7" />}
        </div>
    )
}
