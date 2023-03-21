import db from '../lib/nedb'
import { ipcMain } from 'electron'

const { handle } = ipcMain

const eventList = (): void => {
  handle('dbFind', async (event, params) => {
    return new Promise((resolve, reject) => {
      if (db[params.table]) {
        db[params.table]
          .find(params.query)
          .sort(params.sort)
          .exec((err, res) => {
            if (!err) {
              resolve(res)
            } else {
              reject(err)
            }
          })
      } else {
        reject('Database not found')
      }
    })
  })

  handle('dbFindOne', async (event, params) => {
    return new Promise((resolve, reject) => {
      if (db[params.table]) {
        db[params.table]
          .findOne(params.query)
          .sort(params.sort)
          .exec((err, res) => {
            if (!err) {
              resolve(res)
            } else {
              reject(err)
            }
          })
      } else {
        reject('Database not found')
      }
    })
  })

  handle('dbInsert', async (event, params) => {
    return new Promise((resolve, reject) => {
      if (db[params.table]) {
        db[params.table].insert(params.data, (err, res) => {
          if (!err) {
            resolve(res)
          } else {
            reject(err)
          }
        })
      } else {
        reject('Database not found')
      }
    })
  })

  handle('dbUpdate', async (event, params) => {
    return new Promise((resolve, reject) => {
      if (db[params.table]) {
        db[params.table].update(params.query, { $set: params.data }, (err, res) => {
          if (!err) {
            resolve(res)
          } else {
            reject(err)
          }
        })
      } else {
        reject('Database not found')
      }
    })
  })

  handle('dbRemove', async (event, params) => {
    return new Promise((resolve, reject) => {
      if (db[params.table]) {
        db[params.table].remove(params.query, (err, res) => {
          if (!err) {
            resolve(res)
          } else {
            reject(err)
          }
        })
      } else {
        reject('Database not found')
      }
    })
  })
}

export default eventList
