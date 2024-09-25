import Head from 'next/head';
import { globalMeta } from '../ergofunctions/consts'; 


export default function SEOHead({
	title = globalMeta.siteName,
	description = globalMeta.description,
	canonicalUrl = globalMeta.siteUrl,
	ogType,
	ogImgUrl = globalMeta.siteLogo,
	children
}) {
 
  return (
	<Head>
    	{/*
        	Fundamental head elements important for SEO.
    	*/}
    	<title>{ title } </title>
    	<meta name="description" content={description} />
    	<link rel="canonical" href={canonicalUrl} />
    	<meta name="viewport" content="width=device-width, initial-scale=1" />
    	<link rel="icon" href="/favicon.ico" />
 
    	{/*
        	Open graph meta tags.
    	*/}
    	<meta property="og:locale" content="en_US" />
    	<meta property="og:site_name" content={globalMeta.siteName} />
    	<meta property="og:type" content={ogType} />
    	<meta property="og:description" content={description} />
    	<meta property="og:image" content={ogImgUrl} />
    	<meta property="og:url" content={canonicalUrl} />

		<meta name="twitter:card" content={description} key="twcard" />
		<meta name="twitter:creator" content={"@skyharbor_io"} key="twhandle" />

 
    	{/*
        	Structured data.
    	*/}
    	{/* <script
            type="application/ld+json"
        	dangerouslySetInnerHTML={{__html: structuredData}}
        	key="item-jsonld"
    	/> */}
    	{ children }
	</Head>
  )
}

// <!-- Primary Meta Tags -->
// <title>SkyHarbor | Ergo NFT Marketplace</title>
// <meta name="title" content="SkyHarbor | Ergo NFT Marketplace">
// <meta name="description" content="test">

// <!-- Open Graph / Facebook -->
// <meta property="og:type" content="website">
// <meta property="og:url" content="https://www.skyharbor.io/token/3623ac13550010a6b549335696abc45cb829f9b5808d24903975265946a7867e">
// <meta property="og:title" content="SkyHarbor | Ergo NFT Marketplace">
// <meta property="og:description" content="test">
// <meta property="og:image" content="/assets/images/cloudgnome.webp">

// <!-- Twitter -->
// <meta property="twitter:card" content="summary_large_image">
// <meta property="twitter:url" content="https://www.skyharbor.io/token/3623ac13550010a6b549335696abc45cb829f9b5808d24903975265946a7867e">
// <meta property="twitter:title" content="SkyHarbor | Ergo NFT Marketplace">
// <meta property="twitter:description" content="test">
// <meta property="twitter:image" content="/assets/images/cloudgnome.webp"></meta>
