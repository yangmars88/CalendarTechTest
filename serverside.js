"use strict"
/* @flow */

//import 'babel-polyfill'
import jsData from 'js-data'
import DSMongoDBAdapter from 'js-data-mongodb'

let store = new jsData.DS()
let adapter = new DSMongoDBAdapter('mongodb://localhost:27017')
store.registerAdapter('mongodb', adapter, { default: true })

var User = store.defineResource({
  name: 'user',
  // Why couldn't Mongo just use "id"?
  idAttribute: '_id',

  // map this resource to a collection, default is Resource#name
//  table: 'users'
});

console.log("running");

