import React, { Fragment, useEffect } from "react";
import { useRouter } from "next/router";
import "react-h5-audio-player/lib/styles.css";
import LoadingCircle from "../../components/LoadingCircle/LoadingCircle";
import TokenPage from "@/components/TokenPage/TokenPage";
import SEO from '@/components/SEO/SEO';

function Token() {
  let mounted = true;
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    if (!router.isReady) return;
    // loadArtworks();
  }, [router.isReady]);

  useEffect(() => {
    mounted = true;

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {router.isReady ? (
        // <div></div>
        <TokenPage key={token} token={token} />
      ) : (
        <div className="m-auto w-12">
          <LoadingCircle />
        </div>
      )}
    </div>
  );
}

export default Token;
