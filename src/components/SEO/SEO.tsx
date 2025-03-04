import Head from 'next/head';
import React from 'react';

interface SEOProps {
  title: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaultDescription = "Welcome to the premium NFT marketplace on the Ergo blockchain. Buy and sell NFTs with ease.";
const defaultImage = "assets/images/skyharborlogo.png";

export default function SEO({ 
  title, 
  description = defaultDescription,
  image = defaultImage,
  url = "https://skyharbor.io"
}: SEOProps) {
  const fullTitle = title.includes('SkyHarbor') ? title : `${title} | SkyHarbor`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@skyharbor_io" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Open Graph */}
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="SkyHarbor" />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />
    </Head>
  );
} 