export class ExpressError extends Error {
  status = 500
}

export class ExpressNotFoundError extends ExpressError {
  status = 404
}
