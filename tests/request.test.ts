import {as_path_view, Method} from 'edgerender/request'

const view_func = () => ({body: 'foobar', mime_type: 'text/plain'})

describe('as_path_view', () => {
  test('view-only', () => {
    const {path, view, allow} = as_path_view(['/test/', view_func])
    expect(path).toEqual('/test')
    expect(allow).toStrictEqual(new Set(['GET']))
    expect(view).toStrictEqual(view_func)
  })

  test('view-only-obj', () => {
    const {path, view, allow} = as_path_view(['/test/', {view: view_func}])
    expect(path).toEqual('/test')
    expect(allow).toStrictEqual(new Set(['GET']))
    expect(view).toStrictEqual(view_func)
  })

  test('get', () => {
    const {path, allow} = as_path_view(['/test/', {allow: 'GET', view: view_func}])
    expect(path).toEqual('/test')
    expect(allow).toStrictEqual(new Set(['GET']))
  })

  test('get-array', () => {
    const {path, allow} = as_path_view(['/test/', {allow: ['GET'], view: view_func}])
    expect(path).toEqual('/test')
    expect(allow).toStrictEqual(new Set(['GET']))
  })

  test('get-patch', () => {
    const {path, allow} = as_path_view(['/test/', {allow: ['GET', 'PATCH'], view: view_func}])
    expect(path).toEqual('/test')
    expect(allow).toStrictEqual(new Set(['GET', 'PATCH']))
  })

  test('invalid-method', () => {
    const allow = 'FOOBAR' as Method
    const t = () => as_path_view(['/test/', {allow, view: view_func}])
    expect(t).toThrow('FOOBAR is not a valid method, should be: GET, POST, PUT, PATCH, DELETE, OPTIONS')
  })

  test('invalid-method-array', () => {
    const allow = ['FOOBAR'] as unknown as Method[]
    const t = () => as_path_view(['/test/', {allow, view: view_func}])
    expect(t).toThrow('FOOBAR is not a valid method, should be: GET, POST, PUT, PATCH, DELETE, OPTIONS')
  })

  test('invalid-methods-array', () => {
    const allow = ['FOOBAR', 'GET', 'SPAM'] as unknown as Method[]
    const t = () => as_path_view(['/test/', {allow, view: view_func}])
    expect(t).toThrow('FOOBAR, SPAM is not a valid method, should be: GET, POST, PUT, PATCH, DELETE, OPTIONS')
  })
})
