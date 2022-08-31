import type TaggedSql from '.';
import defineProp from './defineProp';
import getId from './getId';
import isFunction from './isFunction';

function Id(this: any, id: string, group?: string): TaggedSql.Id {
	const that = this instanceof Id
		? this as TaggedSql.Id
		: Object.create(Id.prototype) as TaggedSql.Id;
	that.id = id;
	that.group = group;
	return that;
}
defineProp(Id.prototype, 'toString', function(
	this: TaggedSql.Id,
	transformer?: TaggedSql.Transformer,
): string {
	let {id} = this;
	if (isFunction(transformer)) { id = transformer(id, this.group); }
	id = getId(id);
	return id;
});

export default Id as TaggedSql.IdConstructor;
