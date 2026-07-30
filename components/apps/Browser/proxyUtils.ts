const PROXY_BASE = "https://api.allorigins.win/raw?url=";

export const makeProxyUrl = (url: string, baseUrl: string): string => {
  try {
    const absolute = new URL(url, baseUrl).href;
    return `${PROXY_BASE}${encodeURIComponent(absolute)}`;
  } catch {
    return url;
  }
};

const SKIP_PROTOCOLS = /^(?:#|javascript:|data:|mailto:|tel:|blob:|about:)/i;

type AttrReplacer = (match: string, attr: string, url: string) => string;
type SrcsetReplacer = (match: string, srcset: string) => string;
type UrlReplacer = (match: string, url: string) => string;

export const rewriteUrlsForProxy = (html: string, baseUrl: string): string => {
  let result = html;

  // Rewrite src, href, action, poster attributes
  const attrReplacer: AttrReplacer = (_match, attr, url) => {
    if (SKIP_PROTOCOLS.test(url)) return _match;
    return `${attr}="${makeProxyUrl(url, baseUrl)}"`;
  };
  result = result.replace(
    /\b(src|href|action|poster)=["']([^"']+)["']/gi,
    attrReplacer
  );

  // Rewrite srcset (comma-separated URL + descriptor pairs)
  const srcsetReplacer: SrcsetReplacer = (_match, srcset) => {
    const rewritten = srcset
      .split(",")
      .map((part: string) => {
        const trimmed = part.trim();
        const segments = trimmed.split(/\s+/);
        const [url] = segments;
        if (!url || SKIP_PROTOCOLS.test(url)) return trimmed;
        return `${makeProxyUrl(url, baseUrl)} ${segments.slice(1).join(" ")}`.trim();
      })
      .join(", ");
    return `srcset="${rewritten}"`;
  };
  result = result.replace(/\bsrcset=["']([^"']+)["']/gi, srcsetReplacer);

  // Rewrite url() in inline styles
  const urlReplacer: UrlReplacer = (_match, url) => {
    if (SKIP_PROTOCOLS.test(url)) return _match;
    return `url("${makeProxyUrl(url, baseUrl)}")`;
  };
  result = result.replace(/url\(["']?([^"')]+)["']?\)/gi, urlReplacer);

  return result;
};

export const NAV_INTERCEPT_SCRIPT = `
<script data-pyhdra-nav-intercept>
(function() {
  if (window.__pyhdraNavPatched) return;
  window.__pyhdraNavPatched = true;
  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (/^(#|javascript:|data:|mailto:|tel:|blob:|about:)/i.test(href)) return;
    if (a.target === '_blank' || a.target === '_parent' || a.target === '_top') return;
    if (a.hasAttribute('download')) return;
    e.preventDefault();
    e.stopPropagation();
    var resolved = a.href;
    window.parent.postMessage({ __pyhdraNav: resolved }, '*');
  }, true);
})();
</script>`;

export const injectNavScript = (html: string): string => {
  if (html.includes("</body>")) {
    return html.replace("</body>", `${NAV_INTERCEPT_SCRIPT}</body>`);
  }
  if (html.includes("</html>")) {
    return html.replace("</html>", `${NAV_INTERCEPT_SCRIPT}</html>`);
  }
  return html + NAV_INTERCEPT_SCRIPT;
};
