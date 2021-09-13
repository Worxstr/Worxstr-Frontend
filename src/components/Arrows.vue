<template lang="pug">
  .arrows(:style='`transform: translateY(${type == "background" ? "0" : "11"}px)`')
    svg(:width='groupType.size.x' :height='groupType.size.y')
      defs
        linearGradient#blue(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#2e6aef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#611bea;stop-opacity:1')

        linearGradient#blue-reverse(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#611bea;stop-opacity:1')
          stop(offset='100%' style='stop-color:#2e6aef;stop-opacity:1')

        linearGradient#light-blue(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-20)')
          stop(offset='0%' style='stop-color:#06b8ef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#2e6aef;stop-opacity:1')

        linearGradient#light-blue-reverse(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-10)')
          stop(offset='0%' style='stop-color:#2e6aef;stop-opacity:1')
          stop(offset='100%' style='stop-color:#06b8ef;stop-opacity:1')

        linearGradient#purple(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-20)')
          stop(offset='0%' style='stop-color:#18202d;stop-opacity:1')
          stop(offset='100%' style='stop-color:#611bea;stop-opacity:1')

        linearGradient#amber(x1='10%' y1='20%' x2='100%' y2='20%' gradientTransform='rotate(-20)')
          stop(offset='0%' style='stop-color:#ffc91f;stop-opacity:1')
          stop(offset='100%' style='stop-color:#ffd45c;stop-opacity:1')

      g(v-for='arrow in groupType.arrows' :style='`opacity: ${arrow.opacity}; transform: scale(${arrow.scale}) translate(${arrow.offset.x}px, ${arrow.offset.y}px)`')
        path.arrow(:class='{beginning}' :fill='`url(#${arrow.color})`' :style='`animation-duration: ${arrow.animationDuration}s`' d='M712.3,266.5L519.4,405c-3,2.2-2.6,6.8,0.7,8.4l35.5,17c2.4,1.2,3.5,4.1,2.3,6.5L312.2,950.5c-1.2,2.4-0.1,5.4,2.3,6.5\
          l117.5,56.2c2.4,1.2,5.4,0.1,6.5-2.3l245.8-513.7c1.2-2.4,4.1-3.5,6.5-2.3l35.5,17c3.4,1.6,7.2-1,7-4.7l-13.2-237.1\
          C719.9,266.4,715.5,264.3,712.3,266.5z')

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'

@Component
export default class Arrows extends Vue {

  beginning = true

  @Prop({ default: 'smallGroup' }) readonly type!:
    | 'largeGroup'
    | 'smallGroup'
    | 'background'

  types: any = {
    largeGroup: {
      size: {
        x: 630,
        y: 650,
      },
      arrows: [
        {
          color: 'blue',
          offset: {
            y: -200,
            x: -190,
          },
          scale: 1,
          animationDuration: 10,
          opacity: 1,
        },
        {
          color: 'blue-reverse',
          offset: {
            y: 100,
            x: 150,
          },
          scale: 0.7,
          animationDuration: 8,
          opacity: 1,
        },
        {
          color: 'light-blue',
          offset: {
            y: -10,
            x: -390,
          },
          scale: 0.85,
          animationDuration: 6,
          opacity: 1,
        },
        {
          color: 'purple',
          offset: {
            y: 350,
            x: -100,
          },
          scale: 0.7,
          animationDuration: 7,
          opacity: 1,
        },
        {
          color: 'light-blue-reverse',
          offset: {
            y: 1000,
            x: 600,
          },
          scale: 0.4,
          animationDuration: 3,
          opacity: 1,
        },
      ],
    },
    smallGroup: {
      size: {
        x: 630,
        y: 650,
      },
      arrows: [
        {
          color: 'blue-reverse',
          offset: {
            y: -150,
            x: -150,
          },
          scale: 1,
          animationDuration: 20,
          opacity: .1,
        },
        {
          color: 'light-blue-reverse',
          offset: {
            y: 100,
            x: -350,
          },
          scale: .8,
          animationDuration: 20,
          opacity: .1,
        },
        {
          color: 'purple',
          offset: {
            y: 150,
            x: 150,
          },
          scale: 0.7,
          animationDuration: 7,
          opacity: 1,
        },
        {
          color: 'blue-reverse',
          offset: {
            y: 350,
            x: 150,
          },
          scale: 0.7,
          animationDuration: 8,
          opacity: 1,
        },
        {
          color: 'light-blue-reverse',
          offset: {
            y: 1000,
            x: 300,
          },
          scale: 0.4,
          animationDuration: 3,
          opacity: 1,
        },
      ],
    },
    background: {
      size: {
        x: 1630,
        y: 2050,
      },
      arrows: [
        {
          color: 'blue-reverse',
          offset: {
            y: -300,
            x: -500,
          },
          scale: 3.2,
          animationDuration: 25,
          opacity: .1,
        },
        {
          color: 'blue-reverse',
          offset: {
            y: -50,
            x: -250,
          },
          scale: 1.5,
          animationDuration: 20,
          opacity: .1,
        },
      ],
    },
    'background-accent': {
      size: {
        x: 1630,
        y: 2050,
      },
      arrows: [
        {
          color: 'amber',
          offset: {
            y: -300,
            x: -500,
          },
          scale: 3.2,
          animationDuration: 15,
          opacity: .05,
        },
        {
          color: 'amber',
          offset: {
            y: -200,
            x: -220,
          },
          scale: 2,
          animationDuration: 10,
          opacity: .07,
        },
      ],}
  }

  get groupType() {
    return this.types[this.type]
  }

  mounted() {
    this.beginning = false
  }
}
</script>

<style lang="scss">
// Angle ratio: -2.75
@keyframes bobble {
  0% {
    transform: translate(10px, -27.5px);
  }
  50% {
    transform: translate(0px, 0px);
  }
  100% {
    transform: translate(10px, -27.5px);
  }
}
.arrow {
  position: relative;
  animation: bobble 10s infinite cubic-bezier(0.645, 0.045, 0.355, 1.000);
  animation-delay: 3s;
  transition: all 3s cubic-bezier(.1,.57,.4,1);
  transform: translate(10px, -27.5px);

  &.beginning {
    transform: translate(-250px, 687.5px) !important;
  }
}
</style>
