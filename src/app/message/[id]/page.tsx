'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MessagePageProps {
  params: {
    id: string;
  };
}

export default function MessagePage({ params }: MessagePageProps) {
  const [message, setMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessage() {
      try {
        const messageDoc = await getDoc(doc(db, 'messages', params.id));
        if (messageDoc.exists()) {
          setMessage(messageDoc.data());
        } else {
          setError('Message not found');
        }
      } catch (err) {
        setError('Error loading message');
      } finally {
        setLoading(false);
      }
    }

    fetchMessage();
  }, [params.id]);

  if (loading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>A Message for {message.recipient}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {message.senderName && (
            <div className="mt-4 text-right text-gray-600">
              From: {message.senderName}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 