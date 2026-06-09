import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "Home", component: () => import("./pages/HomePage.vue") },
    { path: "/page-a", name: "PageA", component: () => import("./pages/PageA.vue") },
    { path: "/page-b", name: "PageB", component: () => import("./pages/PageB.vue") },
    { path: "/user-edit", name: "UserEdit", component: () => import("./pages/UserEditPage.vue") },
  ],
});

export default router;
