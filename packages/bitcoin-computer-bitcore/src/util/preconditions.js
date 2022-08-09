import _ from 'lodash'
import errors from '../errors'

export default {
  checkState(condition, message) {
    if (!condition) {
      throw new errors.InvalidState(message)
    }
  },
  checkArgument(condition, argumentName, message, docsPath) {
    if (!condition) {
      throw new errors.InvalidArgument(argumentName, message, docsPath)
    }
  },
  checkArgumentType(argument, type, argumentName) {
    argumentName = argumentName || '(unknown name)'
    if (_.isString(type)) {
      if (type === 'Buffer') {
        if (!Buffer.isBuffer(argument)) {
          throw new errors.InvalidArgumentType(argument, type, argumentName)
        }
        // eslint-disable-next-line valid-typeof
      } else if (typeof argument !== type) {
        throw new errors.InvalidArgumentType(argument, type, argumentName)
      }
    } else if (!(argument instanceof type)) {
      throw new errors.InvalidArgumentType(argument, type.name, argumentName)
    }
  },
}
