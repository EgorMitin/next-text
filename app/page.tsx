import Pagination from './ui/words/pagination';
import Search from './ui/search';
import Table from './ui/words/table';
import { CreateWord } from './ui/words/buttons';
import { lusitana } from './ui/fonts';
import { WordsTableSkeleton } from './ui/skeletons';
import { Suspense } from 'react';
import { fetchWordsPages } from './lib/data';

export default async function Page(props: {
    searchParams?: Promise<{
        query?: string;
        page?: string;
    }>
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchWordsPages(query);

  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search words..." />
        <CreateWord />
      </div>
       <Suspense key={query + currentPage} fallback={<WordsTableSkeleton />}>
        <Table query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </div>
  );
}