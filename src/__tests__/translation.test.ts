import { flattenObject, setNestedValue, sanitizeKey } from '../translation'

describe('flattenObject', () => {
  it('should flatten a simple nested object', () => {
    const input = {
      home: {
        title: 'Welcome',
        description: 'Hello World',
      },
    }
    const expected = {
      'home.title': 'Welcome',
      'home.description': 'Hello World',
    }
    expect(flattenObject(input)).toEqual(expected)
  })

  it('should flatten deeply nested objects', () => {
    const input = {
      home: {
        hero: {
          title: 'Welcome',
          subtitle: 'Hello',
        },
      },
    }
    const expected = {
      'home.hero.title': 'Welcome',
      'home.hero.subtitle': 'Hello',
    }
    expect(flattenObject(input)).toEqual(expected)
  })

  it('should handle flat objects', () => {
    const input = { title: 'Hello', description: 'World' }
    const expected = { title: 'Hello', description: 'World' }
    expect(flattenObject(input)).toEqual(expected)
  })

  it('should handle empty objects', () => {
    expect(flattenObject({})).toEqual({})
  })

  it('should handle arrays as values', () => {
    const input = { items: ['a', 'b', 'c'] }
    const expected = { items: ['a', 'b', 'c'] }
    expect(flattenObject(input)).toEqual(expected)
  })
})

describe('setNestedValue', () => {
  it('should set a simple nested value', () => {
    const obj: Record<string, any> = {}
    setNestedValue(obj, 'home.title', 'Welcome')
    expect(obj).toEqual({ home: { title: 'Welcome' } })
  })

  it('should set deeply nested values', () => {
    const obj: Record<string, any> = {}
    setNestedValue(obj, 'home.hero.title', 'Welcome')
    expect(obj).toEqual({ home: { hero: { title: 'Welcome' } } })
  })

  it('should preserve existing values', () => {
    const obj: Record<string, any> = { home: { existing: 'value' } }
    setNestedValue(obj, 'home.title', 'Welcome')
    expect(obj).toEqual({ home: { existing: 'value', title: 'Welcome' } })
  })

  it('should handle single key path', () => {
    const obj: Record<string, any> = {}
    setNestedValue(obj, 'title', 'Hello')
    expect(obj).toEqual({ title: 'Hello' })
  })

  it('should overwrite existing values', () => {
    const obj: Record<string, any> = { home: { title: 'Old' } }
    setNestedValue(obj, 'home.title', 'New')
    expect(obj).toEqual({ home: { title: 'New' } })
  })
})

describe('sanitizeKey', () => {
  it('should convert dots to underscores', () => {
    expect(sanitizeKey('home.title')).toBe('home_title')
  })

  it('should remove special characters', () => {
    expect(sanitizeKey('hello@world!')).toBe('helloworld')
  })

  it('should convert spaces to underscores', () => {
    expect(sanitizeKey('hello world')).toBe('hello_world')
  })

  it('should convert to lowercase', () => {
    expect(sanitizeKey('HelloWorld')).toBe('helloworld')
  })

  it('should remove leading and trailing underscores', () => {
    expect(sanitizeKey('_hello_')).toBe('hello')
  })

  it('should handle complex strings', () => {
    expect(sanitizeKey('Hello.World! Test@123')).toBe('hello_world_test123')
  })

  it('should preserve dashes', () => {
    expect(sanitizeKey('hello-world')).toBe('hello-world')
  })
})

