import { useCallback, useEffect, useState } from "react";
import MobileMenu from "./MobileMenu";
import NavbatItem from "./NavbarItem";
import { BsChevronDown, BsSearch, BsBell } from 'react-icons/bs'
import AccountMenu from "./AccountMenu";
const Navbar = () => {
    const [showBackground, setShowBackground] = useState(false);
    const TOP_OFFSET = 66;
    useEffect(() => {
        const handleScroll = () => {
            console.log(window.scrollY)
            if (window.scrollY >= TOP_OFFSET) {
                setShowBackground(true)
            } else {
                setShowBackground(false)
            }
            }
        
            window.addEventListener('scroll', handleScroll);
        
            return () => {
            window.removeEventListener('scroll', handleScroll);
            }
    }, []);

    const [showMobileMenu, setshowMobileMenu] = useState(false);
    const toogleMobileMenu = useCallback(() => {
        setshowMobileMenu((current) => !current)
    }, []);


    const [showAccountMenu, setshowAccountMenu] = useState(false);
    const toogleAccountMenu = useCallback(() => {
        setshowAccountMenu((current) => !current)
    }, []);
    return(
        <nav className="w-full fixed z-40">
            <div 
                className={`
                    px-4
                    md:px-16
                    py-6
                    flex
                    items-center
                    transition
                    duration-500
                    ${showBackground ? 'bg-zinc-900 bg-opacity-90' : ''}
                    `}>
                    <img className="h-4 lg:h-7" src="/images/logo.png" alt="LOGO" />
                    <div 
                        className="
                            flex-row
                            ml-8
                            gap-7
                            hidden
                            lg:flex
                        ">
                            <NavbatItem label="首頁"/>
                            <NavbatItem label="節目"/>
                            <NavbatItem label="電影"/>
                            <NavbatItem label="最新熱門影片"/>
                            <NavbatItem label="我的片單"/>
                            <NavbatItem label="按照語言瀏覽"/>
                    </div>
                    <div onClick={toogleMobileMenu} className="lg:hidden flex flex-row items-center gap-2 ml-8 cursor-pointer relative">
                        <p className="text-white text-sm">瀏覽</p>
                        <BsChevronDown className={`text-white transition ${showMobileMenu ? 'rotate-180' : 'rotate-0'}`} />
                        <MobileMenu visible={showMobileMenu} />
                    </div>
                    <div className="flex flex-row ml-auto gap-7 items-center ">
                        <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
                            <BsSearch />
                        </div>
                        <div className="text-gray-200 hover:text-gray-300 cursor-pointer transition">
                            <BsBell />
                        </div>
                        <div onClick={toogleAccountMenu} className="flex flex-row items-center cursor-pointer gap-2 relative">
                            <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-md overflow-hidden">
                                <img src="/images/default-blue.png" alt="" />
                            </div>
                            <BsChevronDown className={`text-white transition ${showAccountMenu ? 'rotate-180' : 'rotate-0'}`} />
                            <AccountMenu visible={showAccountMenu} />
                        </div>
                    </div>
            </div>
        </nav>
    )
}

export default Navbar;