import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';

function Id(this: any, id: string, group?: string): TaggedSql.Id {
	const that = this instanceof Id
		? this as TaggedSql.Id
		: Object.create(Id.prototype) as TaggedSql.Id;
	that.id = id;
	that.group = group;
	return that;
}
defineProp(Id.prototype as TaggedSql.Id, 'toString', function(
	this: TaggedSql.Id,
): string {
	return getId(this.id);
});

defineProp(Id.prototype as TaggedSql.Id, 'transform', function(
	this: TaggedSql.Id,
	transformer: TaggedSql.Transformer,
): TaggedSql.Id {
	const {id, group} = this;
	return Id(transformer(id, group), group);
});
export default Id as TaggedSql.IdConstructor;
