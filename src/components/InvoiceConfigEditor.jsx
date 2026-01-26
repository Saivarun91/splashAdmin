"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { invoiceAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function InvoiceConfigEditor({ onClose }) {
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
            }
        } catch (err) {
            console.warn("Invoice config endpoint not available, using defaults:", err.message);
            // Use default config if endpoint doesn't exist yet
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
            // Don't show error, just use defaults
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
            await invoiceAPI.updateConfig(config);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Error saving config:", err);
            setError(err.message || "Failed to save configuration");
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div>
                        <CardTitle className="text-2xl font-bold">Edit Invoice Configuration</CardTitle>
                        <CardDescription className="mt-1">
                            Customize invoice content and settings
                        </CardDescription>
                    </div>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                                    <p className="text-sm text-green-600">Configuration saved successfully!</p>
                                </div>
                            )}

                            {/* Company Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Company Information</h3>
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
                            </div>

                            {/* Payment Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Payment Information</h3>
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
                            </div>

                            {/* Terms and Conditions */}
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

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
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
                </CardContent>
            </Card>
        </div>
    );
}

