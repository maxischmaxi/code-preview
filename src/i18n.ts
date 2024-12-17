import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import de from "./translations/de.json";

i18n.use(initReactI18next).init({
  lng: "de",
  resources: {
    de: { ...de },
  },
})
