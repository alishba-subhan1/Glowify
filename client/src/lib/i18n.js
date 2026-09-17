import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "./api";

const I18nContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback = key) => fallback
});

const defaultDictionary = {
  "nav.home": "Home",
  "nav.about": "About",
  "nav.services": "Services",
  "nav.book": "Book",
  "nav.contact": "Contact us",
  "nav.admin": "Admin",
  "booking.title": "Book Appointment",
  "booking.subtitle": "Reserve your preferred service, date, and time slot in minutes.",
  "booking.submit": "Confirm Booking"
};

export function I18nProvider({ children }) {
  const language = "en";
  const [dictionary, setDictionary] = useState(defaultDictionary);

  useEffect(() => {
    apiFetch("/translations?languageCode=en")
      .then((rows) => {
        const next = { ...defaultDictionary };
        rows.forEach((row) => {
          if (row?.key) next[row.key] = row.value;
        });
        setDictionary(next);
      })
      .catch(() => {
        setDictionary(defaultDictionary);
      });
  }, []);

  const value = useMemo(
    () => ({
      language,
      setLanguage: () => {},
      t: (key, fallback = key) => dictionary[key] || fallback || key
    }),
    [language, dictionary]
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  return useContext(I18nContext);
}
