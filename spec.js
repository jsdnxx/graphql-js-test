/* globals describe, it, beforeEach */
/* eslint-disable no-sequences */
const chai = require('chai')
chai.use(require('chai-as-promised'))
const { expect } = chai
const schema = require('./index')

function expectData ({data, errors}) {
  expect(errors).to.not.exist
  expect(data).to.be.an('object')
  return data
}

describe('merging @skip and @include', () => {
  // behavior as defined in
  // https://github.com/facebook/graphql/blob/master/spec/Section%203%20--%20Type%20System.md#include

  let include
  let skip
  let queryString
  beforeEach(() => {
    queryString = () => `
      query ($include: Boolean!, $skip: Boolean!) {
        hello @include(if: ${include}) @skip(if: ${skip}),
        withVariables: hello @include(if: $include) @skip(if: $skip)
      }
    `
  })
  const variables = () => ({skip, include})
  const result = () => schema.execute(queryString(), variables())
  const assertIncluded = () => result().then(expectData).then(data => {
    expect(data).to.have.property('hello')
    expect(data).to.have.property('withVariables')
  })

  const assertNotIncluded = () => result().then(expectData).then(data => {
    expect(data).not.to.have.property('hello')
    expect(data).not.to.have.property('withVariables')
  })

  describe('when @skip=false and @include=true', () => {
    it('is included', () => {
      skip = false, include = true
      return assertIncluded()
    })
  })

  describe('when @skip=false and @include=false', () => {
    it('is not included', () => {
      skip = false, include = false
      return assertNotIncluded()
    })
  })

  describe('when @skip=true and @include=true', () => {
    it('is not included', () => {
      skip = true, include = true
      return assertNotIncluded()
    })
  })

  describe('when @skip=true and @include=false', () => {
    it('is not included', () => {
      skip = true, include = false
      return assertNotIncluded()
    })
  })

  describe('when evaluating skip on query selection and fragment', () => {
    describe('with @skip', () => {
      beforeEach(() => {
        queryString = () => `
          query ($skip: Boolean!) {
            hello,
            withVariables: hello,
            ...F0
          }
          fragment F0 on RootQueryType {
            hello @skip(if: ${skip}),
            withVariables: hello @skip(if: $skip)
          }
        `
      })
      describe('and @skip=false', () => {
        it('is included', () => {
          skip = false
          return assertIncluded()
        })
      })
      describe('and @skip=true', () => {
        it('is included', () => {
          skip = true
          return assertIncluded()
        })
      })
    })
  })

  describe('when evaluating conflicting @skip and @include on query selection and fragment', () => {
    beforeEach(() => {
      queryString = () => `
        query ($include: Boolean!, $skip: Boolean!) {
          hello @include(if: ${include}),
          withVariables: hello @include(if: $include),
          ...F0
        }
        fragment F0 on RootQueryType {
          hello @skip(if: ${skip}),
          withVariables: hello @skip(if: $skip)
        }
      `
    })
    describe('when @skip=false and @include=true', () => {
      it('is included', () => {
        skip = false, include = true
        return assertIncluded()
      })
    })
    describe('when @skip=false and @include=false', () => {
      it('is included', () => {
        skip = false, include = true
        return assertIncluded()
      })
    })
    describe('when @skip=true and @include=true', () => {
      it('is included', () => {
        skip = true, include = true
        return assertIncluded()
      })
    })
    describe('when @skip=true and @include=false', () => {
      it('is not included', () => {
        skip = true, include = false
        return assertNotIncluded()
      })
    })
  })
})
