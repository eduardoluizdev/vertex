import { notFound } from 'next/navigation';
import { PublicProposalView } from './public-proposal-view';

const API_URL = process.env.API_URL || 'https://api.vertexhub.dev';

interface PublicProposalPageProps {
  params: Promise<{ token: string }>;
}

export default async function PublicProposalPage({ params }: PublicProposalPageProps) {
  const { token } = await params;

  const res = await fetch(`${API_URL}/v1/public/proposals/${token}`, {
    cache: 'no-store',
  });

  if (!res.ok) notFound();

  const proposal = await res.json();

  return <PublicProposalView proposal={proposal} />;
}

export const metadata = {
  title: 'Proposta Comercial',
  description: 'Visualize e responda à proposta comercial.',
};
