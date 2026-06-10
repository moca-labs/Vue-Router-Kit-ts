import type { McSerializable } from "@moca-labs/entity-kit-ts";

const PREFIX = "mcrouter";

export type RouterStatus = "pending" | "resolved" | "rejected";

function key(navKey: string, field: string): string {
	return `${PREFIX}:${navKey}:${field}`;
}

export const McRouterSession = {
	saveParam(navKey: string, param: McSerializable): void {
		sessionStorage.setItem(
			key(navKey, "param"),
			JSON.stringify(param.toJson()),
		);
	},

	loadParam<T extends McSerializable>(
		navKey: string,
		type: new (data: object) => T,
	): T | undefined {
		const raw = sessionStorage.getItem(key(navKey, "param"));
		if (!raw) return undefined;
		try {
			return new type(JSON.parse(raw));
		} catch {
			sessionStorage.removeItem(key(navKey, "param"));
			return undefined;
		}
	},

	saveResult(navKey: string, result: McSerializable): void {
		sessionStorage.setItem(
			key(navKey, "result"),
			JSON.stringify(result.toJson()),
		);
	},

	loadResult<T extends McSerializable>(
		navKey: string,
		type: new (data: object) => T,
	): T | undefined {
		const raw = sessionStorage.getItem(key(navKey, "result"));
		if (!raw) return undefined;
		try {
			return new type(JSON.parse(raw));
		} catch {
			sessionStorage.removeItem(key(navKey, "result"));
			return undefined;
		}
	},

	setStatus(navKey: string, status: RouterStatus): void {
		sessionStorage.setItem(key(navKey, "status"), status);
	},

	getStatus(navKey: string): RouterStatus | null {
		return sessionStorage.getItem(key(navKey, "status")) as RouterStatus | null;
	},

	saveLauncherKey(navKey: string, launcherKey: string): void {
		sessionStorage.setItem(key(navKey, "launcher"), launcherKey);
	},

	findNavKeyByLauncher(launcherKey: string): string | null {
		const prefix = `${PREFIX}:`;
		const suffix = ":launcher";
		for (let i = 0; i < sessionStorage.length; i++) {
			const k = sessionStorage.key(i);
			if (
				k?.startsWith(prefix) &&
				k.endsWith(suffix) &&
				sessionStorage.getItem(k) === launcherKey
			) {
				return k.slice(prefix.length, k.length - suffix.length);
			}
		}
		return null;
	},

	cleanup(navKey: string): void {
		for (const field of ["param", "result", "status", "launcher"]) {
			sessionStorage.removeItem(key(navKey, field));
		}
	},

	removeParam(navKey: string): void {
		sessionStorage.removeItem(key(navKey, "param"));
	},
};
