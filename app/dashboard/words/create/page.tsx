import Form from '@/app/ui/words/create-form';
import Breadcrumbs from '@/app/ui/words/breadcrumbs';
 
export default async function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Words', href: '/' },
          {
            label: 'Create Word',
            href: '/dashboard/words/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}