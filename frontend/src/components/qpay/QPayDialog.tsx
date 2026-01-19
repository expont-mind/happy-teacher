'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Loader2, CheckCircle, XCircle, Smartphone } from 'lucide-react';

interface QPayLink {
    name: string;
    description: string;
    logo: string;
    link: string;
}

interface QPayDialogProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: () => void;
    onError?: (error: string) => void;
    topicKey?: string;
    childIds?: string[];
    userId?: string;
}

type PaymentStatus = 'idle' | 'creating' | 'waiting' | 'checking' | 'success' | 'error' | 'expired';

export default function QPayDialog({
    isOpen,
    onClose,
    amount,
    onSuccess,
    onError,
    topicKey,
    childIds,
    userId,
}: QPayDialogProps) {
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [qrImage, setQrImage] = useState<string>('');
    const [qrCode, setQrCode] = useState<string>('');
    const [links, setLinks] = useState<QPayLink[]>([]);
    const [invoiceId, setInvoiceId] = useState<string>('');
    const [transactionId, setTransactionId] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showAllBanks, setShowAllBanks] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Утас эсэхийг шалгах
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor;
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            // Screen width-ээр бас шалгах (tablet-г desktop гэж тооцно)
            const isSmallScreen = window.innerWidth < 768;
            setIsMobile(mobileRegex.test(userAgent) && isSmallScreen);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Түгээмэл ашиглагддаг банкуудыг эхэнд харуулах
    const popularBanks = ['Khan bank', 'Social Pay', 'M bank', 'Trade and Development bank', 'Most money', 'qPay wallet'];

    const sortedLinks = [...links].sort((a, b) => {
        const aPopular = popularBanks.includes(a.name) ? 0 : 1;
        const bPopular = popularBanks.includes(b.name) ? 0 : 1;
        return aPopular - bPopular;
    });

    const displayedLinks = showAllBanks ? sortedLinks : sortedLinks.slice(0, 6);

    // Invoice үүсгэх
    const createInvoice = useCallback(async () => {
        setStatus('creating');
        setErrorMessage('');

        try {
            const response = await fetch('/api/bonum/qpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Invoice үүсгэхэд алдаа гарлаа');
            }

            setQrImage(data.qrImage);
            setQrCode(data.qrCode);
            setLinks(data.links || []);
            setInvoiceId(data.invoiceId);
            setTransactionId(data.transactionId);
            setStatus('waiting');

            // localStorage-д хадгалах (callback-д хэрэглэнэ)
            localStorage.setItem(`qpay_invoice_${data.transactionId}`, data.invoiceId);
            localStorage.setItem('qpay_latest_qrcode', data.qrCode);

        } catch (error) {
            console.error('Error creating invoice:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Алдаа гарлаа');
            setStatus('error');
            onError?.(error instanceof Error ? error.message : 'Алдаа гарлаа');
        }
    }, [amount, onError]);

    // Төлбөр шалгах
    const checkPaymentStatus = useCallback(async () => {
        if (!qrCode) return false;

        try {
            const response = await fetch('/api/bonum/get-invoice-status-qpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ qrCode }),
            });

            const data = await response.json();

            if (data.isPaid) {
                setStatus('success');

                // Purchase хадгалах
                if (topicKey && userId && childIds && childIds.length > 0) {
                    await fetch('/api/bonum/save-purchase', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId,
                            topicKey,
                            invoiceId,
                            childIds: childIds.join(','),
                        }),
                    });
                }

                // localStorage цэвэрлэх
                localStorage.removeItem(`qpay_invoice_${transactionId}`);
                localStorage.removeItem('qpay_latest_qrcode');

                onSuccess();
                return true;
            }

            if (data.status === 'EXPIRED') {
                setStatus('expired');
                setErrorMessage('Төлбөрийн хугацаа дууссан');
                return true;
            }

            return false;
        } catch (error) {
            console.error('Error checking payment:', error);
            return false;
        }
    }, [qrCode, topicKey, userId, childIds, invoiceId, transactionId, onSuccess]);

    // Dialog нээгдэхэд invoice үүсгэх
    useEffect(() => {
        if (isOpen && status === 'idle') {
            createInvoice();
        }
    }, [isOpen, status, createInvoice]);

    // Төлбөр шалгах polling (3 секунд тутам)
    useEffect(() => {
        if (status !== 'waiting') return;

        const interval = setInterval(async () => {
            setStatus('checking');
            const isDone = await checkPaymentStatus();
            if (!isDone) {
                setStatus('waiting');
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [status, checkPaymentStatus]);

    // Dialog хаахад reset хийх
    useEffect(() => {
        if (!isOpen) {
            setStatus('idle');
            setQrImage('');
            setQrCode('');
            setLinks([]);
            setInvoiceId('');
            setTransactionId('');
            setErrorMessage('');
            setShowAllBanks(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-3xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 shadow-2xl max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#58CC02]/20 rounded-lg flex items-center justify-center">
                            <Smartphone size={18} className="text-[#58CC02]" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">QPay Төлбөр</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Loading */}
                    {status === 'creating' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 size={48} className="text-[#58CC02] animate-spin" />
                            <p className="mt-4 text-gray-600">QR код үүсгэж байна...</p>
                        </div>
                    )}

                    {/* Error */}
                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <XCircle size={48} className="text-red-500" />
                            <p className="mt-4 text-red-600 font-medium">{errorMessage}</p>
                            <button
                                onClick={createInvoice}
                                className="mt-4 px-6 py-2 bg-[#58CC02] text-white rounded-xl font-medium hover:bg-[#4CAF00] transition"
                            >
                                Дахин оролдох
                            </button>
                        </div>
                    )}

                    {/* Expired */}
                    {status === 'expired' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <XCircle size={48} className="text-orange-500" />
                            <p className="mt-4 text-orange-600 font-medium">Төлбөрийн хугацаа дууссан</p>
                            <button
                                onClick={() => {
                                    setStatus('idle');
                                    createInvoice();
                                }}
                                className="mt-4 px-6 py-2 bg-[#58CC02] text-white rounded-xl font-medium hover:bg-[#4CAF00] transition"
                            >
                                Шинэ QR үүсгэх
                            </button>
                        </div>
                    )}

                    {/* Success */}
                    {status === 'success' && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <CheckCircle size={64} className="text-green-500" />
                            <p className="mt-4 text-green-600 font-bold text-xl">Төлбөр амжилттай!</p>
                            <p className="mt-2 text-gray-500">Таны худалдан авалт баталгаажлаа</p>
                        </div>
                    )}

                    {/* QR Code & Banks */}
                    {(status === 'waiting' || status === 'checking') && (
                        <>
                            {/* Amount */}
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-500">Төлөх дүн</p>
                                <p className="text-3xl font-black text-gray-800">
                                    {amount.toLocaleString()}₮
                                </p>
                            </div>

                            {/* QR Code */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 shadow-sm">
                                    {qrImage && (
                                        <Image
                                            src={`data:image/png;base64,${qrImage}`}
                                            alt="QPay QR Code"
                                            width={200}
                                            height={200}
                                            className="rounded-lg"
                                        />
                                    )}
                                </div>
                                <div className="flex items-center gap-2 mt-3">
                                    <Loader2 size={16} className="text-[#58CC02] animate-spin" />
                                    <p className="text-sm text-[#58CC02]">Төлбөр шалгаж байна...</p>
                                </div>
                            </div>

                            {/* Divider & Bank Links - Mobile only */}
                            {isMobile && (
                                <>
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex-1 h-px bg-gray-200" />
                                        <span className="text-sm text-gray-400">эсвэл</span>
                                        <div className="flex-1 h-px bg-gray-200" />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-gray-700 mb-3">
                                            Банкны апп сонгох
                                        </p>
                                        <div className="grid grid-cols-3 gap-2">
                                            {displayedLinks.map((bank) => (
                                                <a
                                                    key={bank.name}
                                                    href={bank.link}
                                                    className="flex flex-col items-center p-3 rounded-xl border border-gray-200 hover:border-[#58CC02]/50 hover:bg-[#58CC02]/10 transition-all"
                                                >
                                                    <Image
                                                        src={bank.logo}
                                                        alt={bank.name}
                                                        width={40}
                                                        height={40}
                                                        className="rounded-lg"
                                                    />
                                                    <span className="text-xs text-gray-600 mt-2 text-center line-clamp-1">
                                                        {bank.description}
                                                    </span>
                                                </a>
                                            ))}
                                        </div>

                                        {links.length > 6 && (
                                            <button
                                                onClick={() => setShowAllBanks(!showAllBanks)}
                                                className="w-full mt-3 py-2 text-sm text-[#58CC02] font-medium hover:bg-[#58CC02]/10 rounded-lg transition"
                                            >
                                                {showAllBanks ? 'Хураах' : `Бүх банк харах (${links.length})`}
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {(status === 'waiting' || status === 'checking') && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-400 text-center">
                            Төлбөр төлөгдсөний дараа автоматаар баталгаажна
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
