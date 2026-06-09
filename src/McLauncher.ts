import { onActivated, onMounted } from "vue";
import type { McSerializable } from "@moca-labs/entity-kit-ts";
import { McRouterSession } from "./McRouterSession";
import { McRouter } from "./McRouter";

interface LauncherOptions<T extends McSerializable> {
	onResult: (result: T) => void;
	onCancel?: () => void;
}

interface Launcher {
	launch: (name: string, param?: McSerializable) => void;
}

export function McLauncher<T extends McSerializable>(
	launcherKey: string,
	resultType: new (data: object) => T,
	options: LauncherOptions<T>,
): Launcher {
	const checkPending = () => {
		const navKey = McRouterSession.findNavKeyByLauncher(launcherKey);
		if (!navKey) return;

		const status = McRouterSession.getStatus(navKey);

		if (status === "resolved") {
			const result = McRouterSession.loadResult(navKey, resultType);
			McRouterSession.cleanup(navKey);
			if (result) options.onResult(result);
		} else if (status === "rejected") {
			McRouterSession.cleanup(navKey);
			options.onCancel?.();
		}
	};

	onMounted(checkPending);
	onActivated(checkPending);

	return {
		launch(name: string, param?: McSerializable) {
			McRouter._pushWithLauncher(name, param, launcherKey);
		},
	};
}
