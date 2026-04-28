export function getUserId(): string {
  if (typeof window === 'undefined') return 'server'
  let id = localStorage.getItem('pt_user_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('pt_user_id', id)
  }
  return id
}
