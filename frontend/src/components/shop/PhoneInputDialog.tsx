'use client';

import { useState } from 'react';
import { X, Phone, ArrowRight } from 'lucide-react';

interface PhoneInputDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (phone: string) => void;
    productTitle?: string;
}

export default function PhoneInputDialog({
    isOpen,
    onClose,
    onSubmit,
    productTitle,
}: PhoneInputDialogProps) {
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');

    const validatePhone = (value: string) => {
        // Mongolian phone numbers: 8 digits starting with 8, 9, 7, or 6
        const phoneRegex = /^[6-9]\d{7}$/;
        return phoneRegex.test(value.replace(/\s/g, ''));
    };

    const handleSubmit = () => {
        const cleanPhone = phone.replace(/\s/g, '');

        if (!cleanPhone) {
            setError('Утасны дугаар оруулна уу');
            return;
        }

        if (!validatePhone(cleanPhone)) {
            setError('Зөв утасны дугаар оруулна уу (8 оронтой)');
            return;
        }

        setError('');
        onSubmit(cleanPhone);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 8);
        setPhone(value);
        if (error) setError('');
    };

    const handleClose = () => {
        setPhone('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={handleClose}>
            <div className="relative w-full max-w-md bg-white rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#58CC02]/20 rounded-lg flex items-center justify-center">
                            <Phone size={18} className="text-[#58CC02]" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800 font-nunito">Холбоо барих</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {productTitle && (
                        <p className="text-sm text-gray-500 mb-4 font-nunito">
                            <span className="font-bold text-[#58CC02]">{productTitle}</span> худалдан авахын өмнө утасны дугаараа оруулна уу.
                        </p>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 font-nunito">
                            Утасны дугаар <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="99112233"
                                className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 font-nunito text-lg tracking-wider
                                    ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-[#58CC02]'}
                                    focus:outline-none transition-colors`}
                                autoFocus
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-red-500 font-nunito">{error}</p>
                        )}
                        <p className="text-xs text-gray-400 font-nunito">
                            Захиалгын мэдээлэл энэ дугаар руу илгээгдэнэ
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handleSubmit}
                        disabled={!phone}
                        className={`w-full py-3 px-6 rounded-xl font-bold font-nunito flex items-center justify-center gap-2 transition-all
                            ${phone
                                ? 'bg-[#58CC02] text-white hover:bg-[#4CAF00] shadow-lg shadow-[#58CC02]/30'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Үргэлжлүүлэх
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
