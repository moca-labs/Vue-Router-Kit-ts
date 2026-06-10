import { ref, readonly, type App } from "vue";
import { isNavigationFailure, NavigationFailureType, type Router } from "vue-router";
import type { McSerializable } from "@moca-labs/entity-kit-ts";
import { McRouterSession } from "./McRouterSession";
import { McNavigationStack } from "./McNavigationStack";

const ROUTER_KEY = "_mcrouterKey";

let _router: Router | null = null;
let _navCounter = 0;
let _pendingNav: "push" | "replace" | "back" | null = null;
let _initialized = false;

const _navKey = ref<string | undefined>(undefined);

function getRouter(): Router {
	if (!_router) {
		throw new Error(
			"[McRouter] Router not initialized. Call McRouter.create(router) in main.ts.",
		);
	}
	return _router;
}

function nextKey(): string {
	return `mcr_${_navCounter++}`;
}

function currentNavKey(): string | undefined {
	return (window.history.state as Record<string, unknown> | undefined)?.[
		ROUTER_KEY
	] as string | undefined;
}

export namespace McRouter {
	export const navKey = readonly(_navKey);

	export function push(name: string, param?: McSerializable): void {
		_pushWithLauncher(name, param, undefined);
	}

	export function replace(name: string, param?: McSerializable): void {
		const router = getRouter();
		const top = McNavigationStack.top();

		if (!top) {
			_pushWithLauncher(name, param, undefined);
			return;
		}

		// navKey는 유지 → launcher 연결 보존
		const navKey = top.navKey;
		McNavigationStack.replaceTop(name);
		if (param) McRouterSession.saveParam(navKey, param);

		_pendingNav = "replace";
		router.replace({ name, state: { [ROUTER_KEY]: navKey } });
	}

	export function _pushWithLauncher(
		name: string,
		param: McSerializable | undefined,
		launcherKey: string | undefined,
	): void {
		const router = getRouter();
		const navKey = nextKey();

		McNavigationStack.push({ navKey, route: name });
		if (param) McRouterSession.saveParam(navKey, param);
		if (launcherKey) McRouterSession.saveLauncherKey(navKey, launcherKey);
		McRouterSession.setStatus(navKey, "pending");

		_pendingNav = "push";
		router.push({ name, state: { [ROUTER_KEY]: navKey } }).then((failure) => {
			if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
				// 동일 route push는 Vue Router가 히스토리 엔트리를 생성하지 않으므로 직접 추가
				window.history.pushState({ [ROUTER_KEY]: navKey }, "", window.location.href);
				_navKey.value = navKey;
			}
		});
	}

	export function params<T extends McSerializable>(
		type: new (data: object) => T,
	): T | undefined {
		const navKey = currentNavKey();
		if (!navKey) return undefined;
		return McRouterSession.loadParam(navKey, type);
	}

	export function resolve<T extends McSerializable>(result?: T): void {
		const navKey = currentNavKey();

		if (navKey) {
			if (result) McRouterSession.saveResult(navKey, result);
			McRouterSession.setStatus(navKey, "resolved");
			McRouterSession.removeParam(navKey);
			McNavigationStack.pop();
		}

		_pendingNav = "back";
		getRouter().back();
	}

	export function reject(): void {
		const navKey = currentNavKey();

		if (navKey) {
			McRouterSession.setStatus(navKey, "rejected");
			McRouterSession.removeParam(navKey);
			McNavigationStack.pop();
		}

		_pendingNav = "back";
		getRouter().back();
	}

	export function back(stepsOrName: number | string = 1): void {
		let steps: number;

		if (typeof stepsOrName === "string") {
			const stack = McNavigationStack.all();
			let found = -1;
			for (let i = stack.length - 2; i >= 0; i--) {
				if (stack[i].route === stepsOrName) {
					found = i;
					break;
				}
			}
			if (found === -1) {
				console.warn(`[McRouter] back('${stepsOrName}'): route not found in stack`);
				return;
			}
			steps = stack.length - 1 - found;
		} else {
			steps = stepsOrName;
		}

		for (let i = 0; i < steps; i++) {
			const top = McNavigationStack.top();
			if (top) {
				McRouterSession.setStatus(top.navKey, "rejected");
				McRouterSession.removeParam(top.navKey);
				McNavigationStack.pop();
			}
		}
		_pendingNav = "back";
		getRouter().go(-steps);
	}

	export function create(router: Router): { install(app: App): void } {
		_router = router;
		_initialized = false;

		McNavigationStack.restore();
		const existingNavKey = currentNavKey();
		if (existingNavKey) {
			McNavigationStack.syncTo(existingNavKey);
			_navKey.value = existingNavKey;
		}

		router.afterEach((to) => {
			if (!_initialized) {
				_initialized = true;
				if (!currentNavKey() && McNavigationStack.size() === 0) {
					// 최초 진입 페이지: 스택에 추가하고 history state에 navKey 심기
					const initialKey = nextKey();
					McNavigationStack.push({ navKey: initialKey, route: to.name as string });
					McRouterSession.setStatus(initialKey, "pending");
					window.history.replaceState(
						{ ...window.history.state, [ROUTER_KEY]: initialKey },
						"",
					);
					_navKey.value = initialKey;
				} else {
					_navKey.value = currentNavKey();
				}
				return;
			}

			if (_pendingNav !== null) {
				_pendingNav = null;
				_navKey.value = currentNavKey();
				return;
			}

			// 브라우저 뒤로가기: newNavKey와 일치할 때까지 스택을 모두 pop (다단계 뒤로가기 대응)
			const newNavKey = currentNavKey();

			let top = McNavigationStack.top();
			while (top && top.navKey !== newNavKey) {
				McNavigationStack.pop();
				const status = McRouterSession.getStatus(top.navKey);
				if (status === "pending") {
					McRouterSession.setStatus(top.navKey, "rejected");
					McRouterSession.removeParam(top.navKey);
				}
				top = McNavigationStack.top();
			}
			_navKey.value = newNavKey;
		});

		return {
			install(app) {
				app.use(router);
			},
		};
	}
}
