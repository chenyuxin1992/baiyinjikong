import Vue from 'vue';
import VueI18n from 'vue-i18n';
import moment from 'moment';
import storage from 'store';

import zhLocale from './zh';
import enLocale from './en';

Vue.use(VueI18n);

export const locale = 'zh';

const i18n = new VueI18n({
  silentTranslationWarn: true,
  fallbackLocale: locale,
  locale: locale,
  messages: {
    zh: {
      ...zhLocale,
    },
    en: {
      ...enLocale,
    },
  },
});

const loadedLanguages = [locale];

function setI18nLanguage(lang) {
  i18n.locale = lang;
  // request.headers['Accept-Language'] = lang
  document.querySelector('html').setAttribute('lang', lang);
  return lang;
}

export function loadLanguageAsync(lang = locale) {
  return new Promise((resolve) => {
    // 缓存语言设置
    storage.set('lang', lang);
    if (i18n.locale !== lang) {
      if (!loadedLanguages.includes(lang)) {
        return import(/* webpackChunkName: "lang-[request]" */ `./${lang}`).then((msg) => {
          const locale = msg.default;
          loadedLanguages.push(lang);
          i18n.setLocaleMessage(lang, locale);
          moment.updateLocale(locale.momentName, locale.momentLocale);
          return setI18nLanguage(lang);
        });
      }
      return resolve(setI18nLanguage(lang));
    }
    return resolve(lang);
  });
}

export function i18nRender(key) {
  return i18n.t(`${key}`);
}

export default i18n;
