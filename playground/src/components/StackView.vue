<template>
  <div style="background:#1e1e1e; color:#d4d4d4; padding:0.75rem 1rem; border-radius:6px; font-size:13px; font-family:monospace">
    <span style="color:#888">stack </span>
    <span v-for="(entry, i) in stack" :key="entry.navKey">
      <span :style="{ color: i === stack.length - 1 ? '#4fc1ff' : '#9cdcfe' }">{{ entry.route }}</span>
      <span v-if="i < stack.length - 1" style="color:#888"> → </span>
    </span>
    <span v-if="stack.length === 0" style="color:#888">empty</span>
  </div>
</template>

<script setup lang="ts">
import { shallowRef } from "vue";
import { useRouter } from "vue-router";
import { McNavigationStack } from "@moca-labs/vue-router-kit-ts";

const router = useRouter();
const stack = shallowRef([...McNavigationStack.all()]);

router.afterEach(() => {
  stack.value = [...McNavigationStack.all()];
});
</script>
