// localStorage can throw (private mode, blocked cookies). Theme must never be able to break the rest of the site.
const store = {
  get() { try { return localStorage.getItem('sutra-theme'); } catch { return null; } },
  set(v) { try { localStorage.setItem('sutra-theme', v); } catch { /* ignore */ } },
};

export function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  if (!toggleBtn) return;

  // The class is normally applied by the inline script in index.html before first paint;
  // this keeps things correct if that script was blocked.
  if (store.get() === 'light') document.body.classList.add('light-mode');
  toggleBtn.textContent = document.body.classList.contains('light-mode') ? 'DARK' : 'LIGHT';

  toggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    toggleBtn.textContent = isLight ? 'DARK' : 'LIGHT';
    store.set(isLight ? 'light' : 'dark');
  });
}
