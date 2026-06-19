import McEntity, { McSerializable } from "@moca-labs/entity-kit-ts";

@McEntity.ENTITY
export class UserParam extends McSerializable {
	constructor(_data: object = {}) {
		super();
	}

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	userId: string = "";

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	name: string = "";
}

@McEntity.ENTITY
export class PageBParam extends McSerializable {
	constructor(_data: object = {}) {
		super();
	}

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	title: string = "";

	@McEntity.FIELD(Number)
	@McEntity.SERIALIZE
	count: number = 0;
}

@McEntity.ENTITY
export class AddressInfo extends McSerializable {
	constructor(_data: object = {}) {
		super();
	}

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	city: string = "";

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	street: string = "";
}

@McEntity.ENTITY
export class UserResult extends McSerializable {
	constructor(_data: object = {}) {
		super();
	}

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	userId: string = "";

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	name: string = "";

	@McEntity.FIELD(String)
	@McEntity.SERIALIZE
	memo: string = "";

	@McEntity.FIELD(AddressInfo)
	@McEntity.SERIALIZE
	address: AddressInfo = new AddressInfo();
}
