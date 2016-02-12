/* @flow */

import "babel-polyfill"
import { omit, map, curry, times } from "lodash";
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'

import Moment from 'moment';
//import 'bluebird';


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

type Action = { type: string };
type DelayedAction = ((dispatch: Function) => void);
class noAction {};

type ActionResult =  DelayedAction | Action | Class<noAction>

const login = ( user: boolean | Object ): ActionResult => {
    return (dispatch) => { setTimeout( () => { dispatch({ type: 'LOGIN', user: user }) }, 1000) }
};

type Event = {
    start: number,
    end: number,
    title: ?string
};

const addEvent = ( event: ?Event ): ActionResult => {
    if (!event) { return noAction }
    return { type: 'ADD', item: event }
};

/*  VIEWS  */
    
const DayTitles = () => (
    <div>
        { Moment.weekdaysShort().map(n => (
              <div key={n} className={[n, 'dayTitle'].join(' ')}>
                  {n}
              </div>
          ))}
    </div>
);

const Day = connect()(({ day }) => {
//    day = new Moment.unix(day);
        
    let classes = [ 'day' ];
    let today = new Moment().startOf('day');
    

    if (day.month() > 0 && day.date() < 8) {
        classes.push('mBorderTop');
        if ((day.date() == 1) && (day.weekday() != 5)) { classes.push('mBorderLeft') }
    }

    if (day.month() == 0 && day.date() < 8) { classes = [ ...classes, 'last', 'top' ] }
    
    if (day.weekday() == 4) { classes = [ ...classes, 'last', 'right' ] }
    if (day.weekday() == 5) { classes = [ ...classes, 'last', 'left' ] }

    if (today.isSame(day)) { classes.push('today') }

    return (
        <div className={classes.join(' ')}>
            <div className="dayContent" >
                { day.date() }
            </div>
        </div>)
});

const Month = connect()(({ month }) => {
    month = Moment.unix(month);
    let days = [];
    let day = month.clone();

    let classes = [ "month" ]
    classes.push((month.month() % 2 == 1) ? 'odd' : 'even');

    
    while (day.month() == month.month()) {
        days.push(<Day key={day.dayOfYear()} day={ day } />);
        if (day.date() < 8 && day.weekday() == 5) {
            days.push (
                <div key={ month.format('mm')} className="monthName">
                    { month.format('MMMM') }
                </div>
            )
        }
        day = day.clone().add(1,'d');
    };
    
    return (
        <div className={ classes.join(' ')}>
            { days }
        </div>        
    )
});
    
const Calendar =
connect(
    ((state) => { return { date: state.cal.date}}),
    (() => { return {} })
)(({ date }) => {
    let year = date.year();
    let month = date.startOf('year');
    let months = [];
    
    while (month.year() == year) {
        months.push(<Month key={month.month()} month={ month.unix() } />);
        month.add(1,'M');
    };

    return (
        <div className="cal">
            <div className="calTitle">
                { year }
            </div>
            <DayTitles />
            { months }
        </div>
    );
});
        

store.dispatch(addEvent({ title: "event1", start: 2, end: 5 }));
store.dispatch(addEvent({ title: "event2", start: 12, end: 22 }));

console.log('store_0 state after initialization:', store.getState());

store.subscribe(() => {
    console.log('store has been updated. Latest store state:', store.getState());
});


const App = () => (
    <div>
        <Calendar />
    </div>
);

render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)

    
