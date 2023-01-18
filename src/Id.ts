import type Sql from '.';
import defineProp from './defineProp';
import getId from './getId';

const Id: Sql.IdConstructor = function (
	this: any,
	id: string,
	group?: string,
): Sql.Id {
	const that = this instanceof Id
		? this as Sql.Id
		: Object.create(Id.prototype) as Sql.Id;
	that.id = id;
	that.group = group;
	return that;
} as any;
defineProp(Id.prototype, 'toString', function(
	this: Sql.Id,
): string {
	return getId(this.id);
});

defineProp(Id.prototype, 'transform', function(
	this: Sql.Id,
	transformer: Sql.Transformer,
): Sql.Id {
	const {id, group} = this;
	return Id(transformer(id, group), group);
});
export default Id;
