import React from "react";
import { useSelector } from "react-redux";
import { IntlProvider } from "react-intl";
import "@formatjs/intl-relativetimeformat/polyfill";
import "@formatjs/intl-relativetimeformat/dist/locale-data/en";

import enMessages from "./messages/en";
import idMessages from "./messages/id";

const allMessages = {
    en: enMessages,
    id: idMessages
};

export default function I18nProvider({ children }) {
    const locale = useSelector(({ i18n }) => i18n.lang);
    const messages = allMessages[locale];

    return (
        <IntlProvider locale={locale} messages={messages}>
            {children}
        </IntlProvider>
    );
}
