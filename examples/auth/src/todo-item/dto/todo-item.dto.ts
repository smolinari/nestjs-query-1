import { FilterableField, FilterableConnection, Relation } from '@nestjs-query/query-graphql';
import { ObjectType, ID, GraphQLISODateTime, Field } from '@nestjs/graphql';
import { AuthGuard } from '../../auth.guard';
import { SubTaskDTO } from '../../sub-task/dto/sub-task.dto';
import { TagDTO } from '../../tag/dto/tag.dto';
import { UserDTO } from '../../user/user.dto';

@ObjectType('TodoItem')
@Relation('owner', () => UserDTO, { disableRemove: true, guards: [AuthGuard] })
@FilterableConnection('subTasks', () => SubTaskDTO, { disableRemove: true, guards: [AuthGuard] })
@FilterableConnection('tags', () => TagDTO, { guards: [AuthGuard] })
export class TodoItemDTO {
  @FilterableField(() => ID)
  id!: number;

  @FilterableField()
  title!: string;

  @FilterableField({ nullable: true })
  description?: string;

  @FilterableField()
  completed!: boolean;

  @FilterableField(() => GraphQLISODateTime)
  created!: Date;

  @FilterableField(() => GraphQLISODateTime)
  updated!: Date;

  @Field()
  age!: number;

  @FilterableField()
  priority!: number;

  @FilterableField({ nullable: true })
  createdBy?: string;

  @FilterableField({ nullable: true })
  updatedBy?: string;
}