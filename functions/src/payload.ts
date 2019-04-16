export default interface Payload {
  db: {
    id: string,
    url: string,
    created: number
  },
  notification: {
    title: string,
    body: string,
    link: string
  }
}
