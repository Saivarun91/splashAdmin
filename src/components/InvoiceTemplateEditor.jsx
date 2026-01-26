"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, FileText } from "lucide-react";
import { invoiceAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function InvoiceTemplateEditor({ onClose }) {
    const [template, setTemplate] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchTemplate();
    }, []);

    const fetchTemplate = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await invoiceAPI.getTemplate();
            setTemplate(data.template || getDefaultTemplate());
        } catch (err) {
            console.warn("Invoice template endpoint not available, using default template:", err.message);
            // Use default template if endpoint doesn't exist yet
            setTemplate(getDefaultTemplate());
            // Don't show error, just use defaults
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultTemplate = () => {
        return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            background: white;
            padding: 48px;
            position: relative;
            overflow-x: hidden;
        }
        .hexagon-pattern {
            position: absolute;
            width: 256px;
            height: 256px;
            opacity: 0.1;
            pointer-events: none;
            background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0 L93.3 25 L93.3 75 L50 100 L6.7 75 L6.7 25 Z' fill='%23884cff'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 40px 40px;
        }
        .hex-top-right { top: 0; right: 0; }
        .hex-bottom-left { bottom: 0; left: 0; }
        .header-section {
            display: flex;
            justify-between;
            align-items: flex-start;
            margin-bottom: 32px;
            position: relative;
        }
        .logo-section {
            flex: 1;
        }
        .logo-main {
            font-size: 36px;
            font-weight: bold;
            font-family: cursive, serif;
            margin-bottom: 4px;
        }
        .logo-splash { color: black; }
        .logo-s { color: #884cff; }
        .logo-subtitle {
            font-size: 14px;
            font-weight: 600;
            color: black;
            letter-spacing: 1px;
        }
        .invoice-title-section {
            flex: 1;
            position: relative;
        }
        .purple-bar {
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 48px;
            background: #884cff;
            opacity: 0.9;
        }
        .invoice-content {
            position: relative;
            z-index: 10;
            padding-right: 24px;
            padding-top: 8px;
        }
        .invoice-title {
            font-size: 64px;
            font-weight: bold;
            color: white;
            margin-bottom: 16px;
        }
        .invoice-details {
            text-align: right;
            color: white;
            font-size: 14px;
        }
        .invoice-details p {
            margin: 4px 0;
        }
        .billed-to-section {
            margin-bottom: 32px;
        }
        .billed-to-title {
            font-weight: bold;
            color: black;
            font-size: 18px;
            margin-bottom: 12px;
        }
        .client-info {
            color: black;
        }
        .client-name {
            font-weight: 600;
            font-size: 18px;
            margin-bottom: 4px;
        }
        .client-details {
            font-size: 14px;
            line-height: 1.6;
        }
        .items-table {
            margin-bottom: 24px;
        }
        .table-header {
            background: #884cff;
            color: white;
            padding: 12px 24px;
            display: flex;
            align-items: center;
        }
        .table-header-items { flex: 1; text-align: left; font-weight: 600; }
        .table-header-qty { width: 96px; text-align: center; font-weight: 600; }
        .table-header-price { width: 128px; text-align: center; font-weight: 600; }
        .table-header-total { width: 128px; text-align: right; font-weight: 600; }
        .table-body {
            border: 1px solid #e5e7eb;
        }
        .table-row {
            display: flex;
            align-items: center;
            padding: 16px 24px;
            border-bottom: 1px solid #e5e7eb;
        }
        .table-row-items { flex: 1; color: black; }
        .table-row-qty { width: 96px; text-align: center; color: black; }
        .table-row-price { width: 128px; text-align: center; color: black; }
        .table-row-total { width: 128px; text-align: right; color: black; font-weight: 600; }
        .item-name { font-weight: 500; }
        .total-bar {
            background: #884cff;
            color: white;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .total-label, .total-amount {
            font-weight: bold;
            font-size: 18px;
        }
        .footer-section {
            margin-top: 48px;
        }
        .thank-you {
            text-align: center;
            color: black;
            font-weight: 500;
            font-size: 18px;
            margin-bottom: 24px;
        }
        .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 32px;
            margin-bottom: 32px;
        }
        .footer-section-title {
            font-weight: bold;
            color: black;
            margin-bottom: 8px;
        }
        .footer-content {
            color: black;
            font-size: 14px;
            line-height: 1.8;
        }
        .footer-content p {
            margin: 4px 0;
        }
        .company-footer {
            text-align: right;
            margin-top: 32px;
        }
        .company-name {
            color: black;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="hexagon-pattern hex-top-right"></div>
    <div class="hexagon-pattern hex-bottom-left"></div>
    
    <div class="header-section">
        <div class="logo-section">
            <div class="logo-main">
                <span class="logo-splash">Spla</span><span class="logo-s">s</span><span class="logo-splash">h</span>
            </div>
            <div class="logo-subtitle">AI STUDIO</div>
        </div>
        <div class="invoice-title-section">
            <div class="purple-bar"></div>
            <div class="invoice-content">
                <div class="invoice-title">INVOICE</div>
                <div class="invoice-details">
                    <p>Invoice #: <strong>{{invoice_number}}</strong></p>
                    <p>Date: <strong>{{date}}</strong></p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="billed-to-section">
        <div class="billed-to-title">Billed to:</div>
        <div class="client-info">
            <div class="client-name">{{client_name}}</div>
            <div class="client-details">
                <p>{{client_address}}</p>
                <p>{{client_phone}}</p>
            </div>
        </div>
    </div>
    
    <div class="items-table">
        <div class="table-header">
            <div class="table-header-items">Items</div>
            <div class="table-header-qty">Quantity</div>
            <div class="table-header-price">Unit Price</div>
            <div class="table-header-total">Total</div>
        </div>
        <div class="table-body">
            <div class="table-row">
                <div class="table-row-items">
                    <div class="item-name">{{plan_name}}</div>
                </div>
                <div class="table-row-qty">1</div>
                <div class="table-row-price">${{amount}}</div>
                <div class="table-row-total">${{amount}}</div>
            </div>
            <div class="table-row">
                <div class="table-row-items">
                    <div class="item-name">Gst</div>
                </div>
                <div class="table-row-qty">{{tax_rate}}%</div>
                <div class="table-row-price">${{tax}}</div>
                <div class="table-row-total">${{tax}}</div>
            </div>
        </div>
        <div class="total-bar">
            <span class="total-label">Total</span>
            <span class="total-amount">${{total}}</span>
        </div>
    </div>
    
    <div class="footer-section">
        <div class="thank-you">Thank you for your business</div>
        <div class="footer-grid">
            <div>
                <div class="footer-section-title">Payment Information</div>
                <div class="footer-content">
                    <p>Bank Name: <strong>{{bank_name}}</strong></p>
                    <p>Account Name: <strong>{{account_name}}</strong></p>
                    <p>Account No.: <strong>{{account_number}}</strong></p>
                    <p>Pay by: <strong>{{pay_by_date}}</strong></p>
                </div>
            </div>
            <div>
                <div class="footer-section-title">Terms and conditions</div>
                <div class="footer-content">
                    <p>{{terms_and_conditions}}</p>
                </div>
            </div>
        </div>
        <div class="company-footer">
            <div class="company-name">{{company_name}}</div>
        </div>
    </div>
</body>
</html>`;
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);
            await invoiceAPI.updateTemplate(template);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Error saving template:", err);
            setError(err.message || "Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col bg-card">
                <CardHeader className="flex flex-row items-center justify-between border-b">
                    <div>
                        <CardTitle className="text-2xl font-bold">Edit Invoice Template</CardTitle>
                        <CardDescription className="mt-1">
                            Customize the invoice template using HTML. Use variables like {{invoice_number}}, {{date}}, {{organization_name}}, etc.
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
                        <div className="space-y-4">
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                                    <p className="text-sm text-destructive">{error}</p>
                                </div>
                            )}
                            {success && (
                                <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
                                    <p className="text-sm text-green-600">Template saved successfully!</p>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="template">Invoice Template (HTML)</Label>
                                <Textarea
                                    id="template"
                                    value={template}
                                    onChange={(e) => setTemplate(e.target.value)}
                                    className="font-mono text-sm min-h-[500px]"
                                    placeholder="Enter HTML template..."
                                />
                            </div>
                            
                            <div className="p-4 bg-muted rounded-lg">
                                <h4 className="font-semibold text-sm mb-2">Available Variables:</h4>
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>
                                        <p className="font-semibold mb-1">Invoice Details:</p>
                                        <ul className="space-y-1 list-disc list-inside ml-2">
                                            <li><code>{'{{invoice_number}}'}</code> - Invoice number</li>
                                            <li><code>{'{{date}}'}</code> - Invoice date</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Client Information:</p>
                                        <ul className="space-y-1 list-disc list-inside ml-2">
                                            <li><code>{'{{client_name}}'}</code> - Client name</li>
                                            <li><code>{'{{client_address}}'}</code> - Client address</li>
                                            <li><code>{'{{client_phone}}'}</code> - Client phone</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Payment Details:</p>
                                        <ul className="space-y-1 list-disc list-inside ml-2">
                                            <li><code>{'{{plan_name}}'}</code> - Plan name</li>
                                            <li><code>{'{{amount}}'}</code> - Amount (without tax)</li>
                                            <li><code>{'{{tax_rate}}'}</code> - Tax rate (%)</li>
                                            <li><code>{'{{tax}}'}</code> - Tax amount</li>
                                            <li><code>{'{{total}}'}</code> - Total amount</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-1">Company & Payment Info:</p>
                                        <ul className="space-y-1 list-disc list-inside ml-2">
                                            <li><code>{'{{company_name}}'}</code> - Company name</li>
                                            <li><code>{'{{bank_name}}'}</code> - Bank name</li>
                                            <li><code>{'{{account_name}}'}</code> - Account name</li>
                                            <li><code>{'{{account_number}}'}</code> - Account number</li>
                                            <li><code>{'{{pay_by_date}}'}</code> - Pay by date</li>
                                            <li><code>{'{{terms_and_conditions}}'}</code> - Terms</li>
                                        </ul>
                                    </div>
                                </div>
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
                                            Save Template
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

