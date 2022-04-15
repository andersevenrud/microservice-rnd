export const fetchClients = () =>
  fetch('/api/client').then((response) => response.json())

export const createClient = () => fetch('/api/client', { method: 'POST' })

export const deleteClient = (uuid: string) =>
  fetch(`/api/client/${uuid}`, { method: 'DELETE' })

export const performClientAction = (uuid: string, action: string) =>
  fetch(`/api/client/${uuid}/${action}`, { method: 'POST' })
