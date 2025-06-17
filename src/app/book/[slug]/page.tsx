import { getBookDb } from "@/actions/book";
import BookView from "@/components/Bookview";

export default async function MyBook({ params }: any) {
  const slug: any = await params.slug;
  const data: any = await getBookDb(slug);
  return (
    <>
      <BookView data={data} />
      {/* <pre>
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre> */}
    </>
  );
}
