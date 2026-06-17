const SESSION_KEY = "mcrouter:stack";

export interface StackEntry {
	navKey: string;
	route: string;
}

let _stack: StackEntry[] = [];

function persist(): void {
	sessionStorage.setItem(SESSION_KEY, JSON.stringify(_stack));
}

export namespace McNavigationStack {
	export function restore(): void {
		try {
			const raw = sessionStorage.getItem(SESSION_KEY);
			_stack = raw ? (JSON.parse(raw) as StackEntry[]) : [];
		} catch {
			_stack = [];
		}
	}

	/**
	 * refresh 후 현재 페이지의 navKey를 기준으로 스택을 동기화.
	 * 해당 navKey 이후의 항목을 제거하여 실제 히스토리와 일치시킨다.
	 */
	export function syncTo(navKey: string): void {
		const idx = _stack.findIndex((e) => e.navKey === navKey);
		if (idx === -1) {
			_stack = [];
		} else {
			_stack = _stack.slice(0, idx + 1);
		}
		persist();
	}

	export function push(entry: StackEntry): void {
		_stack.push(entry);
		persist();
	}

	export function replaceTopEntry(entry: StackEntry): void {
		if (_stack.length > 0) {
			_stack[_stack.length - 1] = entry;
			persist();
		}
	}

	export function pop(): StackEntry | undefined {
		const entry = _stack.pop();
		persist();
		return entry;
	}

	export function top(): StackEntry | undefined {
		return _stack[_stack.length - 1];
	}

	export function size(): number {
		return _stack.length;
	}

	export function all(): readonly StackEntry[] {
		return [..._stack];
	}
}
