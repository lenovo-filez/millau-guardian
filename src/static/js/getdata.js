import axios from 'axios'
import qs from 'qs'

const Service = axios.create({
  // timeout: 7000,
  baseURL: 'millauService/extension',
})


export default {
  Projects: {
    getAll() {
      return Service.get('/projects/all')
    },
    create(data) {
      return Service.post('/projects/create', data)
    },
    Variables: {
      create(data) {
        return Service.post('projects/variables/create', data)
      }
    },
    Triggers: {
      create(data) {
        return Service.post('/projects/triggers/create', data)
      }
    },
    Hooks: {
      create(data) {
        return Service.post('/projects/hooks/create', data)
      }
    }

  },
  Branches: {
    create(data) {
      return Service.post('/branches/create', data)
    }
  },
  Groups: {
    getAll() {
      return Service.get('/groups/all')
    }
  },
}