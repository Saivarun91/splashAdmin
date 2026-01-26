'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { invoiceAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function InvoiceSettingsPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        company_name: "",
        invoice_prefix: "",
        tax_rate: 18,
        bank_name: "",
        account_name: "",
        account_number: "",
        pay_by_date: "",
        terms_and_conditions: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Try to load from localStorage first (fallback)
            const localConfig = localStorage.getItem('invoice_config');
            if (localConfig) {
                try {
                    const parsed = JSON.parse(localConfig);
                    setConfig(parsed);
                } catch (e) {
                    console.warn("Failed to parse local config:", e);
                }
            }
            
            const data = await invoiceAPI.getConfig();
            if (data) {
                setConfig({
                    company_name: data.company_name || "Splash Ai Studio",
                    invoice_prefix: data.invoice_prefix || "INV-",
                    tax_rate: data.tax_rate || 18,
                    bank_name: data.bank_name || "Borcelle Bank",
                    account_name: data.account_name || "Studio Shodwe",
                    account_number: data.account_number || "123-456-7890",
                    pay_by_date: data.pay_by_date || "",
                    terms_and_conditions: data.terms_and_conditions || "Late payments may result in a 2% penalty fee.",
                });
                // Update localStorage with server data
                localStorage.setItem('invoice_config', JSON.stringify({
                    company_name: data.company_name || "Splash Ai Studio",
                    invoice_prefix: data.invoice_prefix || "INV-",
                    tax_rate: data.tax_rate || 18,
                    bank_name: data.bank_name || "Borcelle Bank",
                    account_name: data.account_name || "Studio Shodwe",
                    account_number: data.account_number || "123-456-7890",
                    pay_by_date: data.pay_by_date || "",
                    terms_and_conditions: data.terms_and_conditions || "Late payments may result in a 2% penalty fee.",
                }));
            }
        } catch (err) {
            console.warn("Invoice config endpoint not available, using defaults or local storage:", err.message);
            
            // If we have local storage, use it, otherwise use defaults
            const localConfig = localStorage.getItem('invoice_config');
            if (localConfig) {
                try {
                    const parsed = JSON.parse(localConfig);
                    setConfig(parsed);
                } catch (e) {
                    // If parsing fails, use defaults
                    setConfig({
                        company_name: "Splash Ai Studio",
                        invoice_prefix: "INV-",
                        tax_rate: 18,
                        bank_name: "Borcelle Bank",
                        account_name: "Studio Shodwe",
                        account_number: "123-456-7890",
                        pay_by_date: "",
                        terms_and_conditions: "Late payments may result in a 2% penalty fee.",
                    });
                }
            } else {
                setConfig({
                    company_name: "Splash Ai Studio",
                    invoice_prefix: "INV-",
                    tax_rate: 18,
                    bank_name: "Borcelle Bank",
                    account_name: "Studio Shodwe",
                    account_number: "123-456-7890",
                    pay_by_date: "",
                    terms_and_conditions: "Late payments may result in a 2% penalty fee.",
                });
            }
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            
            console.log("Saving config:", config);
            
            const response = await invoiceAPI.updateConfig(config);
            console.log("Save response:", response);
            
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
            }, 3000);
        } catch (err) {
            console.error("Error saving config:", err);
            
            // Check if it's a 404 (endpoint not implemented)
            if (err.message && (err.message.includes("404") || err.message.includes("Not Found"))) {
                // Store in localStorage as fallback until backend is ready
                try {
                    localStorage.setItem('invoice_config', JSON.stringify(config));
                    setSuccess(true);
                    setError(null);
                    // Show success message with info about local storage
                    setTimeout(() => {
                        setSuccess(false);
                    }, 5000);
                } catch (storageErr) {
                    setError("Backend endpoint not yet implemented. Please implement the /api/invoices/config/ PUT endpoint in the backend.");
                }
            } else {
                const errorMessage = err.message || err.error || "Failed to save configuration";
                setError(errorMessage);
                
                // Show error for longer so user can see it
                setTimeout(() => {
                    setError(null);
                }, 5000);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    onClick={() => router.back()}
                    variant="outline"
                    size="icon"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Invoice Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Customize invoice content and settings
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                            <p className="text-sm text-green-800 dark:text-green-300 font-semibold">
                                Configuration saved successfully!
                            </p>
                            <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                                Note: Backend endpoint not yet implemented. Configuration saved to local storage temporarily.
                            </p>
                        </div>
                    )}

                    {/* Company Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Company Information</CardTitle>
                            <CardDescription>Update company details for invoices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name">Company Name</Label>
                                    <Input
                                        id="company_name"
                                        value={config.company_name}
                                        onChange={(e) => handleChange("company_name", e.target.value)}
                                        placeholder="Splash Ai Studio"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                                    <Input
                                        id="invoice_prefix"
                                        value={config.invoice_prefix}
                                        onChange={(e) => handleChange("invoice_prefix", e.target.value)}
                                        placeholder="INV-"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                                    <Input
                                        id="tax_rate"
                                        type="number"
                                        value={config.tax_rate}
                                        onChange={(e) => handleChange("tax_rate", parseFloat(e.target.value) || 0)}
                                        placeholder="18"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                            <CardDescription>Bank and payment details for invoices</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="bank_name">Bank Name</Label>
                                    <Input
                                        id="bank_name"
                                        value={config.bank_name}
                                        onChange={(e) => handleChange("bank_name", e.target.value)}
                                        placeholder="Borcelle Bank"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_name">Account Name</Label>
                                    <Input
                                        id="account_name"
                                        value={config.account_name}
                                        onChange={(e) => handleChange("account_name", e.target.value)}
                                        placeholder="Studio Shodwe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="account_number">Account Number</Label>
                                    <Input
                                        id="account_number"
                                        value={config.account_number}
                                        onChange={(e) => handleChange("account_number", e.target.value)}
                                        placeholder="123-456-7890"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pay_by_date">Pay By Date (days from invoice)</Label>
                                    <Input
                                        id="pay_by_date"
                                        type="number"
                                        value={config.pay_by_date}
                                        onChange={(e) => handleChange("pay_by_date", e.target.value)}
                                        placeholder="30"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Terms and Conditions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Terms and Conditions</CardTitle>
                            <CardDescription>Default terms for invoices</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <Label htmlFor="terms_and_conditions">Terms and Conditions</Label>
                                <Textarea
                                    id="terms_and_conditions"
                                    value={config.terms_and_conditions}
                                    onChange={(e) => handleChange("terms_and_conditions", e.target.value)}
                                    placeholder="Late payments may result in a 2% penalty fee."
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                console.log("Save button clicked");
                                handleSave();
                            }}
                            disabled={saving || loading}
                            type="button"
                            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Configuration
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

