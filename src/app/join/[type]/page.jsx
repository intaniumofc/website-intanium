'use client';

import { useState, useEffect } from 'react';
import { useParams, notFound } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { joinService } from '@/services/public/joinService';
import FormShell from '@/components/join/FormShell';
import MemberForm from '@/components/join/MemberForm';
import AdminForm from '@/components/join/AdminForm';
import VolunteerForm from '@/components/join/VolunteerForm';

const VALID_TYPES = ['member', 'admin', 'volunteer'];

const DEFAULT_TITLES = {
  member: 'Open Member IntaniumOFC',
  admin: 'Recruitment Admin Intanium',
  volunteer: 'Open Volunteer Event'
};

export default function JoinFormPage() {
  const params = useParams();
  const type = params?.type;

  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    let active = true;
    joinService.getJoinSettings().then((res) => {
      if (active) {
        setSettings(res);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  if (!VALID_TYPES.includes(type)) {
    notFound();
  }

  const currentSetting = settings?.[type] || {
    status: 'open',
    title: DEFAULT_TITLES[type],
    description: ''
  };

  const isClosed = currentSetting.status === 'closed';

  return (
    <MainLayout>
      <FormShell
        type={type}
        isLoading={isLoading}
        isClosed={isClosed}
        isSubmitted={isSubmitted}
        onReset={() => setIsSubmitted(false)}
        title={currentSetting.title}
        description={currentSetting.description}
      >
        {type === 'member' && (
          <MemberForm settings={settings} onSubmitted={() => setIsSubmitted(true)} />
        )}
        {type === 'admin' && (
          <AdminForm settings={settings} onSubmitted={() => setIsSubmitted(true)} />
        )}
        {type === 'volunteer' && (
          <VolunteerForm settings={settings} onSubmitted={() => setIsSubmitted(true)} />
        )}
      </FormShell>
    </MainLayout>
  );
}
