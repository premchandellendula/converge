import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation';
import { FocusEvent, FormEvent, useEffect, useRef, useState } from 'react';
const iconButton =
    "grid size-9 shrink-0 place-items-center rounded-full text-stone-700 hover:bg-stone-300 focus-visible:outline-2 focus-visible:outline-purple-600 dark:text-stone-200 dark:hover:bg-stone-700";

const SearchBar = () => {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);
    const openButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if(open) inputRef.current?.focus();
    }, [open]);

    function close(){
        setOpen(false);
        setText("");

        requestAnimationFrame(() => openButtonRef.current?.focus());
    }

    function handleSubmit(e: FormEvent<HTMLFormElement>){
        e.preventDefault();
        const q = text.trim();
        router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : "/jobs");
        setOpen(false);
        setText("");
    }

    function handleBlur(e: FocusEvent<HTMLFormElement>) {
        if (!e.currentTarget.contains(e.relatedTarget) && !text.trim()) setOpen(false);
    }

    if (!open) {
        return (
            <button ref={openButtonRef} type="button" aria-label="Search jobs" onClick={() => setOpen(true)} className={iconButton}>
                <Search size={20} />
            </button>
        );
    }
    return (
        <form
            role="search"
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            className='flex h-9 items-center gap-1 rounded-full border border-stone-400 bg-white pl-3 pr-1 focus-within:border-purple-600 dark:border-stone-600 dark:bg-stone-900'
        >
            <Search size={16} aria-hidden="true" className="shrink-0 text-stone-500 dark:text-stone-400" />
            <label htmlFor="navbar-search" className='sr-only'>
                Search jobs by role or skill
            </label>
            <input 
                type="search" 
                id="navbar-search"
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === "Escape") close();
                }}
                placeholder='Search roles or skills'
                className='w-36 bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-50 sm:w-64 dark:text-stone-50'
            />
            <button type="button" aria-label="Close search" onClick={close} className="grid size-7 place-items-center rounded-full text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-700">
                <X size={16} />
            </button>
        </form>
    )
}

export default SearchBar