import React, { useState } from 'react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(feedback);
    setFeedback('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-auto p-6 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit}>
          <h3 id="feedback-modal-title" className="text-lg font-bold text-gray-900">
            Bantu Kami Menyempurnakan Analisis
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Apa yang membuat analisis sebelumnya kurang tepat? Masukan Anda akan digunakan untuk analisis ulang.
          </p>
          
          <div className="mt-4">
            <label htmlFor="feedback-textarea" className="sr-only">Feedback</label>
            <textarea
              id="feedback-textarea"
              rows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-2 text-sm text-slate-800 border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              placeholder="Contoh: Analisis tidak mempertimbangkan adanya program bantuan pangan lokal yang baru dimulai bulan lalu."
              required
            />
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 text-sm font-semibold text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={!feedback.trim()}
            >
              Kirim & Analisis Ulang
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;