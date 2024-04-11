export default function Navbar()    {
    const account = 'John Doe';

    return (
        <div className="w-full flex flex-row items-center justify-between px-7 py-5 bg-background text-primary border-b border-border">
            <h1 className="font-semibold text-xl cursor-pointer">PESU-tix</h1>
            <span className="flex flex-row items-end cursor-pointer">
                <span className="">{ account }</span>
            </span>
        </div>
    )
}