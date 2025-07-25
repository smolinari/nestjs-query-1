import * as nestjsGraphQL from '@nestjs/graphql'
import { FilterableField } from '@ptc-org/nestjs-query-graphql'

import { getFilterableFields } from '../../src/decorators'

const { Float, ObjectType, Field, Int } = nestjsGraphQL

jest.mock('@nestjs/graphql', (): any => ({
  __esModule: true,
  ...jest.requireActual('@nestjs/graphql')
}))

describe('FilterableField decorator', (): void => {
  const fieldSpy = jest.spyOn(nestjsGraphQL, 'Field')
  beforeAll(() => jest.clearAllMocks())

  it('should store metadata', () => {
    const floatReturnFunc = () => Float

    @ObjectType('test')
    class TestDto {
      @FilterableField()
      stringField!: string

      @FilterableField({ nullable: true })
      stringOptionalField?: string

      @FilterableField(floatReturnFunc, { nullable: true })
      floatField?: number

      @FilterableField(undefined, { nullable: true })
      numberField?: number

      @FilterableField({ filterOnly: true })
      filterOnlyField!: string
    }

    const fields = getFilterableFields(TestDto)
    expect(fields).toMatchObject([
      { propertyName: 'stringField', target: String, advancedOptions: undefined, returnTypeFunc: expect.any(Function) },
      {
        propertyName: 'stringOptionalField',
        target: String,
        advancedOptions: { nullable: true },
        returnTypeFunc: expect.any(Function)
      },
      {
        propertyName: 'floatField',
        target: Number,
        advancedOptions: { nullable: true },
        returnTypeFunc: floatReturnFunc
      },
      { propertyName: 'numberField', target: Number, advancedOptions: { nullable: true }, returnTypeFunc: expect.any(Function) },
      {
        propertyName: 'filterOnlyField',
        target: String,
        advancedOptions: { filterOnly: true },
        returnTypeFunc: expect.any(Function)
      }
    ])
    expect(fieldSpy).toHaveBeenCalledTimes(4)
    expect(fieldSpy).toHaveBeenNthCalledWith(1)
    expect(fieldSpy).toHaveBeenNthCalledWith(2, { nullable: true })
    expect(fieldSpy).toHaveBeenNthCalledWith(3, floatReturnFunc, { nullable: true })
    expect(fieldSpy).toHaveBeenNthCalledWith(4, { nullable: true })
  })

  describe('getFilterableObjectFields', () => {
    @ObjectType({ isAbstract: true })
    class BaseType {
      @FilterableField(() => Int)
      id!: number

      @Field()
      referenceId!: number
    }

    @ObjectType()
    class ImplementingClass extends BaseType {
      @FilterableField()
      implemented!: boolean
    }

    @ObjectType()
    class DuplicateImplementor extends ImplementingClass {
      @FilterableField({ name: 'test' })
      id!: number

      @Field()
      someReferenceId!: number
    }

    it('should return filterable fields for a type', () => {
      expect(getFilterableFields(BaseType)).toEqual([
        { propertyName: 'id', schemaName: 'id', target: Number, returnTypeFunc: expect.any(Function) }
      ])
    })

    it('should return inherited filterable fields for a type', () => {
      expect(getFilterableFields(ImplementingClass)).toEqual([
        {
          propertyName: 'id',
          schemaName: 'id',
          target: Number,
          returnTypeFunc: expect.any(Function),
          advancedOptions: undefined
        },
        {
          propertyName: 'implemented',
          schemaName: 'implemented',
          target: Boolean,
          returnTypeFunc: expect.any(Function),
          advancedOptions: undefined
        }
      ])
    })

    it('should exclude duplicate fields inherited filterable fields for a type', () => {
      expect(getFilterableFields(DuplicateImplementor)).toEqual([
        {
          propertyName: 'implemented',
          schemaName: 'implemented',
          target: Boolean,
          advancedOptions: undefined,
          returnTypeFunc: expect.any(Function)
        },
        {
          propertyName: 'id',
          schemaName: 'test',
          target: Number,
          advancedOptions: { name: 'test' },
          returnTypeFunc: expect.any(Function)
        }
      ])
    })
  })
})
