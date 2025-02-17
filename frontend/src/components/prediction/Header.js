import React from 'react';

function Header() {
    return (
        <header className="py-6 mb-4 border-b">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-600 rounded-lg"></div>
                    <h1 className="text-xl font-bold text-gray-800">LeptoCare Analytics</h1>
                </div>
                <nav className="flex space-x-4 text-gray-600">
                    <a href="#" className="hover:text-teal-600">Docs</a>
                    <a href="#" className="hover:text-teal-600">API</a>
                    <a href="#" className="hover:text-teal-600">Support</a>
                </nav>
            </div>
        </header>
    );
}

export default Header;