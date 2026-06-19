import { createApp } from "vue";
import { McRouter } from "@moca-labs/vue-router-kit-ts";
import router from "./router";
import App from "./App.vue";

const app = createApp(App);
app.use(McRouter.create(router));
app.mount("#app");
