import * as utils from './utils'

describe('utils', () => {
  describe('classNames', () => {
    it('should create class names', () => {
      expect(utils.classNames('a', ['b'], false)).toEqual('a b')
    })
  })
})
