/** Inline FOUC prevention — must stay sync in <head>. */
export function ThemeScript() {
  const code = `(function(){try{var t=sessionStorage.getItem('theme');var r=document.documentElement;var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme');r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
