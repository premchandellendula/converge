"use client"
import ConvergeLogo from '../logo/logo'
import SearchBar from './SearchBar'
import { useState } from 'react'
import Flyout from './Flyout'
import { useMe } from '@/lib/auth'

const Navbar = () => {
    const [isFlyoutOpen, setIsFlyoutOpen] = useState(false);
    const { data: me } = useMe();
    const initial = me?.firstName.charAt(0).toUpperCase() ?? "";

    return (
        <header
            className='sticky top-0 z-40 border-b border-stone-300 bg-stone-200 text-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100'
        >    
            <nav aria-label='Main' className='flex h-14 w-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8'>
                <ConvergeLogo href="/" />
                <div className='flex items-center gap-1 sm:gap-2'>
                    {me?.role === "Candidate" && <SearchBar />}
                    <div className='relative'>
                        <button
                            type="button"
                            data-flyout-trigger
                            aria-expanded={isFlyoutOpen}
                            aria-controls='account-menu'
                            aria-label="Account menu"
                            onClick={() => setIsFlyoutOpen((open) => !open)}
                            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-purple-600 font-semibold text-white hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600"
                        >
                            {initial}
                        </button>
                        {isFlyoutOpen && <Flyout setIsFlyoutOpen={setIsFlyoutOpen} />}
                    </div>
                </div>
            </nav>
        </header>
    )
}

export default Navbar