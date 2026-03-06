'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    HomeIcon,
    TruckIcon,
    MapPinIcon,
    SparklesIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
    ClipboardDocumentCheckIcon,
    ChartBarIcon,
    MapIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';

export default function Navbar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const isCitizen = session?.user?.role === 'citizen';
    const isMunicipal = session?.user?.role === 'municipal';

    const citizenLinks = [
        { href: '/dashboard/citizen', label: 'Dashboard', icon: HomeIcon },
        { href: '/dashboard/citizen/track', label: 'Track Vehicle', icon: MapPinIcon },
        { href: '/dashboard/citizen/report', label: 'Report Issue', icon: ClipboardDocumentCheckIcon },
        { href: '/dashboard/citizen/compost', label: 'Composting Hub', icon: SparklesIcon },
        { href: '/dashboard/citizen/rewards', label: 'Rewards', icon: BellIcon },
    ];

    const municipalLinks = [
        { href: '/dashboard/municipal', label: 'Dashboard', icon: HomeIcon },
        { href: '/dashboard/municipal/fleet', label: 'Fleet', icon: TruckIcon },
        { href: '/dashboard/municipal/reports', label: 'Reports', icon: ClipboardDocumentCheckIcon },
        { href: '/dashboard/municipal/routes', label: 'Routes', icon: MapIcon },
        { href: '/dashboard/municipal/analytics', label: 'Analytics', icon: ChartBarIcon },
    ];

    const links = isCitizen ? citizenLinks : isMunicipal ? municipalLinks : [];

    const handleSignOut = () => {
        signOut({ callbackUrl: '/' });
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={isCitizen ? '/dashboard/citizen' : '/dashboard/municipal'} className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-eco rounded-lg flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold">
                            <span className="gradient-text">Eco</span> Waste
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isActive
                                            ? 'bg-eco-50 text-eco-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span className="text-sm">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                            <UserCircleIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700">{session?.user?.name}</span>
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden pb-3 flex gap-2 overflow-x-auto">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm ${isActive
                                        ? 'bg-eco-50 text-eco-700 font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <link.icon className="w-4 h-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
