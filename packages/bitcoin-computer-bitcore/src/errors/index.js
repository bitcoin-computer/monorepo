import _ from 'lodash'
import data from './spec'

function format(message, args) {
  return message.replace('{0}', args[0]).replace('{1}', args[1]).replace('{2}', args[2])
}

const traverseNode = function (parent, errorDefinition) {
  const NodeError = function (...args) {
    if (_.isString(errorDefinition.message)) {
      this.message = format(errorDefinition.message, args)
    } else if (_.isFunction(errorDefinition.message)) {
      this.message = errorDefinition.message.apply(null, args)
    } else {
      throw new Error(`Invalid error definition for ${errorDefinition.name}`)
    }
    this.stack = `${this.message}\n${new Error().stack}`
  }
  NodeError.prototype = Object.create(parent.prototype)
  NodeError.prototype.name = parent.prototype.name + errorDefinition.name
  parent[errorDefinition.name] = NodeError
  if (errorDefinition.errors) {
    // eslint-disable-next-line no-use-before-define
    childDefinitions(NodeError, errorDefinition.errors)
  }
  return NodeError
}

// TODO Try to get rid of this and copy the body into the callers.
const childDefinitions = function (parent, children) {
  _.each(children, (child) => traverseNode(parent, child))
}

const traverseRoot = function (parent, errorsDefinition) {
  childDefinitions(parent, errorsDefinition)
  return parent
}

const bitcore = {}
bitcore.Error = function () {
  this.message = 'Internal error'
  this.stack = `${this.message}\n${new Error().stack}`
}
bitcore.Error.prototype = Object.create(Error.prototype)
bitcore.Error.prototype.name = 'bitcore.Error'

traverseRoot(bitcore.Error, data)

bitcore.Error.extend = function (spec) {
  return traverseNode(bitcore.Error, spec)
}

export default bitcore.Error
