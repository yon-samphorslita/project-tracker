<template>
  <div class="rounded-md p-4 bg-[#C6E7FF] flex items-center justify-center flex-col gap-2">
    <p class="text-4xl font-bold">{{ value }}</p>

    <h3 class="text-xl font-semibold w-[130px] text-center">{{ title }}</h3>
  </div>
</template>
<script>
export default {
  name: 'OverviewCard',
  props: {
    title: { type: String, required: true },
    value: { type: [String, Number], required: true },
  },
}
</script>
