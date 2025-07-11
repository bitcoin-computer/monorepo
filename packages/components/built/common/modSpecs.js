const getEnvVar = (key) => {
    const value = import.meta.env[key];
    if (value)
        return value;
    throw new Error(`Please create a .env file.`);
};
export const VITE_WITHDRAW_MOD_SPEC = getEnvVar('VITE_WITHDRAW_MOD_SPEC');
