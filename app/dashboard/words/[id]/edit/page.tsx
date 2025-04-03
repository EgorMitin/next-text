import Form from '@/app/ui/words/edit-form';
import Breadcrumbs from '@/app/ui/words/breadcrumbs';
import { fetchWordById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page(props: { params: Promise<{ id: string }>}) {
  const params = await props.params;
  const id = params.id;
  const word = await fetchWordById(id)

  if (!word) {
    notFound();
  }

  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Words', href: '/' },
          {
            label: 'Edit Word',
            href: `/dashboard/word/${id}/edit`,
            active: true,
          },
        ]}
      />
      <Form word={word} />
    </main>
  );
}