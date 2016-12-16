import { create, remove, update, query, findOne, find } from './services/users'

find().then(function (data) {
  console.log("data: ",data)
})
