/* @flow */

import "babel-polyfill"
import { omit, map, curry, times } from "lodash";
import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk';

import React from 'react'
import { render } from 'react-dom'
import { Provider, connect } from 'react-redux'
import ReactDOM from 'react-dom';
//import 'moment/locale/hr'

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
            return {  ...state, date: action.date }
        case 'SELECTMONTH':
            return { ...state, month: action.month}
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

const dispatch = store.dispatch

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

const selectMonth = ( month: number ): ActionResult => {
    return { type: 'SELECTMONTH', month: (month) }
}

/*  VIEWS  */

class DayTitles extends React.Component {
    constructor(props) {
        super(props);
        this.state =  { sticky: false }
    }

    render() {
        return (
            <div>
            <div className={ ["dayTitles", (this.state.sticky ? 'sticky' : 'notsticky') ].join(' ')}>
            { Moment.weekdays().map(name => (
                <div key={name} className={[name, 'dayTitle'].join(' ')}>
                    {name}
                </div>
            ))}
            </div>
            <div className="dayTitlesSpacer" />
            </div>
        )
    }

    componentDidMount() {
        const events =  ['scroll', 'resize', 'touchmove', 'touchend']
        
        events.forEach( type => {
            window.addEventListener(type, this.handleEvent.bind(this));
        }, this);

        this.domNode = ReactDOM.findDOMNode(this);
        this.origin = this.domNode.getBoundingClientRect().top + this.pageOffset();
        this.hasUnhandledEvent = true;
    }

    pageOffset() {        
        return (window.pageYOffset || document.documentElement.scrollTop);
    }
    
    handleEvent(event) {
        if (this.pageOffset() > this.origin && !this.state.sticky) {
            this.setState({sticky: true});
        }
        
        if ( this.pageOffset() < this.origin && this.state.sticky ) {
            this.setState({ sticky: false });
        }
    }
}

const Day = connect()(({ day, onMouseOver }) => {
    let classes = [ 'day' ];
    let today = new Moment().startOf('day');    

    if (day.weekday() == 0) { classes = ['last', 'left', ...classes] }
    if (day.weekday() == 6) { classes = ['last', 'right', ...classes] }
    
    if (day.date() <= 7) {
        classes.push('mBorderTop');
        if ((day.date() == 1) && (day.weekday() != 0)) { classes.push('mBorderLeft') }
    }

    if (today.isSame(day)) { classes.push('today') }

    return (
        <div className={classes.join(' ')} onMouseOver={ onMouseOver } >
            <div className="dayContent" >
                { day.date() } - 
                { day.weekday() } -
                { day.format('ddd') }
            </div>
        </div>)
});

const DaySpacer = () => {

    return ( <div className="daySpacer" /> )
    
}

@connect( state => { return { selectedMonth: state.cal.month } })
class Month extends React.Component {
    render() {
        let { month, selectedMonth }  = this.props;
        let days = [];
        let classes = [ ]

        classes.push((selectedMonth == month.month()) ? "selected" : "deselected");
        classes.push((month.month() == 0 ) ? "noshift" : "shift");

        let iteratePadding = (pad) => {
            if (!pad) { return }
            days.push(<DaySpacer key={"pad" + pad} />);
            iteratePadding(pad - 1)
        }

        iteratePadding(month.weekday() || 7)

            let iterateDays = (month, day) => {
                if (day.month() != month) { return }

                days.push(<Day key={day.dayOfYear()} day={ day } />);

                iterateDays(month, day.clone().add(1,'d'))};

        iterateDays(month.month(), month);

        return (
            <div className={ [ 'month', ...classes ].join(' ') }>
                <div className="monthName">
                </div>

                <div className="days">
                    { days }
                </div>
            </div>
        )
    }}

@connect((state) => { return { date: state.cal.date}})
class Calendar extends React.Component {
    render(...args) {
        let year = this.props.date.year();
        let month = this.props.date.startOf('year');
        let months = [];
        
        while (month.year() == year) {
            months.push(<Month key={month.month()} month={ month } />);
            month = month.clone().add(1,'M');
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
    }

    componentDidMounty() {
        const events =  ['scroll', 'resize', 'touchmove', 'touchend']
        
        events.forEach( type => {
            window.addEventListener(type, this.handleEvent.bind(this));
        }, this);

        this.domNode = ReactDOM.findDOMNode(this);
        this.origin = this.domNode.getBoundingClientRect().top + this.pageOffset();
        this.hasUnhandledEvent = true;
    }
    
    handleEvent(event) {
        if (this.pageOffset() > this.origin) {
            this.setState({ style: 'sticky' })
        } else {
            this.setState({ style: 'notsticky' })
        }
    }
}

store.dispatch(addEvent({ title: "event1", start: 2, end: 5 }));
store.dispatch(addEvent({ title: "event2", start: 12, end: 22 }));

console.log('store state after initialization:', store.getState());

/*
   store.subscribe(() => {
   console.log('store has been updated. Latest store state:', store.getState());
   });
 */

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

    
