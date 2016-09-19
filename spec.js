/* globals describe, it, beforeEach */
/* eslint-disable no-sequences */
const chai = require('chai')
chai.use(require('chai-as-promised'))
const { expect } = chai
const schema = require('./index')

describe('merging @skip and @include', () => {
  // behavior as defined in
  // https://github.com/facebook/graphql/blob/master/spec/Section%203%20--%20Type%20System.md#include

  let include
  let skip
  let queryString
  beforeEach(() => {
    queryString = () => `
      query {
        hello @include(if: ${include}) @skip(if: ${skip})
      }
    `
  })
  const result = () => schema.execute(queryString())
  const assertIncluded = () => expect(result().then(({data}) => data)).to.eventually.have.property('hello')
  const assertNotIncluded = () => expect(result().then(({data}) => data)).to.eventually.not.have.property('hello')

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
          query {
            hello,
            ...F0
          }
          fragment F0 on RootQueryType {
            hello @skip(if: ${skip})
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
        query {
          hello @include(if: ${include})
          ...F0
        }
        fragment F0 on RootQueryType {
          hello @skip(if: ${skip})
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
