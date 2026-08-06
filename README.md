# @moca-labs/vue-router-kit-ts

Vue Router 기반 화면 전환 및 파라미터/결과 전달 관리 라이브러리입니다.  
`push` / `resolve` / `reject` 패턴으로 화면 간 데이터를 타입 안전하게 주고받을 수 있습니다.

## 설치

```bash
npm install @moca-labs/vue-router-kit-ts @moca-labs/entity-kit-ts vue-router
```

> `reflect-metadata`는 필요하지 않습니다. TC39 Stage 3 데코레이터를 사용합니다.

---

## Vite 설정 — 데코레이터 lowering

Vite 6+ 는 기본적으로 OXC 기반 변환을 사용하는데, 이 변환은 TC39 Stage 3 데코레이터를 브라우저 호환 코드로 내려주지(lowering) 않습니다. 그 결과 `@McEntity.ENTITY` 같은 데코레이터를 쓰는 코드가 번들에 그대로 남아 브라우저에서 `SyntaxError`가 발생할 수 있습니다.

이 저장소의 데모(`demo/vite.config.ts`)는 esbuild가 데코레이터를 지원하지 않는 것으로 표시해 esbuild 경로가 데코레이터를 내려주도록 우회하는 방식으로 이 문제를 해결합니다.

```ts
// demo/vite.config.ts
export default defineConfig({
  plugins: [vue()],
  esbuild: {
    supported: { decorators: false },
  },
  // ...
});
```

> `@moca-labs/entity-kit-ts`는 같은 문제를 다루는 `entityKitPlugin()`(`@moca-labs/entity-kit-ts/vite`)도 별도로 제공합니다. 다만 이 저장소 데모에서는 사용하지 않으며 동작이 검증되지 않았으므로 참고용으로만 언급합니다.

---

## Import

```ts
import { McRouter, McLauncher } from "@moca-labs/vue-router-kit-ts";
import { McNavigationStack } from "@moca-labs/vue-router-kit-ts";
import type { StackEntry, RouterStatus } from "@moca-labs/vue-router-kit-ts";
```

---

## 설정

`main.ts`에서 `McRouter.create(router)`로 초기화합니다.  
반환값은 Vue 플러그인이므로 `app.use()`에 그대로 전달합니다.

```ts
// main.ts
import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import App from "./App.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [...],
});

const app = createApp(App);
app.use(McRouter.create(router));
app.mount("#app");
```

---

## 특징

### `McRouter.push(name, param?)` — 화면 이동

named route로 이동합니다. `param`은 `McSerializable` 인스턴스를 전달합니다.

```ts
McRouter.push("UserDetail");
McRouter.push("UserDetail", new UserParam({ userId: 42 }));
```

### `McRouter.replace(name, param?)` — 현재 화면 교체

현재 히스토리 엔트리를 대체합니다. launcher 연결은 유지됩니다.

```ts
McRouter.replace("Login");
McRouter.replace("Login", new LoginParam({ redirect: "/home" }));
```

### `McRouter.params<T>(type)` — 파라미터 수신

이동 대상 화면에서 전달받은 파라미터를 읽습니다.

```ts
const param = McRouter.params(UserParam);
if (param) {
  console.log(param.userId); // 42
}
```

### `McRouter.resolve(result?)` — 결과 반환 후 뒤로 이동

성공 결과를 launcher에게 전달하고 이전 화면으로 돌아갑니다.

```ts
McRouter.resolve();
McRouter.resolve(new UserResult({ name: "Alice" }));
```

### `McRouter.reject()` — 취소 후 뒤로 이동

결과 없이 이전 화면으로 돌아갑니다. launcher의 `onCancel`이 호출됩니다.

```ts
McRouter.reject();
```

### `McRouter.back(stepsOrName?)` — 여러 단계 뒤로 이동

숫자를 전달하면 N단계, route 이름을 전달하면 해당 화면까지 한 번에 돌아갑니다.

```ts
McRouter.back();           // 1단계 뒤로
McRouter.back(2);          // 2단계 뒤로
McRouter.back("Home");     // "Home" route가 나올 때까지 뒤로
```

### `McRouter.navKey` — 현재 navKey (readonly ref)

현재 화면의 navigation key를 나타내는 reactive ref입니다.  
화면 전환 감지나 조건부 렌더링에 활용할 수 있습니다.

```ts
import { watch } from "vue";

watch(McRouter.navKey, (key) => {
  console.log("현재 navKey:", key);
});
```

---

### `McLauncher(launcherKey, resultType, options)` — 결과 수신 composable

서브 화면을 열고, 결과(`resolve`) 또는 취소(`reject`) 콜백을 등록합니다.  
`onMounted` / `onActivated` 시점에 자동으로 결과를 확인합니다.

```ts
const launcher = McLauncher("selectUser", UserResult, {
  onResult(result) {
    console.log("선택된 유저:", result.name);
  },
  onCancel() {
    console.log("취소됨");
  },
});

// 화면 열기
launcher.launch("UserSelect");
launcher.launch("UserSelect", new UserParam({ role: "admin" }));
```

| 옵션 | 설명 |
|---|---|
| `launcherKey` | launcher를 식별하는 고유 문자열 |
| `resultType` | 결과를 역직렬화할 `McSerializable` 클래스 |
| `onResult(result)` | `McRouter.resolve(result)` 호출 시 실행 |
| `onCancel()` | `McRouter.reject()` 또는 브라우저 뒤로가기 시 실행 (선택) |

---

### `McNavigationStack` — 네비게이션 스택 조회

현재 화면 스택의 상태를 읽을 수 있습니다.

```ts
McNavigationStack.all();   // StackEntry[] — 전체 스택
McNavigationStack.top();   // StackEntry | undefined — 현재 화면
McNavigationStack.size();  // number — 스택 깊이
```

`StackEntry` 타입:

```ts
interface StackEntry {
  navKey: string;  // 고유 navigation key
  route: string;   // route 이름
}
```

### `RouterStatus` 타입

각 화면의 생명주기 상태를 나타냅니다.

```ts
type RouterStatus = "pending" | "resolved" | "rejected";
```

---

## 내부 동작 — sessionStorage

라이브러리는 화면 간 파라미터·결과·상태를 **`sessionStorage`**에 저장합니다.  
브라우저 탭이 닫히면 자동으로 사라지며, 다른 탭과는 공유되지 않습니다.

| 키 형식 | 저장 내용 |
|---|---|
| `mcrouter:stack` | 네비게이션 스택 전체 (새로고침 복원용) |
| `mcrouter:{navKey}:param` | 이동 시 전달된 파라미터 (JSON) |
| `mcrouter:{navKey}:result` | `resolve()` 로 반환된 결과 (JSON) |
| `mcrouter:{navKey}:status` | `pending` / `resolved` / `rejected` |
| `mcrouter:{navKey}:launcher` | 연결된 launcher 식별자 |

`navKey`는 화면 전환마다 자동 생성(`mcr_0`, `mcr_1`, …)되며, 화면이 닫힐 때 해당 항목은 자동으로 정리됩니다.  
새로고침 후에도 스택 및 파라미터가 복원되므로, 브라우저 새로고침 상황에서 정상 동작합니다.

---

## 예제

```ts
// entities.ts — 파라미터 / 결과 Entity
import McEntity, { McSerializable } from "@moca-labs/entity-kit-ts";

@McEntity.ENTITY
export class UserParam extends McSerializable {
  constructor(_data: object = {}) { super(); }

  @McEntity.FIELD(String)
  @McEntity.SERIALIZE
  userId: string = "";
}

@McEntity.ENTITY
export class UserResult extends McSerializable {
  constructor(_data: object = {}) { super(); }

  @McEntity.FIELD(String)
  @McEntity.SERIALIZE
  name: string = "";
}
```

```vue
<!-- HomeView.vue — 화면 열기 -->
<script setup lang="ts">
import { McLauncher } from "@moca-labs/vue-router-kit-ts";
import { UserParam, UserResult } from "./entities";

const launcher = McLauncher("selectUser", UserResult, {
  onResult(result) {
    console.log("선택된 유저:", result.name);
  },
  onCancel() {
    console.log("선택 취소");
  },
});

function openUserSelect() {
  launcher.launch("UserSelect", new UserParam({ userId: "u001" }));
}
</script>
```

```vue
<!-- UserSelectView.vue — 파라미터 수신 및 결과 반환 -->
<script setup lang="ts">
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import { UserParam, UserResult } from "./entities";

const param = McRouter.params(UserParam);
console.log(param?.userId); // "u001"

function confirm(name: string) {
  McRouter.resolve(new UserResult({ name }));
}

function cancel() {
  McRouter.reject();
}
</script>
```
