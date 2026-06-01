import React, { useState, useEffect } from 'react';
import { madingService } from './madingService';
import PageHeader from '../../components/layout/PageHeader';
import MadingBoard from '../../components/mading/MadingBoard';
import MessageForm from '../../components/mading/MessageForm';
import Loading from '../../components/common/Loading';

export default function MadingPage() {
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    madingService.getNotes()
      .then((data) => {
        setNotes(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  const handlePostSubmit = async (formData) => {
    setIsPosting(true);
    try {
      const newNote = await madingService.postNote(formData);
      // Prepend to local notes list for instant response
      setNotes((prev) => [newNote, ...prev]);
      setIsPosting(false);
    } catch (err) {
      console.error(err);
      setIsPosting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Papan Mading Komunitas"
        subtitle="Tempelkan pesan dukungan hangat Anda, candaan bersahabat, atau kreasi kreatif digital di papan mading corkboard interaktif Intanium!"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Posting input form panel */}
        <div className="lg:col-span-1">
          <MessageForm onSubmit={handlePostSubmit} isSubmitting={isPosting} />
        </div>

        {/* Digital corkboard notes grid list */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <Loading message="Mengunduh pesan mading..." />
          ) : (
            <MadingBoard notes={notes} isLoading={isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
