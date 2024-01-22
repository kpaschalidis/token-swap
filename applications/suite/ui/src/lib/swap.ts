export const acceptTermsOfService = (): void => {
    localStorage.setItem('accept-terms-of-service', 'true');
}

export const hasAcceptedTermsOfService = (): boolean => {
    const status = localStorage.getItem('accept-terms-of-service');

    if (status && status === 'true') {
        return true;
    }

    return false;
}