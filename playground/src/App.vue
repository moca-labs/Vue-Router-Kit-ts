<template>
  <RouterView v-slot="{ Component }">
    <KeepAlive>
      <component :is="Component" :key="navKey" />
    </KeepAlive>
  </RouterView>
</template>

<script setup lang="ts">
import { McRouter } from "@moca-labs/vue-router-kit-ts";

const navKey = McRouter.navKey;
</script>
