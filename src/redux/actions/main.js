import * as t from '../types';

export const setInfo = (wallets) => ({
    type: t.SET_WALLET,
    payload: wallets
});