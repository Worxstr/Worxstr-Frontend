import Vue from 'vue';
import Vuetify, { colors } from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#3b7bef',
                secondary: colors.amber.base,
            },
            dark: {
                primary: '#3b7bef',
                secondary: colors.amber.base,
            },
        },
    },
});
