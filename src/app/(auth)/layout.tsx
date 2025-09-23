import React from 'react';

interface Props {
    children: React.ReactNode;
};


const Layout = ({ children }: Props) => {
    return (
        <div className="p-4 flex min-h-screen flex-col items-center justify-center gap-4">
            <div className="w-full max-w-sm md:max-w-3xl">
            {children}
        </div> 
        </div>
    );
};

export default Layout;