const getEnvVar = (key) => {
    const value = import.meta.env[key];
    if (value)
        return value;
    return '';
};
export const VITE_WITHDRAW_MOD_SPEC = getEnvVar('VITE_WITHDRAW_MOD_SPEC');
