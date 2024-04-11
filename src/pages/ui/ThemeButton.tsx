import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export default function ThemeButton()    {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        let theme = localStorage.getItem("tix-dark");
        const root = document.documentElement;
        if (theme)  {
            setIsDark(theme.toLowerCase() === "true");
            if (theme.toLowerCase() === "true") 
                root.classList.remove("dark");
            else
                root.classList.add("dark");
        }
        else    {
            setIsDark(false);
            root.classList.remove("dark");
        }
    }, []);

    function changeMode()   {
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
        <Button className="p-2 w-16 h-16 rounded-full absolute bottom-5 right-5 shadow-md" onClick={changeMode}>
            { isDark ? <MoonIcon /> : <SunIcon /> }
        </Button>
    )
}