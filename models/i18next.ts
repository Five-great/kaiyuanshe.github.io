import i18nProxy from "i18next-mobx";
import LanguageDetector from 'i18next-browser-languagedetector'

const I18NEXT_MOBX_ADDPATH = process.env.I18NEXT_MOBX_ADDPATH!;
 console.log(I18NEXT_MOBX_ADDPATH);
 
i18nProxy.use(LanguageDetector).init({
    debug:false,
    detection: {
        order: ["cookie","localStorage", "navigator"],
        caches: ["cookie","localStorage"]
      },
      backend: {
          addPath: I18NEXT_MOBX_ADDPATH
      },
    resources:{
    },
    fallbackLng:["zh-CN"]
    
})
