<template lang="pug">
  .arrow-container
    svg(width='1000' height='750')
      defs
        linearGradient#blue(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#2e6aef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#611bea;stop-opacity:1')

        linearGradient#blue-reverse(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#611bea;stop-opacity:1')
          stop(offset='100%' style='stop-color:#2e6aef;stop-opacity:1')

        linearGradient#light-blue(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#06b8ef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#2e6aef;stop-opacity:1')

        linearGradient#light-blue-reverse(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#2e6aef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#06b8ef;stop-opacity:1')

        linearGradient#purple(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#2e6aef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#18202d;stop-opacity:1')

      g(v-for='arrow in arrows' :style='`transform: scale(${arrow.scale}) translate(${arrow.offset.x}px, ${arrow.offset.y}px)`')
        path.arrow(:fill='`url(#${arrow.color})`' :style='`animation-duration: ${arrow.animationDuration}s`' d='M712.3,266.5L519.4,405c-3,2.2-2.6,6.8,0.7,8.4l35.5,17c2.4,1.2,3.5,4.1,2.3,6.5L312.2,950.5c-1.2,2.4-0.1,5.4,2.3,6.5\
          l117.5,56.2c2.4,1.2,5.4,0.1,6.5-2.3l245.8-513.7c1.2-2.4,4.1-3.5,6.5-2.3l35.5,17c3.4,1.6,7.2-1,7-4.7l-13.2-237.1\
          C719.9,266.4,715.5,264.3,712.3,266.5z')

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component
export default class Arrows extends Vue {
  arrows = [
    {
      color: 'blue',
      offset: {
        y: -150,
        x: 0
      },
      scale: 1,
      animationDuration: 10,
    },
    {
      color: 'blue-reverse',
      offset: {
        y: 400,
        x: 350
      },
      scale: .7,
      animationDuration: 8,
    },
    {
      color: 'light-blue',
      offset: {
        y: 90,
        x: -190
      },
      scale: .85,
      animationDuration: 6,
    },
    {
      color: 'purple',
      offset: {
        y: 450,
        x: -20
      },
      scale: .7,
      animationDuration: 7,
    },
    {
      color: 'light-blue-reverse',
      offset: {
        y: 1200,
        x: 800
      },
      scale: .4,
      animationDuration: 3,
    },
  ]
}
</script>

<style lang="scss">
  .arrow-container {
    transform: translate(-40%, 8px)
  }
  // Angle ratio: -2.75
  @keyframes example {
    0%   {transform: translate(0px, 0px);}
    50%  {transform: translate(2%, -5.5%);}
    100% {transform: translate(0px, 0px);}
  }
  .arrow {
    position: relative;
    animation: example 10s infinite ease-in-out;
  }
</style>