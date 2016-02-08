/* @flow */

import "babel-polyfill"
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

// import rootReducer from 'redux/reducers/index';


let userReducer = function (state = {}, action) {
    console.log('userReducer was called with state', state, 'and action', action)
        switch (action.type) {
            case 'LOGIN':
                return action.user
            default:
                return state;
        }
    }


let calReducer = function (state = {}, action) {
    console.log('calReducer was called with state', state, 'and action', action)
        
        switch (action.type) {
            case 'DATE':
                return { date: action.date }
            default:
                return { date: new Date() }
        }
}


let reducer = combineReducers({
    user: userReducer,
    cal: calReducer
});

    
const store = createStore(
    reducer,
    applyMiddleware(thunk)
);

    
let login = function (user=false) {
    return dispatch => {
        setTimeout( () => {
            dispatch({ type: 'LOGIN', user: user })
        },1000)
    }}


store.dispatch(login({ name: 'bla' }));
console.log('store_0 state after initialization:', store.getState());
