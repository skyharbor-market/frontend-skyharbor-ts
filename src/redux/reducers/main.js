import * as t from '../types';

const main = (state = {
    walletInfo: {
        addresses: [],
        tokens: []
    }
}, action) => {
    switch(action.type) {
        case t.SET_WALLET: 
            return {...state, walletInfo: {
                addresses: action.payload
            }};
        default:
            return state;
    }
}

export default main;