import { Request, Response, NextFunction, Handler } from 'express'

export const withErrorWrapper =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next)
    } catch (e) {
      next(e)
    }
  }

// FIXME: This is just a hack to get authentication on the websocket via JWT.
export const fakeAuthCall = (
  auther: Handler,
  upgradeReq: Request,
  fn: (error?: Error) => void
) =>
  auther(
    {
      ...upgradeReq,
      headers: {
        authorization: `Bearer ${upgradeReq.cookies.rnd_token}`,
      },
      is: () => false,
    } as any,
    {} as any,
    (error?: any) => fn(error)
  )
