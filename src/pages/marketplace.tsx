import SEO from '@/components/SEO/SEO';
import ShutdownNotice from '@/components/ShutdownNotice/ShutdownNotice';

type Props = {};

const Marketplace = (props: Props) => {
  return (
    <>
      <SEO 
        title="Marketplace - Important Notice"
        url="https://skyharbor.io/marketplace"
      />
      <ShutdownNotice />
    </>
  );
};

export default Marketplace;