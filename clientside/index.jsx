/* @flow */

import "babel-polyfill"
import { omit, map, curry, times } from "lodash";
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'

import Moment from 'moment';
import 'bluebird';


// STORE

let userReducer = function (state = {}, action) {
    switch (action.type) {
        case 'LOGIN':
            return action.user
        default:
            return state;
    }
}

let calReducer = function (state = {}, action) {
    switch (action.type) {
        case 'DATE':
            return { date: action.date }
        default:
            return { date: new Moment() }
    }
}

let eventReducer = function (state = [], action) {
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


// ACTIONS

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


// VIEWS

const DayTitles = () => (
    <div>
    {['Sun','Mon','Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(n => (
        <div key={n} className="dayTitle">
            {n}
        </div>
    ))}
    </div>
);

const Calendar = ({date}) => {
    let year = date.year();
    let day = date.startOf('year');
    let days = []
    
    while (day.year() == year) {
        days.push((
            <div key={day.dayOfYear()} className={(day.month() % 2 == 1) ? 'day odd' : 'day even'}>
                <div className="dayContent"  >
                    {day.date()}
                </div>
            </div>));

        day.add(1,'d');
    }
    
    console.log(days)
        
    return (
        <div className="cal">
        <div className="monthTitle">
        { date.format('YYYY') }
        </div>
        <DayTitles />
        <div className="daysContainer">
            {days}
        </div>
    
    </div>
    )
}
        
//store.dispatch(login({ name: 'bla' }));

store.dispatch(addEvent({title: "event1", start: 2, end: 5 }));
store.dispatch(addEvent({ title: "event2", start: 12, end: 22 }));

console.log('store_0 state after initialization:', store.getState());

store.subscribe(() => {
    console.log('store has been updated. Latest store state:', store.getState());
});


const mapStateToProps = (state) => {
    return {
        date: state.cal.date
    }
};

const mapDispatchToProps = (dispatch) => {
    return {}
};

const WrappedCal = connect(
    mapStateToProps,
    mapDispatchToProps
)(Calendar);

const App = () => (
    <div>
        <WrappedCal />
    </div>
);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)

    
