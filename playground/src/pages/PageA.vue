<template>
  <div style="padding:2rem; font-family:sans-serif; max-width:480px">
    <h2>Page A</h2>
    <StackView style="margin-bottom:1rem" />

    <div style="background:#fff8e1; border:1px solid #ffe082; border-radius:6px; padding:0.75rem 1rem; margin-bottom:1.5rem; font-size:13px">
      <strong>keep-alive 확인</strong>
      <div style="margin-top:0.4rem; display:flex; align-items:center; gap:1rem">
        <span>활성화 횟수: <strong>{{ activateCount }}</strong></span>
        <span style="color:#888">| 입력값: <strong>{{ memo }}</strong></span>
      </div>
      <input v-model="memo" placeholder="입력 후 다른 페이지 다녀오기" style="margin-top:0.5rem; padding:4px 8px; width:100%; box-sizing:border-box" />
    </div>

    <section style="margin-bottom:2rem">
      <h3>push</h3>
      <div style="display:flex; gap:0.75rem; margin-top:0.5rem">
        <button @click="onPushSelf">push → PageA (자기 자신)</button>
        <button @click="onPushB">push → PageB</button>
      </div>
      <p style="color:#666;font-size:13px;margin-top:0.5rem">
        PageA를 여러 번 쌓아 back('PageA') 최근 조상 탐색을 테스트할 수 있습니다
      </p>
    </section>

    <section style="margin-bottom:2rem">
      <h3>replace</h3>
      <p style="color:#666;font-size:14px">현재 PageA 자리를 PageB로 교체</p>
      <button @click="onReplace">replace → PageB</button>
    </section>

    <section>
      <h3>back</h3>
      <div style="display:flex; gap:0.75rem; margin-top:0.5rem">
        <button @click="onBack1">back(1)</button>
        <button @click="onBackHome">back('Home')</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated } from "vue";
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import { PageBParam } from "../params/UserParam";
import StackView from "../components/StackView.vue";

defineOptions({ name: "PageA" });

const activateCount = ref(0);
const memo = ref("");
const pushCount = ref(0);
let bParam = new PageBParam({ title: `PageA에서 보낸 메시지 #${pushCount.value}`, count: pushCount.value })

onActivated(() => {
  activateCount.value++;
  console.log(`${bParam.title} ${bParam.count}`);
});


function onPushSelf() { McRouter.push("PageA") }
function onPushB() {
  pushCount.value++;
  McRouter.push("PageB", bParam);
}
function onReplace() { McRouter.replace("PageB") }
function onBack1() { McRouter.back(1) }
function onBackHome() { McRouter.back("Home") }
</script>
