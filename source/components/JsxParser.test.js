import React from 'react'
import TestUtils from 'react-dom/test-utils'
import { mount, shallow } from 'enzyme'
import JsxParser from './JsxParser'
import * as Acorn from 'acorn'
import acornJsx from 'acorn-jsx'
import { get } from 'enzyme/build/configuration'

jest.unmock('acorn-jsx')
jest.unmock('./JsxParser')

/* eslint-disable function-paren-newline, no-console, no-underscore-dangle */

// eslint-disable-next-line react/prop-types
const Custom = ({ children = [], className, text }) => (
  <div className={className}>
    {text}
    {children}
  </div>
)


const parser = Acorn.Parser.extend(acornJsx())

const getAst = (jsx) => {
  jsx = `<root>${jsx}</root>`
  let ast = parser.parse(jsx.trim().replace(/<!DOCTYPE([^>]*)>/g, ''))
  return ast.body[0].expression.children || []
}


describe('AstParser Component', () => {
  let parent = null
  let originalConsoleError = null
  let originalJsDomEmit = null

  beforeAll(() => {
    originalConsoleError = console.error
    console.error = jest.fn()

    originalJsDomEmit = window._virtualConsole.emit
    window._virtualConsole.emit = jest.fn()
  })

  afterAll(() => {
    console.error = originalConsoleError
    window._virtualConsole.emit = originalJsDomEmit
  })

  beforeEach(() => {
    console.error.mockReset()
    window._virtualConsole.emit.mockReset()
    parent = document.createElement('div')
  })

  function render(element) {
    const wrapper = mount(element, { attachTo: parent })
    return {
      component: wrapper.instance(),
      html: wrapper.html(),
      parent,
      rendered: wrapper.getDOMNode(),
    }
  }

  test('Ravi loaded simple html', () => {
    let jsx = `<p>Ravi loaded simple html</p>`
    let ast = getAst(jsx);
    const { html } = render(<JsxParser ast={ast} />);
    expect(html).toEqual(jsx);
  })


  test('Ravi provided react props', () => {
    let props = {
      children: <h1>Ravi Loaded simple html</h1>,
      attributes: { a : 2, b : 3 }
    }
    let jsx = `<p {...props.attributes}>{props.children}</p>`
    let ast = getAst(jsx);
    let expected = `<p a="2" b="3"><h1>Ravi Loaded simple html</h1></p>`
    const {html} = render(<JsxParser ast={ast} bindings={{props}} />);
    expect(html).toEqual(expected);
  })
  
})
