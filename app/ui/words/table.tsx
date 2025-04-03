import { BookOpenIcon, PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteWord } from '@/app/lib/actions';
import Link from 'next/link';
import { fetchFilteredWords } from '@/app/lib/data';

export default async function WordsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const words = await fetchFilteredWords(query, currentPage);

  return (
    <div className="mt-6 flow-root">
      <div className="inline-block min-w-full align-middle">
        <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
          <div className="md:hidden">
            {words?.map((word) => (
              <div
                key={word.id}
                className="mb-2 w-full rounded-md bg-white p-4"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-500 text-white">
                      {word.word.charAt(0).toUpperCase()}
                    </div>
                    <p className="ml-2 text-sm font-semibold">{word.word}</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <WordStatus hasAudio={word.hasAudio} hasImage={word.hasImage} approved={word.proovedByTherapist} />
                  </div>
                </div>
                <div className="flex w-full items-center justify-between pt-4">
                  <div>
                    <p className="text-xs text-gray-500">
                      {word.language} / {word.wordType}
                    </p>
                    <p className="text-sm font-medium">
                      Frequency: {word.frequency}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/words/${word.id}/edit`}
                      className="rounded-md border p-2 hover:bg-gray-100"
                    >
                      <PencilIcon className="w-5" />
                    </Link>
                    <form action={deleteWord.bind(null, word.id)}>
                      <button className="rounded-md border p-2 hover:bg-gray-100">
                        <TrashIcon className="w-5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <table className="hidden min-w-full text-gray-900 md:table">
            <thead className="rounded-lg text-left text-sm font-normal">
              <tr>
                <th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Word
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Language
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Type
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Frequency
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Media
                </th>
                <th scope="col" className="px-3 py-5 font-medium">
                  Approved
                </th>
                <th scope="col" className="relative py-3 pl-6 pr-3">
                  <span className="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {words?.map((word) => (
                <tr
                  key={word.id}
                  className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
                >
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-500 text-xs text-white">
                        {word.word.charAt(0).toUpperCase()}
                      </div>
                      <p>{word.word}</p>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {word.language}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {word.wordType}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {word.frequency}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <div className="flex gap-1">
                      {word.hasAudio && (
                        <span title="Has Audio" className="inline-block h-4 w-4 rounded-full bg-blue-500"></span>
                      )}
                      {word.hasImage && (
                        <span title="Has Image" className="inline-block h-4 w-4 rounded-full bg-green-500"></span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    {word.proovedByTherapist ? (
                      <span title="Approved by Therapist" className="inline-block h-4 w-4 rounded-full bg-purple-500"></span>
                    ) : (
                      <span className="inline-block h-4 w-4 rounded-full bg-gray-200"></span>
                    )}
                  </td>
                  <td className="whitespace-nowrap py-3 pl-6 pr-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/dashboard/words/${word.id}/edit`}
                        className="rounded-md border p-2 hover:bg-gray-100"
                      >
                        <PencilIcon className="w-5" />
                      </Link>
                      <form action={deleteWord.bind(null, word.id)}>
                        <button className="rounded-md border p-2 hover:bg-gray-100">
                          <TrashIcon className="w-5" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-5 flex justify-end">
        <Link
          href="/dashboard/words/create"
          className="flex h-10 items-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <span className="hidden md:block">Add Word</span>
          <PlusIcon className="h-5 md:ml-4" />
        </Link>
      </div>
    </div>
  );
}

function WordStatus({ 
  hasAudio, 
  hasImage, 
  approved 
}: { 
  hasAudio: boolean; 
  hasImage: boolean; 
  approved: boolean 
}) {
  return (
    <div className="flex space-x-2">
      {hasAudio && (
        <span className="inline-block h-4 w-4 rounded-full bg-blue-500" title="Has Audio"></span>
      )}
      {hasImage && (
        <span className="inline-block h-4 w-4 rounded-full bg-green-500" title="Has Image"></span>
      )}
      {approved && (
        <span className="inline-block h-4 w-4 rounded-full bg-purple-500" title="Therapist Approved"></span>
      )}
    </div>
  );
}
