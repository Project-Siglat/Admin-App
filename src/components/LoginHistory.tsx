import React, { useState, useEffect } from 'react';
import { getMyLoginHistory } from '../lib/api.js';
import Card from './Card.tsx';

interface LoginHistoryEntry {
    id: string;
    ipAddress: string;
    userAgent: string;
    loginTimestamp: string;
    logoutTimestamp?: string;
    loginStatus: string;
    failureReason?: string;
    isActive: boolean;
}

const LoginHistory: React.FC = () => {
    const [loginHistory, setLoginHistory] = useState<LoginHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchLoginHistory();
    }, []);

    const fetchLoginHistory = async () => {
        try {
            setLoading(true);
            const data = await getMyLoginHistory();
            setLoginHistory(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch login history');
            console.error('Error fetching login history:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const getStatusBadge = (status: string) => {
        const statusClasses = {
            'Success': 'bg-green-100 text-green-800',
            'Failed': 'bg-red-100 text-red-800',
            'Error': 'bg-yellow-100 text-yellow-800',
            'Admin Created': 'bg-blue-100 text-blue-800'
        };

        const className = statusClasses[status as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${className}`}>
                {status}
            </span>
        );
    };

    const parseUserAgent = (userAgent: string) => {
        // Simple user agent parsing for browser/device info
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Unknown Browser';
    };

    if (loading) {
        return (
            <Card>
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <div className="text-center text-red-600 p-4">
                    <p>{error}</p>
                    <button 
                        onClick={fetchLoginHistory}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Login History</h2>
                    <button 
                        onClick={fetchLoginHistory}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                        Refresh
                    </button>
                </div>

                {loginHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No login history found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Login Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Logout Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        IP Address
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Browser
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Session
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loginHistory.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(entry.loginStatus)}
                                            {entry.failureReason && (
                                                <div className="text-xs text-red-600 mt-1">
                                                    {entry.failureReason}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatDate(entry.loginTimestamp)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.logoutTimestamp ? formatDate(entry.logoutTimestamp) : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {entry.ipAddress}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {parseUserAgent(entry.userAgent)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                entry.isActive 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {entry.isActive ? 'Active' : 'Ended'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default LoginHistory;