// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './lib-franklin.js';
import {getPageEventData} from './scripts.js';
const gtm_id = 'G-FTH98G1LJR';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
// Global site tag (gtag.js) - Google Analytics

// Initialize the data layer for Google Tag Manager
// (this should mandatorily be done before the Cookie Solution is loaded)
window.dataLayer = window.dataLayer || [];

function gtag(...args) {
  window.dataLayer.push(args);
}

gtag('js', new Date());

gtag('config', gtm_id);

// Google Tag Manager
// eslint-disable-next-line
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',gtm_id);

gtag(getPageEventData());