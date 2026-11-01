(() => {
  'use strict';

  const storageKey = 'qidian.preferences';
  const defaults = { theme: 'system', fontSize: 'standard' };
  const normalize = (value) => ({
    theme: ['system', 'light', 'dark'].includes(value?.theme) ? value.theme : defaults.theme,
    fontSize: ['standard', 'large'].includes(value?.fontSize) ? value.fontSize : defaults.fontSize,
  });
  const apply = (preferences) => {
    document.documentElement.dataset.theme = preferences.theme;
    document.documentElement.dataset.fontSize = preferences.fontSize;
  };

  let preferences = { ...defaults };
  let storageAvailable = true;
  try {
    preferences = normalize(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Invalid or inaccessible storage must not prevent the page from loading.
    storageAvailable = false;
  }
  apply(preferences);

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#settings-form');
    if (!form) return;

    const theme = form.elements.namedItem('theme');
    const fontSize = form.elements.namedItem('fontSize');
    const status = document.querySelector('#save-status');
    const syncForm = () => {
      theme.value = preferences.theme;
      fontSize.value = preferences.fontSize;
    };
    const save = (next, message) => {
      let persisted = false;
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
        persisted = true;
      } catch {
        // Apply for this page even when the browser denies storage access.
      }
      preferences = next;
      apply(preferences);
      syncForm();
      status.textContent = persisted ? message : '设置已应用，但浏览器无法保存。刷新或离开页面后可能恢复默认。';
    };

    syncForm();
    if (!storageAvailable) status.textContent = '未能读取已保存的设置，当前使用默认值。';
    form.addEventListener('change', () => {
      status.textContent = '有未保存的更改。点击“保存设置”后生效。';
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      save(normalize({ theme: theme.value, fontSize: fontSize.value }), '设置已保存。');
    });
    document.querySelector('#reset-settings').addEventListener('click', () => {
      save({ ...defaults }, '已恢复默认设置。');
    });
  });
})();
