<template>
  <div style="padding:2rem; font-family:sans-serif; max-width:480px">
    <h2>Page B</h2>
    <StackView style="margin-bottom:1.5rem" />

    <section style="margin-bottom:2rem">
      <h3>받은 파라미터</h3>
      <div v-if="param" style="background:#fafafa; padding:1rem; border-radius:6px; font-size:13px">
        <pre style="margin:0">{{ JSON.stringify(param.toJson(), null, 2) }}</pre>
      </div>
      <div v-else style="color:#999; font-size:13px">파라미터 없음 (replace로 진입했거나 직접 접근)</div>
    </section>

    <hr style="margin:1.5rem 0" />

    <section style="margin-bottom:2rem">
      <h3>back — 숫자</h3>
      <div style="display:flex; gap:0.75rem; margin-top:0.5rem">
        <button @click="onBack1">back(1)</button>
        <button @click="onBack2">back(2)</button>
      </div>
    </section>

    <section>
      <h3>back — route name</h3>
      <div style="background:#f5f5f5; border-radius:6px; padding:0.75rem; font-size:13px; font-family:monospace; margin-bottom:0.75rem; line-height:1.8">
        <div style="color:#888">stack: [ Home, PageA, PageA, PageB ]</div>
        <div>back('PageA') → 가장 가까운 PageA (1칸)</div>
        <div>back('Home') → Home (3칸)</div>
      </div>
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap">
        <button @click="onBackToPageA">back('PageA')</button>
        <button @click="onBackToHome">back('Home')</button>
        <button @click="onBackToMissing" style="color:#c00">back('없는페이지')</button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import { PageBParam } from "../params/UserParam";
import StackView from "../components/StackView.vue";
import { onMounted, ref } from "vue";

let param = ref(McRouter.params(PageBParam));

function onBack1() { McRouter.back(1) }
function onBack2() { McRouter.back(2) }
function onBackToPageA() { McRouter.back("PageA") }
function onBackToHome() { McRouter.back("Home") }
function onBackToMissing() { McRouter.back("없는페이지") }


onMounted(() => {
  console.log(`${param.value?.title} ${param.value?.count}`);
  if(param.value !== undefined) {
    param.value.title = '모카 바보 아니다'
  }
  });
</script>
