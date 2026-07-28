import SearchContent from '../components/shop/SearchContent';
import CategoryBar from '../components/CategoryBar';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const term = params.q?.trim() ?? '';

  return (
    <div className="aqua-page">
      <CategoryBar />
      <SearchContent initialTerm={term} />
    </div>
  );
}
