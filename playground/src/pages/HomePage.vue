<template>
  <div style="padding:2rem; font-family:sans-serif; max-width:480px">
    <h2>Home</h2>
    <StackView style="margin-bottom:1rem" />

    <div style="background:#fff8e1; border:1px solid #ffe082; border-radius:6px; padding:0.75rem 1rem; margin-bottom:1.5rem; font-size:13px">
      <strong>keep-alive 확인</strong>
      <div style="margin-top:0.4rem; display:flex; align-items:center; gap:1rem">
        <span>활성화 횟수: <strong>{{ activateCount }}</strong></span>
        <span style="color:#888">| 입력값: <strong>{{ memo }}</strong></span>
        <button @click="memo = ''" style="font-size:12px">초기화</button>
      </div>
      <div style="color:#888; margin-top:0.4rem; font-size:12px">
        다른 페이지 이동 후 돌아오면 횟수 증가 & 입력값 유지 → keep-alive 동작 중
      </div>
      <input v-model="memo" placeholder="입력 후 다른 페이지 다녀오기" style="margin-top:0.5rem; padding:4px 8px; width:100%; box-sizing:border-box" />
    </div>

    <section style="margin-bottom:2rem">
      <h3>push</h3>
      <p style="color:#666;font-size:14px">스택에 쌓기 — Home → PageA</p>
      <button @click="onPush">push → PageA</button>
    </section>

    <section style="margin-bottom:2rem">
      <h3>replace</h3>
      <p style="color:#666;font-size:14px">현재(Home)를 교체 — Home 자리에 PageA가 들어옴</p>
      <button @click="onReplace">replace → PageA</button>
    </section>

    <section>
      <h3>McLauncher</h3>
      <p style="color:#666;font-size:14px">UserEdit 결과를 콜백으로 받기 (onActivated로 수신)</p>
      <button @click="openEdit">launch → UserEdit</button>
      <div v-if="lastResult" style="margin-top:0.75rem;background:#f0f9ff;padding:0.75rem;border-radius:6px;font-size:13px">
        <strong>결과 (address는 AddressInfo 인스턴스로 복원됨):</strong>
        <pre style="margin:0.5rem 0 0">{{ JSON.stringify(lastResult.toJson(), null, 2) }}</pre>
      </div>
      <div v-if="cancelled" style="margin-top:0.75rem;color:#999;font-size:13px">취소됨</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated } from "vue";
import { McRouter, McLauncher } from "@moca-labs/vue-router-kit-ts";
import { UserParam, UserResult } from "../params/UserParam";
import StackView from "../components/StackView.vue";

defineOptions({ name: "HomePage" });

const activateCount = ref(0);
const memo = ref("");
const lastResult = ref<UserResult | null>(null);
const cancelled = ref(false);

onActivated(() => {
  activateCount.value++;
  });

const launcher = McLauncher("home-user-moca", UserResult, {
  onResult(result) {
    lastResult.value = result;
    cancelled.value = false;
  },
  onCancel() {
    cancelled.value = true;
    lastResult.value = null;
  },
});

function onPush() { McRouter.push("PageA") }
function onReplace() { McRouter.replace("PageA") }

function openEdit() {
  cancelled.value = false;
  launcher.launch("UserEdit", new UserParam({ userId: "u001", name: "홍길동" }));
  
}
</script>
