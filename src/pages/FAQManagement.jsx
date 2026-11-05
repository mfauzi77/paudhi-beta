import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import apiService from '../utils/apiService';

const FAQManagement = () => {
  const [faqs, setFaqs] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [faqLoading, setFaqLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'dasar',
    tags: ''
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setFaqLoading(true);
      const data = await apiService.getFAQs();
      setFaqs(data || []);
    } catch (error) {
      console.error('Error fetching FAQs:', error);
      alert('Gagal memuat FAQ: ' + error.message);
    } finally {
      setFaqLoading(false);
    }
  };

  const resetForm = () => {
    setFaqForm({
      question: '',
      answer: '',
      category: 'dasar',
      tags: ''
    });
    setEditingFAQ(null);
    setShowCreateForm(false);
  };

  const handleCreateFAQ = async () => {
    try {
      setFormLoading(true);
      const faqData = {
        ...faqForm,
        tags: faqForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const response = await apiService.createFAQ(faqData);
      
      if (response.faq) {
        setFaqs([response.faq, ...faqs]);
        resetForm();
        alert('FAQ berhasil dibuat!');
      }
    } catch (error) {
      console.error('Create FAQ error:', error);
      alert('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditFAQ = async () => {
    try {
      setFormLoading(true);
      const faqData = {
        ...faqForm,
        tags: faqForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      
      const response = await apiService.updateFAQ(editingFAQ._id, faqData);
      
      if (response.faq) {
        const updatedFAQs = faqs.map(item => 
          item._id === editingFAQ._id ? response.faq : item
        );
        setFaqs(updatedFAQs);
        resetForm();
        alert('FAQ berhasil diupdate!');
      }
    } catch (error) {
      console.error('Update FAQ error:', error);
      alert('Error: ' + error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteFAQ = async (id) => {
    if (window.confirm('Yakin ingin menghapus FAQ ini?')) {
      try {
        await apiService.deleteFAQ(id);
        setFaqs(faqs.filter(item => item._id !== id));
        alert('FAQ berhasil dihapus!');
      } catch (error) {
        console.error('Delete FAQ error:', error);
        alert('Error: ' + error.message);
      }
    }
  };

  const openCreateForm = () => {
    resetForm();
    setShowCreateForm(true);
  };

  const openEditForm = (faqItem) => {
    setFaqForm({
      question: faqItem.question,
      answer: faqItem.answer,
      category: faqItem.category,
      tags: Array.isArray(faqItem.tags) ? faqItem.tags.join(', ') : ''
    });
    setEditingFAQ(faqItem);
    setShowCreateForm(true);
  };

  const FAQFormModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">
              {editingFAQ ? 'Edit FAQ' : 'Buat FAQ Baru'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pertanyaan *</label>
              <input
                type="text"
                value={faqForm.question}
                onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Masukkan pertanyaan..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Jawaban *</label>
              <textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="6"
                placeholder="Masukkan jawaban..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Kategori</label>
              <select
                value={faqForm.category}
                onChange={(e) => setFaqForm({...faqForm, category: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="dasar">Info Dasar</option>
                <option value="daftar">Cara Daftar</option>
                <option value="praktis">Tips Praktis</option>
                <option value="masalah">Solusi Masalah</option>
                <option value="teknis">Bantuan Website</option>
                <option value="pemerintah">Untuk Penyelenggara</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags (pisahkan dengan koma)</label>
              <input
                type="text"
                value={faqForm.tags}
                onChange={(e) => setFaqForm({...faqForm, tags: e.target.value})}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={editingFAQ ? handleEditFAQ : handleCreateFAQ}
              disabled={formLoading || !faqForm.question || !faqForm.answer}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {formLoading ? 'Menyimpan...' : (editingFAQ ? 'Update' : 'Simpan')}
            </button>
            <button
              onClick={resetForm}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (faqLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen FAQ</h2>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3">Memuat FAQ...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Manajemen FAQ ({faqs.length})</h2>
        <button 
          onClick={openCreateForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah FAQ
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pertanyaan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {faqs.map((faq) => (
              <tr key={faq._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs truncate">{faq.question}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {faq.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {faq.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => openEditForm(faq)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFAQ(faq._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {faqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Belum ada FAQ. Klik "Tambah FAQ" untuk mulai.</p>
          </div>
        )}
      </div>

      {showCreateForm && <FAQFormModal />}
    </div>
  );
};

export default FAQManagement;