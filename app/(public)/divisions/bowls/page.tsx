import DivisionPage from '../[slug]/page';

// The bowls division requires live inventory freshness
export const revalidate = 300;

export default async function BowlsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <DivisionPage
      params={Promise.resolve({ slug: 'bowls' })}
      searchParams={props.searchParams}
    />
  );
}
