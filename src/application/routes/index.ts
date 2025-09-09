import createPublicationRoute from './publications/create-publication'
import getPublicationRoute from './publications/get-publication'
import listPublicationsRoute from './publications/list-publications'

const routes = [
  // publications
  getPublicationRoute,
  listPublicationsRoute,
  createPublicationRoute,
]

export default routes
