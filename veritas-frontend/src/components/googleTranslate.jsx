import React, { useEffect } from 'react';

const GoogleTranslate = () => {
    const googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
            {
                pageLanguage: 'en',
                autoDisplay: true,
                includedLanguages: 'en,hi,te,ta,bn,kn',
            },
            'google_translate_element'
        );
    };

    useEffect(() => {
        const scriptSrc = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        const scriptExists = document.querySelector(`script[src="${scriptSrc}"]`);

        window.googleTranslateElementInit = googleTranslateElementInit;

        if (!scriptExists) {
            const addScript = document.createElement('script');
            addScript.setAttribute('src', scriptSrc);
            document.body.appendChild(addScript);
        } else if (window.google?.translate) {
            googleTranslateElementInit();
        }
    }, []);

    return (
        <div id="google_translate_element"></div>
    );
};

export default GoogleTranslate;
