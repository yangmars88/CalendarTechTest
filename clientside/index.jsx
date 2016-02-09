/* @flow */

import "babel-polyfill"
import { omit, map, curry } from "lodash";
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';


import React from 'react'
import { render } from 'react-dom'

// import "bluebird";

let userReducer = function (state = {}, action) {
//    console.log('userReducer was called with state', state, 'and action', action)
        switch (action.type) {
            case 'LOGIN':
                return action.user
            default:
                return state;
        }
    }


let calReducer = function (state = {}, action) {
//    console.log('calReducer was called with state', state, 'and action', action)
        switch (action.type) {
            case 'DATE':
                return { date: action.date }
            default:
                return { date: new Date() }
        }
}


let eventReducer = function (state = [], action) {
    //    console.log('calReducer was called with state', state, 'and action', action)
    switch (action.type) {
        case 'ADD':
            return [ ...state, action.item ]
        default:
            return state;
    }
}


let logMiddleware = curry(({dispatch, getState }, next, action) => {
    console.log(`action "${action.type}"`, omit(action, 'type'));
    return next(action)
});

const store = createStore(
    combineReducers({
        user: userReducer,
        cal: calReducer,
        events: eventReducer
    }),
    applyMiddleware(logMiddleware),
    applyMiddleware(thunk)
);

const login = (user=false) => {
    return dispatch => {
        setTimeout( () => {
            dispatch({ type: 'LOGIN', user: user })
        },1000)
    }}

type Action = { type: string }

type Event = {
    start: number,
    end: number,
    title: ?string
}

const addEvent = ( event: ?Event ): ?Action => {
    if (!event) { return }
    return { type: 'ADD', item: event }
}

store.dispatch(login({ name: 'bla' }));

store.dispatch(addEvent({title: "event1", start: 2, end: 5 }));
store.dispatch(addEvent({ title: "event2", start: 12, end: 22 }));

console.log('store_0 state after initialization:', store.getState());

store.subscribe(() => {
    console.log('store has been updated. Latest store state:', store.getState());
});


