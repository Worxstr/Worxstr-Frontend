import Vue from 'vue';
import Vuetify, { colors } from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        options: { customProperties: true },
        themes: {
            light: {
                primary: '#2e6aef',
                secondary: '06baef',
                tertiary: '#611bea',
                accent: '#ffc91f',
                // background: '#fff'
            },
            dark: {
                primary: '#3b7bef',
                secondary: '06baef',
                tertiary: '#611bea',
                accent: '#ffc91f',
                // background: '#000'
            },
        },
    },
});
