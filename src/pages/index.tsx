import { montserrat } from "~/fonts";
import Navbar from "~/pages/ui/Navbar";

export default function Home() {
    return (
        <div className={`window ${montserrat}`}>
            <Navbar />
        </div>
    )
}