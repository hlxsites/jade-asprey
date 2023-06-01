import {
  sampleRUM,
  // buildBlock,
  loadHeader,
  loadFooter,
  decorateIcons,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCP,
  loadBlocks,
  loadCSS,
} from './lib-franklin.js';

const LCP_BLOCKS = []; // add your LCP blocks to the list

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
// function buildHeroBlock(main) {
//   const h1 = main.querySelector('h1');
//   const picture = main.querySelector('picture');
//   // eslint-disable-next-line no-bitwise
//   if (h1 && picture &&
//   (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
//     const section = document.createElement('div');
//     section.append(buildBlock('hero', { elems: [picture, h1] }));
//     main.prepend(section);
//   }
// }

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
// function buildAutoBlocks(main) {
//   try {
//     buildHeroBlock(main);
//   } catch (error) {
//     // eslint-disable-next-line no-console
//     console.error('Auto Blocking failed', error);
//   }
// }

export function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href !== a.textContent) {
      const up = a.parentElement;
      const twoup = a.parentElement.parentElement;
      if (!a.querySelector('img')) {
        if (up.childNodes.length === 1 && (up.tagName === 'P' || up.tagName === 'DIV')) {
          a.className = 'button primary'; // default
          up.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && up.tagName === 'STRONG'
          && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
          a.className = 'button primary';
          twoup.classList.add('button-container');
        }
        if (up.childNodes.length === 1 && up.tagName === 'EM'
          && twoup.childNodes.length === 1 && twoup.tagName === 'P') {
          a.className = 'button secondary';
          twoup.classList.add('button-container');
        }
        if (a.href.endsWith('.pdf')) {
          a.setAttribute('download', '');
        }
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  // hopefully forward compatible button decoration
  decorateButtons(main);
  decorateIcons(main);
  // buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  document.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    document.body.classList.add('appear');
    await waitForLCP(LCP_BLOCKS);
  }
}

/**
 * Adds the favicon.
 * @param {string} href The favicon URL
 */
export function addFavIcon(href) {
  const link = document.createElement('link');
  link.rel = 'icon';
  link.type = 'image/png';
  link.href = href;
  const existingLink = document.querySelector('head link[rel="icon"]');
  if (existingLink) {
    existingLink.replaceWith(link);
  } else {
    document.head.append(link);
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  const main = doc.querySelector('main');
  await loadBlocks(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadHeader(doc.querySelector('header'));
  loadFooter(doc.querySelector('footer'));

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  addFavIcon(`${window.hlx.codeBasePath}/styles/favicon.png`);
  sampleRUM('lazy');
  sampleRUM.observe(main.querySelectorAll('div[data-block-name]'));
  sampleRUM.observe(main.querySelectorAll('picture > img'));
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

function getPageName() {
  const pageSectionParts = window.location.pathname.split('/').filter((subPath) => subPath !== '');
  const pageName = pageSectionParts.join(':');
  const finalPageName = pageName === '' ? 'Home' : pageName;

  return {
    pageName: finalPageName,
    sections: pageSectionParts,
  };
}

function getPageEventData() {
  const { pageName } = getPageName();
  return {
    event: 'page_view',
    pageName,
    pageUrl: window.location.href,
  };
}

// function getComponentData(element) {
//   var dataLayerJson = element.dataset.cmpDataLayer;
//   if (dataLayerJson)
//       return JSON.parse(dataLayerJson);
//   else
//       return undefined
// }

function getClickId(element) {
  if (element.dataset.cmpDataLayer) {
    return Object.keys(JSON.parse(element.dataset.cmpDataLayer))[0];
  }
  const componentElement = element.closest('[data-cmp-data-layer]');
  return Object.keys(JSON.parse(componentElement.dataset.cmpDataLayer))[0];
}

function addClickToDataLayer(event) {
  const element = event.currentTarget;
  const componentId = getClickId(element);
  window.dataLayer.push({
    event: 'cmp:click',
    eventInfo: {
      path: `component.${componentId}`,
    },
  });
}

export function attachClickEventListener(element) {
  element.addEventListener('click', addClickToDataLayer);
}

export async function onDocumentReady() {
  window.dataLayer = window.dataLayer || [];
  const { dataLayer } = window;
  const clickableElements = document.querySelectorAll('[data-cmp-clickable]');
  clickableElements.forEach((element) => {
    attachClickEventListener(element);
  });
  dataLayer.push(getPageEventData());
}
