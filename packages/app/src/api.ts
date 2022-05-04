const createOptions = (token?: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

export const fetchClients = (token?: string) =>
  fetch('/api/client', createOptions(token)).then((response) => response.json())

export const createClient = (token?: string) =>
  fetch('/api/client', { method: 'POST', ...createOptions(token) })

export const deleteClient = (uuid: string, token?: string) =>
  fetch(`/api/client/${uuid}`, { method: 'DELETE', ...createOptions(token) })

export const performClientAction = (
  uuid: string,
  action: string,
  token?: string
) =>
  fetch(`/api/client/${uuid}/${action}`, {
    method: 'POST',
    ...createOptions(token),
  })
