"use client";

import { useState, useEffect } from "react";
import { homepageAPI } from "@/lib/api"; // We'll add this to admin-portal api.js
import { Loader2, Search, Mail, Phone, User, MessageSquare, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function SupportPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all"); // 'all', 'contact', 'support'

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await homepageAPI.getAllSupportRequests(); // Needs implementation
            if (data.success) {
                setRequests(data.requests);
            } else {
                setError(data.error || "Failed to fetch requests");
            }
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.name.toLowerCase().includes(search.toLowerCase()) ||
            req.email.toLowerCase().includes(search.toLowerCase()) ||
            req.mobile.includes(search) ||
            req.reason.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === "all" || req.type === filter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Support & Contact</h1>
                    <p className="text-gray-500">Manage support tickets and contact form submissions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchRequests}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or message..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter("support")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "support" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Help Center
                    </button>
                    <button
                        onClick={() => setFilter("contact")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "contact" ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                            }`}
                    >
                        Contact Form
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                </div>
            ) : filteredRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                    <p className="text-gray-500">There are no support requests matching your criteria.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${req.type === 'support' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {req.type === 'support' ? <User size={20} /> : <Mail size={20} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-semibold text-gray-900">{req.name}</h3>
                                            <Badge variant={req.type === 'support' ? "default" : "secondary"} className={req.type === 'support' ? "bg-indigo-100 text-indigo-700 border-indigo-200" : "bg-orange-100 text-orange-700 border-orange-200"}>
                                                {req.type === 'support' ? 'Help Center' : 'Contact Form'}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Mail size={14} />
                                                {req.email}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Phone size={14} />
                                                {req.mobile}
                                            </div>
                                            {req.created_at && (
                                                <span className="text-gray-400">• {format(new Date(req.created_at), "PPP p")}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-3 pl-0 md:pl-14">
                                <div className="bg-gray-50 rounded-lg p-3 text-gray-700 text-sm whitespace-pre-wrap">
                                    {req.reason}
                                </div>
                                {req.user && (
                                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                                        <User size={12} />
                                        Linked Account: {req.user.username} ({req.user.email})
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
