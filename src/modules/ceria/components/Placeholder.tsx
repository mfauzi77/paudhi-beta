import React from 'react';

interface PlaceholderProps {
    title: string;
}

const Placeholder: React.FC<PlaceholderProps> = ({ title }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg shadow-sm border-2 border-dashed border-slate-300">
            <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-slate-900">{title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                    This feature is currently under construction.
                </p>
                <p className="mt-1 text-sm text-slate-500">
                    Content for this section will be available soon.
                </p>
            </div>
        </div>
    );
};

export default Placeholder;