import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Delete, Check } from 'lucide-react';

export default function PinLock({ onUnlock, existingPin }) {
  const isSetup = !existingPin;
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(isSetup ? 'create' : 'enter');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const maxLen = 6;

  const handleDigit = (d) => {
    setError('');
    if (step === 'create') {
      if (pin.length < maxLen) setPin(prev => prev + d);
    } else if (step === 'confirm') {
      if (confirmPin.length < maxLen) setConfirmPin(prev => prev + d);
    } else {
      if (pin.length < maxLen) setPin(prev => prev + d);
    }
  };

  const handleDelete = () => {
    if (step === 'confirm') {
      setConfirmPin(prev => prev.slice(0, -1));
    } else {
      setPin(prev => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    if (step === 'create') {
      if (pin.length < 4) { setError('Mínimo 4 dígitos'); return; }
      setStep('confirm');
    } else if (step === 'confirm') {
      if (confirmPin !== pin) {
        setError('PINs não coincidem');
        setShake(true);
        setTimeout(() => { setShake(false); setConfirmPin(''); }, 500);
        return;
      }
      onUnlock(pin);
    } else {
      if (pin === existingPin) {
        onUnlock(null);
      } else {
        setError('PIN incorreto');
        setShake(true);
        setTimeout(() => { setShake(false); setPin(''); }, 500);
      }
    }
  };

  const currentPin = step === 'confirm' ? confirmPin : pin;
  const title = step === 'create' ? 'Crie seu PIN' : step === 'confirm' ? 'Confirme seu PIN' : 'Digite seu PIN';
  const subtitle = step === 'create' ? 'Escolha 4 a 6 dígitos' : step === 'confirm' ? 'Digite novamente para confirmar' : 'Acesse suas finanças';

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8 p-8"
      >
        <motion.div
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-xl flex items-center justify-center">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-white/60 text-sm">{subtitle}</p>

          <div className="flex gap-3 my-4">
            {Array.from({ length: maxLen }).map((_, i) => (
              <motion.div
                key={i}
                animate={currentPin.length > i ? { scale: [1, 1.2, 1] } : {}}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                  currentPin.length > i ? 'bg-white scale-100' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400 text-sm"
              >{error}</motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <motion.button
              key={d}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleDigit(String(d))}
              className="w-18 h-18 rounded-2xl bg-white/10 backdrop-blur text-white text-2xl font-medium flex items-center justify-center hover:bg-white/20 transition-colors"
              style={{ width: 72, height: 72 }}
            >
              {d}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleDelete}
            className="w-18 h-18 rounded-2xl bg-white/5 text-white flex items-center justify-center hover:bg-white/10 transition-colors"
            style={{ width: 72, height: 72 }}
          >
            <Delete className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleDigit('0')}
            className="w-18 h-18 rounded-2xl bg-white/10 backdrop-blur text-white text-2xl font-medium flex items-center justify-center hover:bg-white/20 transition-colors"
            style={{ width: 72, height: 72 }}
          >
            0
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSubmit}
            disabled={currentPin.length < 4}
            className="w-18 h-18 rounded-2xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors disabled:opacity-30"
            style={{ width: 72, height: 72 }}
          >
            <Check className="w-6 h-6" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}