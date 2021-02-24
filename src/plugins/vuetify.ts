import Vue from 'vue';
import Vuetify from 'vuetify/lib';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: '#3b7bef',
                // primary: '#449fea',
                // secondary: '#b0bec5',
            },
        },
    },
});
