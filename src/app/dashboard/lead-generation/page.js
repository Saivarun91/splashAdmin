"use client";

import { useState, useEffect } from "react";
import { paymentAPI } from "@/lib/api";
import { Loader2, Search, Users, ExternalLink, Calendar, Mail, Phone, Globe } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function LeadGenerationPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const data = await paymentAPI.getSalesLeads();
            if (data.success) {
                setLeads(data.leads);
            } else {
                setError(data.error || "Failed to fetch leads");
            }
        } catch (err) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const filteredLeads = leads.filter((lead) => {
        const searchLower = search.toLowerCase();
        return (
            lead.first_name.toLowerCase().includes(searchLower) ||
            lead.last_name.toLowerCase().includes(searchLower) ||
            lead.work_email.toLowerCase().includes(searchLower) ||
            lead.company_website.toLowerCase().includes(searchLower)
        );
    });

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Generation</h1>
                    <p className="text-gray-500">View and manage contact sales submissions</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={fetchLeads}
                        className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        Refresh
                    </button>
                    <div className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium">
                        Total Leads: {leads.length}
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search by name, email, or company..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : error ? (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
                    {error}
                </div>
            ) : filteredLeads.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
                    <p className="text-gray-500">Contact sales submissions will appear here.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredLeads.map((lead) => (
                        <div
                            key={lead.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Left Column: Contact Info */}
                                <div className="md:w-1/3 space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {lead.first_name} {lead.last_name}
                                            </h3>
                                            <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Calendar size={12} />
                                                {lead.created_at && format(new Date(lead.created_at), "PPP p")}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail size={14} className="text-gray-400" />
                                            <a href={`mailto:${lead.work_email}`} className="hover:text-indigo-600 hover:underline">
                                                {lead.work_email}
                                            </a>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Phone size={14} className="text-gray-400" />
                                            {lead.phone}
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Globe size={14} className="text-gray-400" />
                                            <a href={lead.company_website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 hover:underline truncate max-w-[200px]">
                                                {lead.company_website}
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Details */}
                                <div className="md:w-2/3 grid md:grid-cols-2 gap-6 bg-gray-50 rounded-lg p-4">
                                    <div>
                                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Requirements</h4>
                                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                            {lead.problems_trying_to_solve || "N/A"}
                                        </p>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Target Users</h4>
                                            <Badge variant="outline" className="bg-white">
                                                {lead.users_to_onboard || "N/A"} Users
                                            </Badge>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Timeline</h4>
                                            <Badge variant="outline" className="bg-white">
                                                {lead.timeline || "N/A"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
