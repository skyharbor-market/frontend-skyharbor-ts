import SEO from '@/components/SEO/SEO';
import ShutdownNotice from '@/components/ShutdownNotice/ShutdownNotice';
import { useRouter } from "next/router";

const CollectionPage = () => {
  const router = useRouter();
  const { collection } = router.query;

  return (
    <>
      <SEO 
        title="Collection - Important Notice"
        url={`https://skyharbor.io/collection/${collection}`}
      />
      <ShutdownNotice />
    </>
  );
};

export default CollectionPage;