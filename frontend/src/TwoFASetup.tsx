import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldOff, X, Copy, Check } from 'lucide-react';
import axios from 'axios';

interface TwoFASetupProps {
    is2FAEnabled: boolean;
    onClose: () => void;
    onStatusChange: (enabled: boolean) => void;
}

type Step = 'menu' | 'setup' | 'confirm' | 'disable';

export default function TwoFASetup({ is2FAEnabled, onClose, onStatusChange }: TwoFASetupProps) {
    const [step, setStep] = useState<Step>('menu');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const getAuthHeaders = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    const startSetup = async () => {
        setIsLoading(true);
        setError('');
        try {
            const res = await axios.post('/api/2fa/setup', {}, getAuthHeaders());
            setQrCode(res.data.qr_code);
            setSecret(res.data.secret);
            setStep('setup');
        } catch {
            setError('Failed to initialize 2FA setup.');
        } finally {
            setIsLoading(false);
        }
    };

    const confirmSetup = async () => {
        if (code.length !== 6) { setError('Enter a 6-digit code.'); return; }
        setIsLoading(true);
        setError('');
        try {
            await axios.post('/api/2fa/confirm', { totp_code: code }, getAuthHeaders());
            onStatusChange(true);
            setStep('confirm');
        } catch {
            setError('Invalid code. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const disable2FA = async () => {
        if (code.length !== 6) { setError('Enter a 6-digit code.'); return; }
        setIsLoading(true);
        setError('');
        try {
            await axios.post('/api/2fa/disable', { totp_code: code }, getAuthHeaders());
            onStatusChange(false);
            onClose();
        } catch {
            setError('Invalid code. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="bg-slate-950 border border-slate-800/80 rounded-3xl p-8 w-full max-w-md shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
                            <Shield size={20} className="text-blue-400" />
                        </div>
                        <h2 className="text-base font-bold text-slate-100">Two-Factor Authentication</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
                        <X size={18} />
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'menu' && (
                        <motion.div key="menu" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            {is2FAEnabled ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                                        <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-emerald-400">2FA is active</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Your account is protected with an authenticator app.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => { setStep('disable'); setCode(''); setError(''); }}
                                        className="w-full bg-rose-950/40 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                    >
                                        <ShieldOff size={14} /> Disable 2FA
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                        <ShieldOff size={20} className="text-amber-400 shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold text-amber-400">2FA is not enabled</p>
                                            <p className="text-xs text-slate-400 mt-0.5">Add an extra layer of security with an authenticator app.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startSetup}
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-blue-500/10 disabled:opacity-50 border border-blue-400/20"
                                    >
                                        {isLoading ? 'Setting up...' : 'Enable 2FA'}
                                    </button>
                                </div>
                            )}
                            {error && <p className="text-xs text-rose-400 mt-3 text-center">{error}</p>}
                        </motion.div>
                    )}

                    {step === 'setup' && (
                        <motion.div key="setup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Scan this QR code with <span className="text-slate-200 font-medium">Google Authenticator</span>, <span className="text-slate-200 font-medium">Authy</span>, or any TOTP app.
                            </p>
                            <div className="flex justify-center">
                                <div className="bg-white p-3 rounded-2xl shadow-lg">
                                    {qrCode
                                        ? <img src={`data:image/png;base64,${qrCode}`} alt="2FA QR Code" className="w-44 h-44" />
                                        : <div className="w-44 h-44 bg-slate-100 rounded-xl animate-pulse" />
                                    }
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Or enter key manually</p>
                                <div className="flex items-center gap-2 bg-black/40 border border-slate-800 rounded-xl px-3 py-2.5">
                                    <code className="text-xs text-blue-300 flex-1 break-all font-mono">{secret}</code>
                                    <button onClick={copySecret} className="text-slate-500 hover:text-slate-300 transition-colors shrink-0">
                                        {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Enter 6-digit code to confirm</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-blue-500/50 transition-all text-center tracking-[0.4em] font-mono"
                                    placeholder="000000"
                                />
                            </div>
                            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
                            <button
                                onClick={confirmSetup}
                                disabled={isLoading || code.length !== 6}
                                className="w-full bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40 border border-blue-400/20"
                            >
                                {isLoading ? 'Verifying...' : 'Confirm & Enable'}
                            </button>
                        </motion.div>
                    )}

                    {step === 'confirm' && (
                        <motion.div key="confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-4 py-4">
                            <div className="flex justify-center">
                                <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <ShieldCheck size={36} className="text-emerald-400" />
                                </div>
                            </div>
                            <div>
                                <p className="text-base font-bold text-emerald-400">2FA Enabled!</p>
                                <p className="text-xs text-slate-400 mt-1">Your account is now protected. You'll need your authenticator app on next login.</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all"
                            >
                                Done
                            </button>
                        </motion.div>
                    )}

                    {step === 'disable' && (
                        <motion.div key="disable" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                            <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4">
                                <p className="text-sm font-semibold text-rose-400">Disable 2FA</p>
                                <p className="text-xs text-slate-400 mt-1">Enter the current code from your authenticator app to confirm.</p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">Authenticator code</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-black/30 border border-white/[0.06] rounded-xl py-3 px-4 text-sm text-slate-100 placeholder-slate-700 focus:outline-none focus:border-rose-500/50 transition-all text-center tracking-[0.4em] font-mono"
                                    placeholder="000000"
                                />
                            </div>
                            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setStep('menu'); setError(''); }}
                                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={disable2FA}
                                    disabled={isLoading || code.length !== 6}
                                    className="flex-1 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-900/50 text-rose-400 rounded-xl py-3 text-xs font-bold uppercase tracking-widest transition-all disabled:opacity-40"
                                >
                                    {isLoading ? 'Disabling...' : 'Disable'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}