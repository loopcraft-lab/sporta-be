/**
 * Method decorator để tự động serialize return value
 */
export function Serialize() {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args)

      // Serialize the result
      if (result === null || result === undefined) {
        return result
      }

      return serializeObject(result)
    }

    return descriptor
  }
}

/**
 * Utility function để serialize object với xử lý Date objects thành ISO strings
 */
function serializeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof Date) {
    return obj.toISOString()
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => serializeObject(item))
  }

  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeObject(value)
    }
    return serialized
  }

  return obj
}

/**
 * Class decorator để tự động apply @Serialize() cho tất cả methods
 */
export function SerializeAll(excludeMethods: string[] = []) {
  return function <T extends { new (...args: any[]): object }>(constructor: T) {
    // Lấy prototype của class
    const prototype = constructor.prototype

    // Lấy tất cả method names
    const methodNames = Object.getOwnPropertyNames(prototype).filter(
      (name) =>
        name !== 'constructor' &&
        typeof prototype[name] === 'function' &&
        !excludeMethods.includes(name)
    )

    // Apply @Serialize() cho từng method
    methodNames.forEach((methodName) => {
      const originalMethod = prototype[methodName]

      // Chỉ wrap methods không phải getter/setter
      if (typeof originalMethod === 'function') {
        prototype[methodName] = function (...args: any[]) {
          const result = originalMethod.apply(this, args)

          // Handle async methods
          if (result instanceof Promise) {
            return result.then((resolvedResult) => {
              if (resolvedResult === null || resolvedResult === undefined) {
                return resolvedResult
              }
              return serializeObject(resolvedResult)
            })
          }

          // Handle sync methods
          if (result === null || result === undefined) {
            return result
          }

          return serializeObject(result)
        }
      }
    })

    return constructor
  }
}
