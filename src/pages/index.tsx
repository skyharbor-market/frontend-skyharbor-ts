import SEO from '@/components/SEO/SEO';
import ShutdownNotice from '@/components/ShutdownNotice/ShutdownNotice';

const Home = () => {
  return (
    <>
      <SEO 
        title="SkyHarbor | Important Notice"
        url="https://skyharbor.io"
      />
      <ShutdownNotice />
    </>
  );
};

export default Home;
