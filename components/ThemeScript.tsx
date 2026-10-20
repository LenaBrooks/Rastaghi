/** Inline FOUC prevention — must stay sync in <head>. */
export function ThemeScript() {
  const code = `(function(){try{var t=sessionStorage.getItem('theme');var r=document.documentElement;var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(t==='light'||t==='dark')r.setAttribute('data-theme',t);else r.removeAttribute('data-theme');r.classList.toggle('dark',dark);r.style.colorScheme=dark?'dark':'light';var hue=getComputedStyle(r).getPropertyValue('--hue').trim()||'350';var color=dark?('hsl('+hue+', 10%, 12%)'):'#ffffff';var metas=document.querySelectorAll('meta[name="theme-color"]');if(!metas.length){var m=document.createElement('meta');m.name='theme-color';m.content=color;document.head.appendChild(m);}else{for(var i=0;i<metas.length;i++)metas[i].content=color;}}catch(e){}})();`;
  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
