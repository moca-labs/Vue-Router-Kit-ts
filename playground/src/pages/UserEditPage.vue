<template>
  <div style="padding:2rem; font-family:sans-serif; max-width:480px">
    <h2>User Edit</h2>
    <StackView style="margin-bottom:1.5rem" />

    <div v-if="param" style="background:#fafafa; padding:1rem; border-radius:6px; margin-bottom:1.5rem">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem">
        <strong>받은 파라미터:</strong>
        <button @click="onRefresh" style="font-size:12px; padding:2px 8px">새로고침 (F5)</button>
      </div>
      <pre style="margin:0">{{ JSON.stringify(param.toJson(), null, 2) }}</pre>
      <div style="margin-top:0.5rem; font-size:12px; color:#888">
        새로고침 후 파라미터가 유지되면 sessionStorage 복원 성공 ✅
      </div>
    </div>
    <div v-else style="background:#fff3f3; padding:1rem; border-radius:6px; margin-bottom:1.5rem; font-size:13px">
      
      
      <button @click="onRefresh" style="margin-left:0.5rem; font-size:12px; padding:2px 8px">새로고침</button>
    </div>

    <div style="display:flex; flex-direction:column; gap:0.5rem; margin-bottom:1.5rem">
      <label>
        메모:
        <input v-model="memo" style="margin-left:0.5rem; padding:4px 8px" />
      </label>
      <label>
        도시:
        <input v-model="city" style="margin-left:0.5rem; padding:4px 8px" placeholder="예) 서울" />
      </label>
      <label>
        주소:
        <input v-model="street" style="margin-left:0.5rem; padding:4px 8px" placeholder="예) 강남대로 123" />
      </label>
    </div>

    <div style="display:flex; gap:0.5rem">
      <button @click="onSave">저장 (resolve)</button>
      <button @click="onCancel" style="color:red">취소 (reject)</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import { UserParam, UserResult, AddressInfo } from "../params/UserParam";
import StackView from "../components/StackView.vue";

const param = McRouter.params(UserParam);
const memo = ref("");
const city = ref("");
const street = ref("");

function onRefresh() {
  window.location.reload();
}

function onSave() {
  McRouter.resolve(
    new UserResult({
      userId: param?.userId ?? "",
      name: param?.name ?? "",
      memo: memo.value,
      address: new AddressInfo({ city: city.value, street: street.value }),
    }),
  );
}

function onCancel() {
  McRouter.reject();
}
</script>
