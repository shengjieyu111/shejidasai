<template>
  <RouterView v-slot="{ Component, route }">
    <KeepAlive include="HomePage">
      <component :is="Component" :key="route.meta.keepAlive ? 'home' : route.name || route.fullPath" />
    </KeepAlive>
  </RouterView>
</template>
