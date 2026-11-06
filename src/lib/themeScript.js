// Runs before paint so the stored/system theme never flashes and a repeat
// visit skips the loading splash entirely.
export const themeScript = `(function(){try{var s=localStorage.getItem('qf:theme');var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var t=(s==='light'||s==='dark')?s:(d?'dark':'light');var r=document.documentElement;if(t==='dark'){r.classList.add('dark');}r.dataset.theme=t;r.style.colorScheme=t;if(sessionStorage.getItem('qf:booted')==='1'){r.dataset.booted='1';}}catch(e){}})();`;

export default themeScript;
