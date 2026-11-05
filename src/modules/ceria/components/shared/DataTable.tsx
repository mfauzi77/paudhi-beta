import React from 'react';

interface DataTableProps {
    data: Record<string, any>[];
    headers: string[];
}

const formatHeader = (key: string) => {
    const result = key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ');
    return result.charAt(0).toUpperCase() + result.slice(1);
};

const DataTable: React.FC<DataTableProps> = ({ data, headers }) => {
    if (!Array.isArray(data) || data.length === 0) {
        return <p className="text-center text-slate-500 py-8">No data available to display.</p>;
    }

    const renderCell = (value: any) => {
        if (value === null || value === undefined) {
            return <span className="text-slate-400">N/A</span>;
        }
        if (typeof value === 'boolean') {
            return value ? <span className="text-emerald-600 font-semibold">Yes</span> : <span className="text-red-600 font-semibold">No</span>;
        }
        if (typeof value === 'object') {
            const jsonString = JSON.stringify(value);
            const displayString = jsonString.length > 50 ? `${jsonString.substring(0, 50)}...` : jsonString;
            return (
                <pre className="text-xs bg-slate-100 p-1 rounded max-w-xs overflow-x-auto" title={jsonString}>
                    <code>{displayString}</code>
                </pre>
            );
        }
        return String(value);
    };

    return (
        <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100 sticky top-0">
                <tr>
                    {headers.map(header => (
                        <th key={header} scope="col" className="px-6 py-3 whitespace-nowrap">
                            {formatHeader(header)}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-white border-b hover:bg-slate-50">
                        {headers.map(header => (
                            <td key={`${rowIndex}-${header}`} className="px-6 py-4 align-top">
                                <div className="max-w-md">{renderCell(row[header])}</div>
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default DataTable;